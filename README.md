# Website

A small static website: four pages, no build step, no frameworks. Open
`index.html` in a browser and it works. Anyone can host it for free.

---

## 1. Edit the words and the products

Everything you would want to change lives in **one file**:

    data/site-data.js

Open it in any text editor. The top half is the business name, tagline,
about text and contact details. The bottom half is the list of products.
Save the file, refresh the page in the browser, and the change is there.

Anything still saying `REPLACE ME` has not been filled in yet.

If prices should not be in US dollars, change the `currency` line near the
top to `"GBP"`, `"EUR"`, `"CAD"`, `"AUD"` or whichever applies — the prices
stay plain numbers and the right symbol is added for you.

To add a product, copy one block and change the values:

```js
{
  id: "lavender-candle",       // must be unique
  name: "Lavender Candle",
  image: "lavender-candle",    // file name from images/products/, no extension
  price: 18.00,                // or null to show "Enquire for price"
  status: "available",         // "available" | "sold" | "made-to-order"
  blurb: "Hand poured, burns about 40 hours.",
  description: "The longer text shown when someone opens the item.",
  details: ["Soy wax", "220ml", "Burn time ~40 hours"]
},
```

Commas matter: every block needs a comma after its closing `}` except the
last one. If the page ever goes blank, that is almost always the cause —
press F12 in the browser and the console will name the line.

---

## 2. Turn the raw photos into product photos

Put the original photos — straight off a phone is fine — into:

    images/raw/

Then run, from this folder:

    pip install Pillow numpy pillow-heif
    python3 scripts/process_photos.py

For each photo it corrects the rotation, removes a plain background,
crops to the item, fixes the colour cast, and places it centred on a
square white backdrop with a soft shadow. It writes web-sized `.jpg` and
`.webp` files into `images/products/` and then prints the product blocks
ready to paste into `data/site-data.js`.

Useful options:

| Option | What it does |
| --- | --- |
| `--dry-run` | Report what it would do, write nothing |
| `--bg "#f2ede6"` | Use a different backdrop colour instead of white |
| `--no-knockout` | Keep the original background |
| `--force-knockout` | Remove the background even if the backdrop looks busy |
| `--no-shadow` | No drop shadow |
| `--padding 0.12` | More space around the item (default `0.08`) |
| `--tolerance 45` | Remove more background; raise if bits are left behind |

### Getting good results

The script decides for itself whether the background is plain enough to
remove, and leaves the photo alone when it is not — a kept background is
better than a damaged item. So the photos that come out best are:

- Shot against something plain: a sheet, a wall, a large piece of paper.
  It handles a backdrop that is brighter at one end than the other.
- Lit by a window rather than by the overhead light.
- Taken reasonably close. If it says `low detail (4.9x enlarged)`, the
  item was small in the frame and the result will look soft — step closer
  and reshoot.
- Not the same colour as the backdrop. A white mug on a white sheet has
  no edge to find; use a grey or coloured background for it.

If one photo comes out wrong, fix that photo on its own:

    python3 scripts/process_photos.py --in images/raw/just-this-one --tolerance 50

`images/raw/` is deliberately excluded from git — the originals are large
and only the processed versions are needed on the website. Keep the
originals backed up somewhere.

---

## 3. Make the contact form actually send

Out of the box the form opens the visitor's own email app with the
message filled in. That works everywhere and needs no account, but the
visitor has to press send themselves.

To have messages arrive by email directly, sign up for a free form
service (Formspree, Web3Forms and Basin all have free tiers), and put the
address it gives you into `data/site-data.js`:

```js
formEndpoint: "https://formspree.io/f/xxxxxxxx",
```

The form posts there and shows a thank-you message. If the service is
ever down it falls back to showing the email address.

---

## 4. Put it online

The files are plain HTML — any static host will do, all of these free:

- **Netlify** or **Vercel** — drag the folder onto their dashboard.
- **GitHub Pages** — in the repository, Settings → Pages → deploy from
  the `main` branch. The site appears at `username.github.io/repo-name`.
- **Cloudflare Pages** — connect the repository, no build command.

A custom domain (about $12/year) can be pointed at any of them.

---

## Before it goes live

- [ ] Replace every `REPLACE ME` in `data/site-data.js`
- [ ] Replace the `<meta name="description">` line in each `.html` file
- [ ] Replace `assets/favicon.svg` with a real logo
- [ ] Check the site on a phone as well as a computer
- [ ] If anything is actually sold online, or any personal data is
      collected, check what your country requires — see the note below

## A note on the legal side

This repository does not include a privacy policy, terms of sale or
returns policy, because what they must say depends on where the business
is, what it sells and who it sells to. The contact form sends a name,
an email address and a message, which in most places counts as personal
data and needs at minimum a line saying what happens to it.

If there is policy text already written, put it in a new `privacy.html`
and `terms.html` alongside the other pages, and set `showPrivacy` and
`showTerms` to `true` in `data/site-data.js`. For anything binding —
refunds, liability, taxes on sales — it is worth a conversation with
someone qualified in your jurisdiction rather than a template.

## File map

    index.html            Home page
    shop.html             All products
    about.html            About
    contact.html          Contact details and form
    data/site-data.js     >>> all the text and products live here <<<
    css/styles.css        Styling, colours at the very top
    js/main.js            Page behaviour
    scripts/process_photos.py   Photo processing
    images/raw/           Put original photos here (not committed)
    images/products/      Processed photos, written by the script
