/* ==========================================================================
   SITE CONTENT — this is the only file you need to edit for text & products.
   No build step, no code knowledge required. Edit, save, refresh the page.

   It is a .js file (not .json) on purpose: browsers block fetch() of local
   .json files when you open the site by double-clicking index.html, but a
   plain <script> works everywhere.
   ========================================================================== */

window.SITE = {
  // ---- TODO: replace every "REPLACE ME" with the real details -------------
  name: "REPLACE ME — Company Name",
  tagline: "REPLACE ME — one short line about what she makes or does.",
  intro:
    "REPLACE ME — two or three sentences for the front page. What the " +
    "business is, what makes it different, and who it is for.",

  about: {
    heading: "About us",
    body: [
      "REPLACE ME — the story. How the business started, and why.",
      "REPLACE ME — a second paragraph: materials, process, or what customers can expect."
    ]
  },

  // Currency for prices, as a 3-letter code: "USD", "GBP", "EUR", "CAD", "AUD"...
  currency: "USD",

  contact: {
    email: "REPLACE ME — hello@example.com",
    phone: "",              // optional — leave "" to hide
    location: "",           // optional — e.g. "Ships from Ohio"
    // Optional social links. Leave a value as "" to hide that link.
    instagram: "",
    facebook: "",
    etsy: ""
  },

  // Where the contact form sends to. See README.md — until this is set the
  // form falls back to opening the visitor's email app, which always works.
  formEndpoint: "",

  // Shown in the footer.
  legal: {
    // REPLACE ME — if her Google Doc has policy text, paste it into the
    // matching page in /legal/ and set these to true to link them.
    showPrivacy: false,
    showTerms: false
  }
};

/* --------------------------------------------------------------------------
   PRODUCTS
   One entry per item. Copy a block to add another.

   image   – the file name produced by scripts/process_photos.py, which writes
             into images/products/. Use the base name WITHOUT an extension;
             the page picks .webp or .jpg automatically.
   price   – a number, or null for "Enquire for price".
   status  – "available" | "sold" | "made-to-order"
   -------------------------------------------------------------------------- */

window.PRODUCTS = [
  {
    id: "example-1",
    name: "REPLACE ME — Product name",
    // Base name of the file in images/products/, without the extension,
    // e.g. "lavender-candle". Left empty here so the placeholder shows.
    image: "",
    price: 24.0,
    status: "available",
    blurb: "REPLACE ME — one line that shows in the grid.",
    description:
      "REPLACE ME — the longer description shown when someone opens the item. " +
      "Size, materials, care instructions, how long it takes to make.",
    details: ["REPLACE ME — e.g. 100% cotton", "REPLACE ME — e.g. 12cm x 8cm"]
  }
];
