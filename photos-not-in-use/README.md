# Photos currently not on the website

These are the 30 processed rental photos. They have been taken off the site
for now, but nothing has been lost — every one of them is still listed against
its item in `assets/site-config.js`, so putting them back is two steps.

## To put them back

1. Move the `rentals` folder from here back to `assets/rentals`
   (so the files sit at `assets/rentals/cake-toppers.webp` and so on).
2. In `assets/site-config.js`, change:

   ```js
   showPhotos: false,
   ```

   to:

   ```js
   showPhotos: true,
   ```

That is all. Every item picks its photos back up automatically, including the
eleven table-cover colours that share one preview.

## To take them off again

Set `showPhotos: false`. The files can stay where they are; the switch alone
hides them.

## What is in here

Each photo comes in three sizes and two formats, which is why there are so
many files. The website picks the right one by itself.

- `name.webp` / `name.jpg` — full size, used in the pop-up preview
- `name@800.*` — medium
- `name@400.*` — the small thumbnail in the catalog list

The originals these were made from are **not** here. They are in
`images/raw/`, which is deliberately kept out of git because the files are
large. Keep a backup of those somewhere — they are what any future reprocessing
starts from.

## If they need redoing

`PHOTO-GUIDE.md` in the main folder explains how they were made and how to
process new ones. Five of them were flagged as worth retaking, because the item
runs off the edge of its own photograph: both plates, the coconut cups, the
floor mat and the photo booth props.
