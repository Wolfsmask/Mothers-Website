#!/usr/bin/env python3
"""
process_photos.py — turn ordinary phone snapshots into clean, consistent
product photos for the website.

For each image in images/raw/ it will:

  1. Respect the EXIF rotation flag (stops photos appearing sideways).
  2. Detect a plain background and knock it out, if it is confident.
  3. Crop tight to the item, then re-pad it evenly.
  4. Correct the white balance and lift contrast and saturation slightly.
  5. Place it centred on a square studio background with a soft shadow.
  6. Write web-sized .jpg and .webp files into images/products/.

Usage
-----
    python3 scripts/process_photos.py                 # process everything
    python3 scripts/process_photos.py --no-knockout   # keep original background
    python3 scripts/process_photos.py --bg "#f2ede6"  # different backdrop
    python3 scripts/process_photos.py --dry-run       # report, write nothing

The output base name comes from the input file name, lowercased and
hyphenated: "Blue Vase 2.JPG" -> "blue-vase-2". Put that base name in the
"image" field in data/site-data.js.
"""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
except ImportError:
    sys.exit(
        "Missing dependencies. Install them with:\n"
        "    pip install Pillow numpy pillow-heif"
    )

# Optional: lets Pillow open .heic files straight off an iPhone.
try:
    import pillow_heif

    pillow_heif.register_heif_opener()
    HEIC_OK = True
except ImportError:
    HEIC_OK = False

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "images" / "raw"
OUT_DIR = ROOT / "assets" / "gallery"

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tif", ".tiff", ".bmp"}

# Output widths. The first is the main image; the rest are for smaller screens.
DEFAULT_SIZES = [1600, 800, 400]

# Work at this size while computing the background mask — keeps the flood fill
# fast on large photos without noticeably changing the result.
MASK_WORK_SIZE = 700


# --------------------------------------------------------------------------
# naming
# --------------------------------------------------------------------------

def slugify(name: str) -> str:
    """'Blue Vase #2.JPG' -> 'blue-vase-2'"""
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = name.lower()
    name = re.sub(r"[^a-z0-9]+", "-", name)
    name = name.strip("-")
    return name or "item"


# --------------------------------------------------------------------------
# background detection and removal
# --------------------------------------------------------------------------

# Local detail in the border band, above which a backdrop counts as busy.
# Measured values: paper sweep 0.0, lit sweep with a gradient 0.0, plain wall
# with noise 1.0, wood grain 13.0.
PLAIN_BACKGROUND_MAX_DETAIL = 5.0


