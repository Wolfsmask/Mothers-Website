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

## Studio mode: putting an item on a clean backdrop

`--studio` cuts the item out using a segmentation model, which understands
what an object is rather than matching background colours. It turns a
cluttered basement photo into an item on a clean white backdrop.

    python3 scripts/process_photos.py --in images/raw --out assets/rentals \
        --studio --lift

`--lift` brightens a photo taken in a dark room. It works on its own too, so a
photo that keeps its background still gets opened up.

### You have to look at every result

This is the important part. The model sometimes removes **part of the item**,
and there is no way to detect it automatically -- that was tested. The
measurements that look like they should catch it do not: the vintage plate
came out cut in half while scoring better on every geometric check than the
pumpkin basket, which came out perfect.

So: run it, then open the output folder and look at each photo. If an item is
missing a piece, the photo needs a different treatment.

### When a cut-out loses part of the item

Two things to try, in this order:

1. **A different model.** `--model isnet-general-use` handles flat and graphic
   objects better than the default. On the photo of the tables, the default
   dropped the wooden table entirely and this one kept all three items.
2. **Drop `--lift`.** Brightening happens before the cut-out, and it changes
   what the model sees. The same tables photo lost the wooden table again with
   `--lift` on, and kept it with `--lift` off.

If neither works, use `--no-knockout --lift` instead. The background stays, but
the photo is still brightened, straightened and cropped, and the item is
whole. Of the seventeen photos on the site, six are done this way, because
both models clipped them: the plates, the floor mat, the photo booth props,
the plastic table covers and the coconut cups.

An honest photo with a dull background beats a clean cut-out with a bite
taken out of the item.

---

## Rescuing a photo you cannot retake

Sometimes an item is packed away or the photo is the only one there is. A
photo can often be salvaged by cutting the distractions out first.

The Halloween pumpkin basket on the site was done this way. The original had a
hand holding it at the top, a doorframe down the right, and a dark wall sign in
the corner. Cropping those away left a usable photo of the basket.

Open the photo in any viewer that shows pixel coordinates, note where the item
starts and ends, and pass those numbers in:

    python3 scripts/process_photos.py --in images/raw --out assets/rentals \
        --crop 105 235 1370 1575

The four numbers are pixels from the top-left corner: left, top, right,
bottom. Use `0` for right or bottom to mean "all the way to the edge". It
applies to every photo in the folder, so do salvage jobs one at a time, in a
folder of their own.

If something dark intrudes from a corner -- a wall sign, a dark doorway --
it can be painted out and the wall rebuilt behind it:

    python3 scripts/process_photos.py --in images/raw --out assets/rentals \
        --crop 108 240 1403 1613 --erase-corner top-left

Only the dark area actually joined to that corner is touched. That matters:
the first version of this simply erased dark pixels near the corner, and ate
part of the basket along with the sign. The item is separated from the
intruder by wall, so starting at the corner reaches the sign and stops.

What cropping can fix: a hand, a doorframe, another object in shot, too much
empty space around a small item.

What it cannot fix: an item still inside a plastic bag, a photo too dark to
show the colours, or a background so cluttered it runs behind the item. Those
need the item taking out and photographing again.

---

## One thing that must not go on the site

Among the inventory photos was an image of wire chafer racks carrying an
**"AI-generated content"** watermark in the corner. That picture was made or
altered by an AI tool, so it does not show the actual racks.

It cannot go on the site. Using a generated image to show real rental stock
misrepresents what a customer is booking, and the watermark makes it obvious.
A quick real photo of the actual racks replaces it.
