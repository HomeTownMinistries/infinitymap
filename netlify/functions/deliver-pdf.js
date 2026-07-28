// Serves a personalized copy of the Infinity Map PDF after a successful
// Stripe purchase: fills the "Prepared For" field with the buyer's name,
// and stamps their email + a short order reference into (invisible) PDF
// metadata so a leaked/forwarded copy is traceable back to the purchase.
//
// Called as:
//   /.netlify/functions/deliver-pdf?product=essentials&session_id={CHECKOUT_SESSION_ID}
//   /.netlify/functions/deliver-pdf?product=legacy&session_id={CHECKOUT_SESSION_ID}
//
// The {CHECKOUT_SESSION_ID} placeholder must be set as the Payment Link's
// "after payment" redirect so Stripe fills it in automatically -- see
// README/HANDOFF for the exact dashboard steps.

const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');
const { PDFDocument, TextAlignment } = require('pdf-lib');

const PRODUCTS = {
  essentials: {
    file: 'Infinity_Map_Essentials.pdf',
    downloadName: 'Infinity_Map_Essentials.pdf',
    priceEnvVar: 'STRIPE_PRICE_ESSENTIALS',
  },
  legacy: {
    file: 'Infinity_Map_Legacy.pdf',
    downloadName: 'Infinity_Map_Legacy.pdf',
    priceEnvVar: 'STRIPE_PRICE_LEGACY',
  },
};

function findBundledFile(fileName) {
  // Netlify's `included_files` bundling places repo-root-relative files
  // alongside the function at deploy time, but the exact base directory
  // varies by bundler/runtime version -- so try a few plausible locations
  // instead of hard-coding one.
  const candidates = [
    path.join(__dirname, '..', '..', 'files', fileName),
    path.join(__dirname, 'files', fileName),
    path.join(process.cwd(), 'files', fileName),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Bundled PDF not found for ${fileName}. Checked: ${candidates.join(', ')}`);
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const product = params.product;
  const sessionId = params.session_id;

  if (!product || !PRODUCTS[product]) {
    return { statusCode: 400, body: 'Unknown or missing product.' };
  }
  if (!sessionId || sessionId.startsWith('{')) {
    // The literal placeholder wasn't substituted -- most likely someone
    // opened the download page directly without going through Stripe.
    return {
      statusCode: 400,
      body: 'Missing checkout session. Please use the link from your purchase confirmation, or email michael@hometownministries.com.',
    };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not configured.');
    return { statusCode: 500, body: 'Delivery is temporarily unavailable. Please email michael@hometownministries.com.' };
  }
  const stripe = new Stripe(stripeKey);

  const productConfig = PRODUCTS[product];

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });
  } catch (err) {
    console.error('Stripe session lookup failed:', err.message);
    return { statusCode: 403, body: 'We could not verify this purchase. Please email michael@hometownministries.com.' };
  }

  if (session.payment_status !== 'paid') {
    return { statusCode: 403, body: 'This purchase has not completed payment yet.' };
  }

  // Best-effort defense against reusing a valid session_id from one
  // product's checkout to fetch a different (e.g. more expensive)
  // product's file. Only enforced once the matching price env var is
  // configured -- see README for how to fill these in from the Stripe
  // dashboard once the Payment Links exist.
  const expectedPriceId = process.env[productConfig.priceEnvVar];
  if (expectedPriceId) {
    const purchasedPriceIds = (session.line_items?.data || []).map((li) => li.price?.id);
    if (!purchasedPriceIds.includes(expectedPriceId)) {
      console.warn(`Session ${sessionId} did not purchase expected price for ${product}.`);
      return { statusCode: 403, body: 'This purchase does not match the requested product.' };
    }
  }

  const buyerName = session.customer_details?.name || '';
  const buyerEmail = session.customer_details?.email || '';

  const sourcePath = findBundledFile(productConfig.file);
  const pdfBytes = fs.readFileSync(sourcePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  try {
    const form = pdfDoc.getForm();
    const field = form.getTextField('prepared_for_name');
    field.setAlignment(TextAlignment.Center);
    if (buyerName) field.setText(buyerName);
  } catch (err) {
    console.warn('Could not fill prepared_for_name field:', err.message);
  }

  // Invisible traceability metadata -- not shown on any page, but present
  // in the file's document properties if a forwarded copy ever needs
  // tracing back to a purchase.
  pdfDoc.setSubject(`Order ${sessionId} · ${buyerEmail}`.trim());
  pdfDoc.setKeywords([sessionId, buyerEmail].filter(Boolean));

  const outBytes = await pdfDoc.save();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${productConfig.downloadName}"`,
      'Cache-Control': 'no-store',
    },
    body: Buffer.from(outBytes).toString('base64'),
    isBase64Encoded: true,
  };
};