def background_is_plain(img: Image.Image) -> bool:
    """
    True when the border of the photo looks like a single uncluttered backdrop.

    Measures local detail -- how far the border strays from its own blurred
    self -- rather than the overall spread of its colours. A lit backdrop is
    usually brighter at the top than the bottom, and that gradient makes the
    spread large while the surface is still perfectly plain; grain, tiles and
    clutter show up as local detail instead. Judging by spread would decline
    the very backdrops this works best on.
    """
    small = img.convert("RGB").copy()
    small.thumbnail((MASK_WORK_SIZE, MASK_WORK_SIZE), Image.LANCZOS)

    detail = ImageChops.difference(small, small.filter(ImageFilter.GaussianBlur(6)))
    arr = np.asarray(detail, dtype=np.float32).mean(axis=2)

    h, w = arr.shape
    band = max(2, min(h, w) // 12)
    border = np.concatenate([
        arr[:band].ravel(), arr[-band:].ravel(),
        arr[:, :band].ravel(), arr[:, -band:].ravel(),
    ])

    # 90th percentile, so a few hot pixels or a speck of dust do not count as
    # clutter, but a patterned surface does.
    return float(np.percentile(border, 90)) < PLAIN_BACKGROUND_MAX_DETAIL


def estimate_background_colour(img: Image.Image) -> tuple[int, int, int]:
    arr = np.asarray(img.convert("RGB"), dtype=np.float32)
    h, w = arr.shape[:2]
    band = max(2, min(h, w) // 25)
    border = np.concatenate([
        arr[:band, :, :].reshape(-1, 3),
        arr[-band:, :, :].reshape(-1, 3),
        arr[:, :band, :].reshape(-1, 3),
        arr[:, -band:, :].reshape(-1, 3),
    ])
    med = np.median(border, axis=0)
    return tuple(int(round(v)) for v in med)  # type: ignore[return-value]


def build_subject_mask(img: Image.Image, tolerance: int) -> Image.Image | None:
    """
    Return an 'L' mask the same size as `img`: 255 on the item, 0 on the
    backdrop. Returns None when the result does not look trustworthy, so the
    caller can fall back to leaving the photo alone.
    """
    small = img.convert("RGB").copy()
    small.thumbnail((MASK_WORK_SIZE, MASK_WORK_SIZE), Image.LANCZOS)
    sw, sh = small.size

    # A sentinel colour that is very unlikely to occur in a real photo. The
    # flood fill paints the backdrop with it, and we read the mask back out.
    sentinel = (255, 0, 255)

    # Soften first so JPEG noise does not stop the fill from spreading.
    work = small.filter(ImageFilter.GaussianBlur(1.2))

    # Seed all the way around the border, not just at the corners. Pillow's
    # flood fill measures every pixel against its SEED, not against its
    # neighbour, so on a backdrop that shades from light at the top to dark at
    # the bottom a corner seed stops once the gradient drifts past the
    # tolerance, leaving stripes of old background behind. Seeds spread along
    # the border sit at every brightness the gradient passes through, so
    # between them they cover the whole sweep.
    step = max(4, min(sw, sh) // 12)
    seeds = []
    for x in range(0, sw, step):
        seeds += [(x, 0), (x, sh - 1)]
    for y in range(0, sh, step):
        seeds += [(0, y), (sw - 1, y)]
    seeds.append((sw - 1, sh - 1))

    # If the item runs off the edge of the photo, a border seed can land on the
    # item itself and flood-fill the subject away. Only seed from pixels that
    # actually look like the backdrop.
    backdrop = np.array(estimate_background_colour(small), dtype=np.float32)
    limit = max(60.0, tolerance * 3.0)
    pixels = np.asarray(small, dtype=np.float32)

    for seed in seeds:
        x, y = seed
        if float(np.abs(pixels[y, x] - backdrop).sum()) > limit:
            continue
        try:
            ImageDraw.floodfill(work, seed, sentinel, thresh=tolerance)
        except ValueError:
            # Seed already sits on the sentinel colour, nothing left to fill.
            continue

    arr = np.asarray(work, dtype=np.int16)
    is_bg = (
        (arr[:, :, 0] == sentinel[0])
        & (arr[:, :, 1] == sentinel[1])
        & (arr[:, :, 2] == sentinel[2])
    )

    subject = ~is_bg
    bg_fraction = float(is_bg.mean())
    subject_fraction = float(subject.mean())

    # The fill never caught anything.
    if bg_fraction < 0.02:
        return None
    # The fill leaked through the item and ate the subject.
    if subject_fraction < 0.004:
        return None

    # A small item on a big white sweep is perfectly normal, so area alone
    # cannot decide. What separates a real subject from a leak is that a
    # subject is solid: it fills most of its own bounding box. Scattered
    # speckle does not.
    ys, xs = np.nonzero(subject)
    bbox_area = (xs.max() - xs.min() + 1) * (ys.max() - ys.min() + 1)
    if subject.sum() / float(bbox_area) < 0.15:
        return None

    mask_small = Image.fromarray((subject * 255).astype(np.uint8), mode="L")

    # Close pinholes inside the item, then soften the cut edge.
    mask_small = mask_small.filter(ImageFilter.MaxFilter(5))
    mask_small = mask_small.filter(ImageFilter.MinFilter(5))

    mask = mask_small.resize(img.size, Image.LANCZOS)
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    return mask


# --------------------------------------------------------------------------
# colour
# --------------------------------------------------------------------------

def correct_colour(img: Image.Image) -> Image.Image:
    """Neutralise a colour cast, then a light contrast/saturation/sharpen pass."""
    arr = np.asarray(img.convert("RGB"), dtype=np.float32)

    # Grey-world white balance, but measured on the brightest 25% of pixels —
    # highlights carry the light's colour more reliably than shadows do.
    luma = arr @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    threshold = np.percentile(luma, 75)
    bright = arr[luma >= threshold]

    if bright.size:
        means = bright.reshape(-1, 3).mean(axis=0)
        target = float(means.mean())
        # Clamp the correction so an intentionally warm photo is nudged, not
        # scrubbed, and a near-black channel cannot blow up the gain.
        gains = np.clip(target / np.maximum(means, 1.0), 0.85, 1.18)
        arr = np.clip(arr * gains, 0, 255)

    out = Image.fromarray(arr.astype(np.uint8), mode="RGB")
    out = ImageEnhance.Contrast(out).enhance(1.06)
    out = ImageEnhance.Color(out).enhance(1.05)
    out = out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=3))
    return out


# --------------------------------------------------------------------------
# framing
# --------------------------------------------------------------------------

def subject_bbox(img: Image.Image, mask: Image.Image | None):
    """Bounding box of the item, from the mask when there is one."""
    if mask is not None:
        box = mask.point(lambda v: 255 if v > 32 else 0).getbbox()
        if box:
            return box

    # No mask: fall back to "what differs from the border colour".
    bg = estimate_background_colour(img)
    flat = Image.new("RGB", img.size, bg)
    diff = ImageChops.difference(img.convert("RGB"), flat).convert("L")
    return diff.point(lambda v: 255 if v > 30 else 0).getbbox()


def compose_square(
    subject: Image.Image,
    mask: Image.Image | None,
    size: int,
    bg_colour: tuple[int, int, int],
    padding: float,
    shadow: bool,
) -> Image.Image:
    """Centre the item on a square backdrop, with an optional soft shadow."""
    canvas = Image.new("RGB", (size, size), bg_colour)

    inner = max(1, int(size * (1.0 - 2.0 * padding)))

    # Scale to fit the inner box in BOTH directions. Image.thumbnail() would
    # be the obvious call here, but it refuses to enlarge, which would leave a
    # small item marooned in the middle of the canvas while a large one filled
    # it -- exactly the inconsistency this script exists to remove.
    scale = min(inner / subject.width, inner / subject.height)
    target = (max(1, round(subject.width * scale)), max(1, round(subject.height * scale)))

    fitted = subject.resize(target, Image.LANCZOS)
    fitted_mask = mask.resize(target, Image.LANCZOS) if mask is not None else None

    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2

    if shadow and fitted_mask is not None:
        blur = max(3, size // 90)
        offset = max(2, size // 110)

        shadow_layer = Image.new("L", (size, size), 0)
        shadow_layer.paste(fitted_mask, (x, y + offset))
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(blur))
        # Keep it subtle — a heavy shadow reads as a cut-out, not a photo.
        shadow_layer = shadow_layer.point(lambda v: int(v * 0.35))

        dark = Image.new("RGB", (size, size), (0, 0, 0))
        canvas = Image.composite(dark, canvas, shadow_layer)

    canvas.paste(fitted, (x, y), fitted_mask)
    return canvas


# --------------------------------------------------------------------------
# per-file pipeline
# --------------------------------------------------------------------------

def process(path: Path, args, bg_colour, base: str) -> list[str]:
    with Image.open(path) as opened:
        img = ImageOps.exif_transpose(opened)
        img = img.convert("RGB") if img.mode != "RGB" else img.copy()

    mask = None
    note = "background kept"
    if not args.no_knockout:
        if args.force_knockout or background_is_plain(img):
            mask = build_subject_mask(img, args.tolerance)
            note = "background removed" if mask else "backdrop too complex, kept"
        else:
            note = "busy background, kept"

    box = subject_bbox(img, mask)
    if box:
        # Leave a little of the original around the item so the crop does not
        # shave the edge off when the mask is a pixel or two tight.
        margin = int(0.02 * max(img.size))
        left = max(0, box[0] - margin)
        top = max(0, box[1] - margin)
        right = min(img.width, box[2] + margin)
        bottom = min(img.height, box[3] + margin)
        if right - left > 16 and bottom - top > 16:
            img = img.crop((left, top, right, bottom))
            if mask is not None:
                mask = mask.crop((left, top, right, bottom))

    img = correct_colour(img)

    # Consistent framing can mean enlarging a small crop. Past roughly 2x that
    # starts to show, and the honest fix is a closer photo, not more pixels.
    largest = max(args.sizes) * (1.0 - 2.0 * args.padding)
    upscale = largest / max(img.size)
    if upscale > 2.0:
        note += f"; low detail ({upscale:.1f}x enlarged -- reshoot closer if it looks soft)"

    written: list[str] = []

    for index, width in enumerate(args.sizes):
        square = compose_square(
            img, mask, width, bg_colour, args.padding, not args.no_shadow
        )
        suffix = "" if index == 0 else f"@{width}"

        jpg = OUT_DIR / f"{base}{suffix}.jpg"
        webp = OUT_DIR / f"{base}{suffix}.webp"

        if not args.dry_run:
            square.save(jpg, "JPEG", quality=88, optimize=True, progressive=True)
            square.save(webp, "WEBP", quality=86, method=6)

        written.extend([jpg.name, webp.name])

    return [base, note, written]


def parse_colour(text: str) -> tuple[int, int, int]:
    text = text.strip().lstrip("#")
    if len(text) == 3:
        text = "".join(c * 2 for c in text)
    if len(text) != 6:
        raise argparse.ArgumentTypeError(f"not a hex colour: #{text}")
    try:
        return tuple(int(text[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]
    except ValueError:
        raise argparse.ArgumentTypeError(f"not a hex colour: #{text}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Turn raw photos into consistent product images.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--in", dest="in_dir", default=str(RAW_DIR),
                        help="folder of raw photos (default: images/raw)")
    parser.add_argument("--out", dest="out_dir", default=str(OUT_DIR),
                        help="where to write (default: assets/gallery)")
    parser.add_argument("--bg", type=parse_colour, default="#ffffff",
                        help="backdrop colour, e.g. '#f2ede6' (default: white)")
    parser.add_argument("--sizes", type=int, nargs="+", default=DEFAULT_SIZES,
                        help=f"output widths (default: {' '.join(map(str, DEFAULT_SIZES))})")
    parser.add_argument("--padding", type=float, default=0.08,
                        help="space around the item, 0-0.4 (default: 0.08)")
    parser.add_argument("--tolerance", type=int, default=34,
                        help="background colour tolerance, higher removes more (default: 34)")
    parser.add_argument("--no-knockout", action="store_true",
                        help="keep the original background")
    parser.add_argument("--force-knockout", action="store_true",
                        help="remove the background even if the backdrop looks busy")
    parser.add_argument("--no-shadow", action="store_true",
                        help="skip the drop shadow")
    parser.add_argument("--dry-run", action="store_true",
                        help="report what would happen, write nothing")
    args = parser.parse_args()

    if not 0.0 <= args.padding < 0.45:
        parser.error("--padding must be between 0 and 0.45")
    if any(s < 32 for s in args.sizes):
        parser.error("--sizes values must be at least 32")
    # Largest first, so the un-suffixed file is always the biggest one.
    args.sizes = sorted(set(args.sizes), reverse=True)

    bg_colour = args.bg if isinstance(args.bg, tuple) else parse_colour(args.bg)

    in_dir = Path(args.in_dir).resolve()
    out_dir = Path(args.out_dir).resolve()

    if not in_dir.is_dir():
        print(f"No such folder: {in_dir}", file=sys.stderr)
        return 1

    globals()["OUT_DIR"] = out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(
        p for p in in_dir.iterdir()
        if p.is_file() and p.suffix.lower() in EXTENSIONS and not p.name.startswith(".")
    )

    if not files:
        print(f"No photos found in {in_dir}")
        print("Put the photos there and run this again. Accepted: "
              + ", ".join(sorted(EXTENSIONS)))
        return 0

    heic = [p for p in files if p.suffix.lower() in {".heic", ".heif"}]
    if heic and not HEIC_OK:
        print(f"Skipping {len(heic)} .heic file(s): run 'pip install pillow-heif' "
              "to read iPhone photos.\n", file=sys.stderr)
        files = [p for p in files if p.suffix.lower() not in {".heic", ".heif"}]

    print(f"Processing {len(files)} photo(s) from {in_dir}")
    if args.dry_run:
        print("(dry run — nothing will be written)")
    print()

    # Two differently-named files can slugify to the same output name
    # ("Blue Vase.jpg" and "blue vase.png"), in which case the second would
    # quietly overwrite the first. Number the duplicates instead.
    seen: dict[str, int] = {}
    renames: dict[Path, str] = {}
    for path in files:
        base = slugify(path.stem)
        if base in seen:
            seen[base] += 1
            renames[path] = f"{base}-{seen[base]}"
            print(f"  note    {path.name} would overwrite {base}; "
                  f"writing {renames[path]} instead")
        else:
            seen[base] = 1
            renames[path] = base

    ok = 0
    failed = 0
    entries = []

    for path in files:
        try:
            base, note, written = process(path, args, bg_colour, renames[path])
        except Exception as exc:  # one bad file must not stop the batch
            print(f"  FAILED  {path.name}: {exc}", file=sys.stderr)
            failed += 1
            continue
        ok += 1
        entries.append(base)
        print(f"  ok      {path.name}  ->  {base}.jpg / .webp   ({note})")

    print(f"\nDone: {ok} processed, {failed} failed.")

    if entries and not args.dry_run:
        rel = out_dir.relative_to(ROOT).as_posix() if out_dir.is_relative_to(ROOT) else out_dir.as_posix()
        print("\nAdd these to the gallery list in assets/site-config.js, and "
              "replace each alt text with a real description of the photo:\n")
        for base in entries:
            print(f'    {{ src: "{rel}/{base}.webp", alt: "" }},')

    return 1 if failed and not ok else 0


if __name__ == "__main__":
    sys.exit(main())
