window.UNTAMED_CONFIG = {
  businessName: "Untamed Entertainment LC",
  ownerName: "",
  serviceArea: "Based in Liberty, Missouri • Serving Liberty and the Kansas City area",

  // Add real contact details before launch. Blank values are never shown.
  email: "bjolleenm@gmail.com",
  phone: "(913) 777-4929",

  // Add real profile URLs. Blank links remain hidden.
  facebook: "",
  instagram: "",
  pinterest: "",
  googleBusinessProfile: "",
  googleReviewUrl: "",

  // Add your real GA4 Measurement ID after creating Analytics, e.g. G-XXXXXXXXXX.
  // Analytics will not load while this is blank.
  gaMeasurementId: "",

  // Add only genuine client testimonials.
  testimonials: [
    // { quote: "Real client quote", name: "Client Name", context: "Wedding • Liberty, MO" }
  ],

  // Enter real starting prices only after rates are finalized.
  // Cards with no real price stay hidden.
  startingPrices: [
    // { service: "Day-of Coordination", price: "$___", note: "Starting at" }
  ],

  // RENTAL CATALOG
  // Transcribed from the handwritten inventory sheets. See INVENTORY.md for
  // the readings that still need confirming.
  //
  // Each item may carry an "image": the base name of a processed photo in
  // assets/rentals/, without the extension. Items with no image show as a
  // clean text entry, so the catalog stays presentable while photos are
  // still being taken. Set "hidden: true" on anything not actually for rent.
  rentals: [
    {
      category: "Tables & Seating",
      blurb: "The basics, plus the covers to go over them.",
      items: [
        { name: "Rectangle tables", detail: "3ft, 6ft and 8ft", image: "" },
        { name: "Folding chairs", detail: "", image: "" },
        { name: "Risers", detail: "Two sets available", image: "" }
      ]
    },
    {
      category: "Linens & Table Covers",
      blurb: "Fabric and disposable, in plain colours and seasonal prints.",
      items: [
        { name: "Fabric tablecloths", detail: "Royal blue, peach, white, Halloween", image: "" },
        { name: "Plastic table covers", detail: "White stay-on, patriotic, Halloween, confetti", image: "" }
      ]
    },
    {
      category: "Tableware",
      blurb: "Plates and glassware by theme, for when paper will not do.",
      items: [
        { name: "Themed plates", detail: "Vintage, Christmas tree, sunflower, pumpkin, bees, plaid", image: "" },
        { name: "Glassware", detail: "Shot, champagne, lemon, bee, pumpkin and stemmed glasses", image: "" },
        { name: "Pineapple & coconut cups", detail: "", image: "" },
        { name: "Mugs", detail: "Red and blue", image: "" }
      ]
    },
    {
      category: "Catering & Serving",
      blurb: "Chafer sets for keeping food hot on a buffet line.",
      items: [
        { name: "Sterno chafer sets", detail: "Seven available. Rack, fuel, water pan, food pan and lid. Instructions included", image: "" },
        { name: "Chafer add-ons", detail: "Extra fuel cans and serving ladles", image: "" },
        { name: "Drink station dispensers", detail: "Labelled for lime juice, sugar and salt", image: "" },
        { name: "Clear buckets", detail: "Small, medium and large", image: "" }
      ]
    },
    {
      category: "Signs & Lighting",
      blurb: "Light-up signs, hanging signs and the cords to run them.",
      items: [
        { name: "Light-up signs", detail: "Oh Baby, Will You Marry Me, You + Me, Love, Be Happy", image: "" },
        { name: "Hanging signs", detail: "Happy Birthday, Graduation, Anniversary", image: "" },
        { name: "Direction arrows", detail: "Stake into the ground", image: "" },
        { name: "Positive quote signs", detail: "\u201CDo what you love\u201D, \u201CBe the change\u201D", image: "" },
        { name: "Rope light", detail: "White", image: "" },
        { name: "Extension cords", detail: "Single, multi-socket and 3-plug", image: "" }
      ]
    },
    {
      category: "Decor & Backdrops",
      blurb: "For the photo corner and the focal points.",
      items: [
        { name: "Backdrops", detail: "", image: "" },
        { name: "Photo station set", detail: "Camera and prints not included", image: "" },
        { name: "Photo booth props", detail: "", image: "" },
        { name: "Wood clip board for pictures", detail: "", image: "" },
        { name: "Boxed paper letters", detail: "Spelling ONE, and Wild One, for first birthdays", image: "" },
        { name: "Seasonal decor", detail: "Including a Halloween pumpkin basket", image: "" },
        { name: "Vases", detail: "Small, medium and large", image: "" },
        { name: "Wood crates", detail: "Three-pack: large, medium, small", image: "" },
        { name: "Tea light candles", detail: "Electric and real flame", image: "" },
        { name: "Cake and cupcake toppers", detail: "", image: "" }
      ]
    },
    {
      category: "Fun & Experiences",
      blurb: "The parts of an event people remember.",
      items: [
        { name: "Cotton candy machine", detail: "Staffed on site. Customer provides the ingredients", image: "" },
        { name: "Bubble machine", detail: "Bubble liquid available", image: "" },
        { name: "Red carpet roll-out", detail: "", image: "" },
        { name: "Fire pit", detail: "With fire starters, wood and a s\u2019mores kit", image: "" }
      ]
    },
    {
      category: "Games",
      blurb: "Indoor and outdoor, for all ages.",
      items: [
        { name: "Outdoor games", detail: "Cornhole, ring toss, wiffle ball, badminton, volleyball, basketball hoop", image: "" },
        { name: "Water games", detail: "Water balloons and sprinklers", image: "" },
        { name: "Board & card games", detail: "Checkers, Connect Four, card decks", image: "" },
        { name: "Floor games", detail: "Large floor mat game", image: "" },
        { name: "Kids' activities", detail: "Cardboard building blocks, building bricks, colouring, foam mat puzzle", image: "" },
        { name: "Karaoke machine", detail: "Small, with discs", image: "" }
      ]
    },
    {
      category: "Practical Extras",
      blurb: "The things nobody thinks about until the day.",
      items: [
        { name: "Fans", detail: "Neck, box and table", image: "" },
        { name: "Mini fridge", detail: "", image: "" },
        { name: "TV with DVD player", detail: "Games console provided by the customer", image: "" }
      ]
    }
  ],

  // Add approved real event photos here after placing WebP images in /assets/gallery/.
  gallery: [
    // { src: "assets/gallery/event-01.webp", alt: "Real description of the event" }
  ]
};