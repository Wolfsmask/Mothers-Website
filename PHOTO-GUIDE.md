# Taking the rental photos

The catalog is built and waiting. Every item has a slot for a photo; the ones
without a photo show as plain text, which looks fine, so photos can be added a
few at a time rather than all at once.

This is a short guide because the inventory photos taken so far were mostly
taken in a dark basement, with items still in their bags, and a hand holding
them. Those are perfect for *recording* what is in stock, but they will not
sell anything. Re-shooting is much quicker than it sounds — most of these can
be done in one afternoon.

---

## The setup

You need three things, none of which cost money:

1. **A window.** Daylight, not the overhead light. Overhead bulbs make
   everything yellow and cast a shadow straight down onto the item.
2. **Something plain to put the item on.** A white bedsheet, a large piece of
   poster board, or a plain wall. Curve it up behind the item if you can, so
   there is no hard line where the table meets the wall.
3. **Your phone.**

Set up so the window is *in front of* the item, lighting it, with you standing
between. Not behind it — that turns the item into a silhouette.

## Taking the shot

- **Take the item out of the bag.** A plate inside a ziplock photographs as a
  ziplock. This is the single biggest improvement available.
- **Put it down.** No hands in the photo. If it has to be held up, hang it or
  prop it against something.
- **Fill the frame.** Get close enough that the item takes up most of the
  picture. If it ends up small and far away, the software has to enlarge it
  and it goes soft.
- **One item, or one matched set, per photo.** A stack of five different
  plates is one photo of a pile. Five plates is five photos.
- **Shoot straight on**, at the item's own height, not down at it from
  standing.
- **Tap the item on the screen** before taking the picture, so the phone
  focuses and exposes for the item rather than the background.
- **Take two or three of each** and pick the best later. It costs nothing.

## Things that need a different approach

- **The light-up signs.** These already photograph well — the existing shots
  of "Oh Baby", "You + Me" and "Will You Marry Me" are genuinely good, because
  a lit sign against a dark background is exactly right. Keep doing those the
  same way. Do not put those on a white sheet; they will look worse.
- **Tables, chairs and the fire pit.** Too big for a sheet. Photograph these
  outside on a clear day, against a plain wall or open ground, with nothing
  cluttered behind them.
- **Anything shiny** (the chafer pans, glassware). Shiny things mirror the
  room. Shoot them near the window but not in direct sun, and step slightly to
  one side so your reflection is not in them.

## Then

Put the photos in `images/raw/` and run, from the project folder:

    python3 scripts/process_photos.py --out assets/rentals

It will straighten them, remove plain backgrounds, crop them to the item,
correct the colour, and put each one centred on a clean square background. It
then prints the lines to paste into `assets/site-config.js`.

If it says **`low detail (4.9x enlarged)`**, that photo was taken too far
away — worth a retake.

If it says **`busy background, kept`**, it decided the background was too
cluttered to remove safely and left the photo alone. That is the software
being careful rather than wrecking the picture, but it means that photo needs
re-shooting against something plain.

---

## One thing that must not go on the site

Among the inventory photos was an image of wire chafer racks carrying an
**"AI-generated content"** watermark in the corner. That picture was made or
altered by an AI tool, so it does not show the actual racks.

It cannot go on the site. Using a generated image to show real rental stock
misrepresents what a customer is booking, and the watermark makes it obvious.
A quick real photo of the actual racks replaces it.
