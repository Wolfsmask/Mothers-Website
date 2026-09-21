# Untamed Entertainment LC — website

A static multi-page site. No build step and no dependencies: the pages open
straight from disk and can be hosted free on any static host.

- `README.txt` — how to open the site locally in VS Code.
- `NEXT-STEPS.md` — the launch checklist and what real information is still
  needed before going live.
- This file — how to edit content, and how to prepare photos.

---

## Editing content

Almost everything that needs real information lives in **one file**:

    assets/site-config.js

Business name, owner name, email, phone, social links, the Google Analytics
ID, testimonials, starting prices and the gallery all come from there. The
site deliberately **hides anything left blank** rather than showing a
placeholder — so an empty `instagram` means no Instagram link appears, and
an empty `testimonials` list means the whole testimonials section is gone.
Fill a value in and the section appears by itself.

Page wording lives in the `.html` files directly.

---

## Seeing what people look at

`ANALYTICS.md` covers setting up free Google Analytics: which tabs get
visited, how long people stay, and which rental items they open for a closer
look. The code is already in place and does nothing until a Measurement ID is
added to `assets/site-config.js`.

## The rental catalog

`rentals.html` builds itself from the `rentals` list in
`assets/site-config.js`. Each category holds a list of items, and each item
may name a photo. Items with no photo show as a clean text entry, so photos
can be added a few at a time without the page ever looking half-finished.

Set `hidden: true` on any item or category that is not currently for rent,
rather than deleting it, so it can be brought back later.

**Photos and previews.** An item with a photo becomes clickable: visitors get
a larger preview with the name and details before they enquire. Give an item
one photo with `image: "file-name"`, or several with
`images: ["front", "back", "in-use"]`, and the preview gains thumbnails to
switch between them. Items with no photo stay as plain text entries.

## The top navigation

The nav is repeated in every `.html` file. To change it, edit one file and
copy the `<nav aria-label="Main navigation">` block into the others, or the
links will disagree between pages. The Events dropdown is the `nav-dropdown`
list item; adding an event type means adding a link there and creating the
matching page.

See `INVENTORY.md` for the full transcribed stock list and the readings that
still need confirming, and `PHOTO-GUIDE.md` for how to shoot the photos.

## Adding photos

Put the original photos — straight off a phone is fine — into `images/raw/`,
then run from this folder:

    pip install Pillow numpy pillow-heif
    python3 scripts/process_photos.py

For each photo it corrects the rotation, removes a plain background, crops to
the item, fixes the colour cast, and places it centred on a square backdrop
with a soft shadow. It writes web-sized `.webp` and `.jpg` into
the chosen output folder, then prints entries ready to paste into
`assets/site-config.js`. For catalog photos use
`--out assets/rentals`; for event photos leave the default. Replace each blank `alt` with a real description of
the photo — that text is what a blind visitor hears, and what Google reads.

Useful options:

| Option | What it does |
| `--studio` | Cut the item out and place it on a clean backdrop |
| `--lift` | Brighten a photo taken in a dark room |
| `--model isnet-general-use` | A second segmentation model, better on flat objects |
| --- | --- |
| `--dry-run` | Report what it would do, write nothing |
| `--bg "#f7eee1"` | Backdrop colour (the site's cream, instead of white) |
| `--no-knockout` | Keep the original background |
| `--force-knockout` | Remove the background even if the backdrop looks busy |
| `--no-shadow` | No drop shadow |
| `--padding 0.12` | More space around the item (default `0.08`) |
| `--tolerance 45` | Remove more background; raise if bits are left behind |

### Getting good results

The script decides for itself whether the background is plain enough to
remove, and leaves the photo alone when it is not — a kept background beats a
damaged item. Photos that come out best are:

- Shot against something plain: a sheet, a wall, a large piece of paper. A
  backdrop that is brighter at one end than the other is fine.
- Lit by a window rather than the overhead light.
- Taken reasonably close. If it reports `low detail (4.9x enlarged)`, the item
  was small in the frame and will look soft — step closer and reshoot.
- Not the same colour as the backdrop. A white vase on a white sheet has no
  edge to find; use a coloured background for it.

`images/raw/` is excluded from git — the originals are large and only the
processed versions are needed. Keep the originals backed up somewhere.

---

## Hosting

The files are plain HTML, so any static host works, all free:

- **Netlify** or **Vercel** — drag the folder onto their dashboard.
- **GitHub Pages** — Settings → Pages → deploy from the branch.
- **Cloudflare Pages** — connect the repository, no build command.

A custom domain (about $12/year) can be pointed at any of them. Once the
domain is final, generate `sitemap.xml` with absolute URLs and add a
`Sitemap:` line to `robots.txt` — see `NEXT-STEPS.md`.

---

## File map

    index.html              Home, including the FAQ and inquiry form
    services.html           Service overview
    events.html             Events hub, linked from the Events dropdown
    weddings.html           Wedding landing page
    birthdays.html          Birthday parties
    baby-showers.html       Baby showers
    graduations.html        Graduations
    anniversaries.html      Anniversaries
    corporate.html          Corporate and business events
    themed-events.html      Themed events
    bartending.html         Bartending landing page
    coordination.html       Coordination landing page
    entertainment.html      Entertainment landing page
    rentals.html            Rentals catalog
    gallery.html            Gallery (hidden until real photos are added)
    about.html              About
    privacy.html            Privacy policy
    terms.html              Terms
    404.html                Not-found page
    assets/site-config.js   >>> real business information goes here <<<
    assets/site.css         Styling, colours at the very top
    assets/site.js          Page behaviour
    scripts/process_photos.py   Photo processing
    images/raw/             Put original photos here (not committed)
    assets/rentals/         Catalog item photos
    assets/gallery/         Event photos
