#!/usr/bin/env python3
"""
build_report.py -- turn the visit record into one report file.

    python3 scripts/build_report.py

Reads data/events.jsonl (written by scripts/serve.py) and writes report.html:
a single self-contained file. Email it, put it on a memory stick, whatever --
whoever gets it just double-clicks it. No accounts, no installing anything,
and it works with no internet connection.

Options:
    --days 30      only count the last 30 days (default: everything)
    --out FILE     write somewhere else (default: report.html)
"""

from __future__ import annotations

import argparse
import html
import json
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVENTS = ROOT / "data" / "events.jsonl"

# Bar colour, validated against each surface with the data-viz palette checker:
# light #9a641f and dark #bf8836 both pass lightness band, chroma, and contrast.
BAR_LIGHT = "#9a641f"
BAR_DARK = "#bf8836"

PAGE_NAMES = {
    "index.html": "Home", "rentals.html": "Rentals", "services.html": "Services",
    "events.html": "Events", "weddings.html": "Weddings", "birthdays.html": "Birthday parties",
    "baby-showers.html": "Baby showers", "graduations.html": "Graduations",
    "anniversaries.html": "Anniversaries", "corporate.html": "Corporate events",
    "themed-events.html": "Themed events", "bartending.html": "Bartending",
    "coordination.html": "Coordination", "entertainment.html": "Entertainment",
    "about.html": "About", "gallery.html": "Gallery", "privacy.html": "Privacy",
    "terms.html": "Terms", "404.html": "Page not found",
}


def load(days: int | None):
    if not EVENTS.exists():
        return []
    cutoff = None
    if days:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    rows = []
    for line in EVENTS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            row = json.loads(line)
            when = datetime.fromisoformat(row["at"])
        except Exception:
            continue  # a half-written line at the end is not worth failing over
        if cutoff and when < cutoff:
            continue
        row["_when"] = when
        rows.append(row)
    return rows


def bars(pairs, total, bar_id):
    """Horizontal bars: one series, so no legend; every bar is directly labelled."""
    if not pairs:
        return '<p class="empty">Nothing recorded yet.</p>'

    top = max(count for _, count in pairs) or 1
    out = ['<div class="bars">']
    for i, (label, count) in enumerate(pairs):
        width = max(1.5, 100.0 * count / top)
        share = (100.0 * count / total) if total else 0
        out.append(
            f'<div class="bar-row" title="{html.escape(label)}: {count} '
            f'({share:.0f}% of the total)">'
            f'<div class="bar-label">{html.escape(label)}</div>'
            f'<div class="bar-track"><div class="bar-fill" style="width:{width:.1f}%"></div></div>'
            f'<div class="bar-value">{count}</div>'
            f"</div>"
        )
    out.append("</div>")
    return "\n".join(out)


def table(pairs, heading):
    if not pairs:
        return ""
    rows = "\n".join(
        f"<tr><td>{html.escape(name)}</td><td>{count}</td></tr>" for name, count in pairs
    )
    return f"""<details class="table-view">
  <summary>See these numbers as a list</summary>
  <table><thead><tr><th>{html.escape(heading)}</th><th>Times</th></tr></thead>
  <tbody>{rows}</tbody></table>
</details>"""


def build(rows, days):
    page_views = Counter()
    item_views = Counter()
    enquiries = Counter()

    for row in rows:
        kind = row.get("kind", "")
        if kind == "page_view":
            page = row.get("page") or "index.html"
            page_views[PAGE_NAMES.get(page, page)] += 1
        elif kind == "rental_preview" and row.get("item"):
            item_views[row["item"]] += 1
        elif kind == "rental_enquiry_started" and row.get("item"):
            enquiries[row["item"]] += 1

    when = [r["_when"] for r in rows]
    if when:
        first, last = min(when), max(when)
        covered = f"{first:%-d %B %Y} to {last:%-d %B %Y}"
        day_count = len({w.date() for w in when})
    else:
        covered = "nothing recorded yet"
        day_count = 0

    total_pages = sum(page_views.values())
    total_items = sum(item_views.values())
    total_enq = sum(enquiries.values())

    item_pairs = item_views.most_common()
    page_pairs = page_views.most_common()
    enq_pairs = enquiries.most_common()

    headline = (
        f"Most looked at: <strong>{html.escape(item_pairs[0][0])}</strong>"
        if item_pairs else "No rental items opened yet"
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Website Report</title>
<style>
  :root {{
    color-scheme: light;
    --surface: #fcfcfb;
    --card: #ffffff;
    --line: rgba(20,16,10,.12);
    --text-primary: #17150f;
    --text-secondary: #55524a;
    --text-muted: #7d7970;
    --bar: {BAR_LIGHT};
    --track: rgba(20,16,10,.07);
  }}
  @media (prefers-color-scheme: dark) {{
    :root:not([data-theme="light"]) {{
      color-scheme: dark;
      --surface: #1a1a19;
      --card: #232321;
      --line: rgba(255,255,255,.14);
      --text-primary: #f6f4ef;
      --text-secondary: #c3c2b7;
      --text-muted: #96948c;
      --bar: {BAR_DARK};
      --track: rgba(255,255,255,.09);
    }}
  }}
  :root[data-theme="dark"] {{
    color-scheme: dark;
    --surface: #1a1a19; --card: #232321; --line: rgba(255,255,255,.14);
    --text-primary: #f6f4ef; --text-secondary: #c3c2b7; --text-muted: #96948c;
    --bar: {BAR_DARK}; --track: rgba(255,255,255,.09);
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; background: var(--surface); color: var(--text-primary);
    font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    padding: 32px 20px 64px;
  }}
  .wrap {{ max-width: 860px; margin: 0 auto; }}
  h1 {{ font-size: 1.9rem; margin: 0 0 4px; letter-spacing: -.02em; }}
  .sub {{ color: var(--text-secondary); margin: 0 0 6px; }}
  .stamp {{ color: var(--text-muted); font-size: .85rem; margin: 0 0 30px; }}
  h2 {{ font-size: 1.12rem; margin: 38px 0 4px; }}
  .note {{ color: var(--text-secondary); font-size: .92rem; margin: 0 0 16px; }}

  .tiles {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }}
  .tile {{ background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; }}
  .tile .n {{ font-size: 2rem; font-weight: 700; letter-spacing: -.02em; }}
  .tile .k {{ color: var(--text-secondary); font-size: .85rem; }}

  .headline {{ background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--bar);
               border-radius: 12px; padding: 14px 18px; margin: 20px 0 0; font-size: 1.05rem; }}

  .bars {{ background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 8px 18px; }}
  .bar-row {{ display: grid; grid-template-columns: minmax(120px, 34%) 1fr 46px;
              align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--line); }}
  .bar-row:last-child {{ border-bottom: 0; }}
  .bar-label {{ font-size: .92rem; color: var(--text-primary); overflow-wrap: anywhere; }}
  .bar-track {{ background: var(--track); border-radius: 999px; height: 12px; }}
  .bar-fill {{ background: var(--bar); height: 12px; border-radius: 0 4px 4px 0; min-width: 4px; }}
  .bar-value {{ text-align: right; font-variant-numeric: tabular-nums; font-weight: 700; font-size: .92rem; }}

  .empty {{ background: var(--card); border: 1px dashed var(--line); border-radius: 14px;
            padding: 26px; text-align: center; color: var(--text-secondary); }}
  .table-view {{ margin-top: 10px; }}
  .table-view summary {{ cursor: pointer; color: var(--text-secondary); font-size: .88rem; }}
  table {{ border-collapse: collapse; margin-top: 10px; width: 100%; font-size: .92rem; }}
  th, td {{ text-align: left; padding: 7px 10px; border-bottom: 1px solid var(--line); }}
  td:last-child, th:last-child {{ text-align: right; font-variant-numeric: tabular-nums; }}
  .reading {{ background: var(--card); border: 1px solid var(--line); border-radius: 14px;
              padding: 18px 20px; margin-top: 40px; color: var(--text-secondary); font-size: .93rem; }}
  .reading h3 {{ margin: 0 0 8px; font-size: 1rem; color: var(--text-primary); }}
  .reading li {{ margin-bottom: 6px; }}
</style>
</head>
<body>
<div class="wrap">
  <h1>Website Report</h1>
  <p class="sub">Untamed Entertainment LC &middot; {html.escape(covered)}</p>
  <p class="stamp">Made on {datetime.now():%-d %B %Y at %-I:%M %p}{" &middot; last " + str(days) + " days only" if days else ""}</p>

  <div class="tiles">
    <div class="tile"><div class="n">{total_pages}</div><div class="k">Page visits</div></div>
    <div class="tile"><div class="n">{total_items}</div><div class="k">Rental items opened</div></div>
    <div class="tile"><div class="n">{total_enq}</div><div class="k">Started an enquiry</div></div>
    <div class="tile"><div class="n">{day_count}</div><div class="k">Days with visits</div></div>
  </div>

  <div class="headline">{headline}</div>

  <h2>Which rental items people opened</h2>
  <p class="note">Someone clicked the item to see the bigger photo. This is the best guide to what to stock more of.</p>
  {bars(item_pairs, total_items, "items")}
  {table(item_pairs, "Rental item")}

  <h2>Which pages people visited</h2>
  <p class="note">Every time a page was opened, including repeat visits.</p>
  {bars(page_pairs, total_pages, "pages")}
  {table(page_pairs, "Page")}

  {"<h2>Items people started an enquiry about</h2><p class='note'>They clicked through to the contact form from that item. Check the inbox for the ones that were actually sent.</p>" + bars(enq_pairs, total_enq, "enq") + table(enq_pairs, "Rental item") if enq_pairs else ""}

  <div class="reading">
    <h3>Reading this properly</h3>
    <ul>
      <li>Your own visits are counted too. Early on, most of them will be you.</li>
      <li>Small numbers mean nothing. Three of one and one of another is not evidence &mdash; give it a few weeks.</li>
      <li>Only visits while the website was actually running on the computer are counted.</li>
      <li>Nothing here identifies anybody. No names, no addresses, no device details &mdash; only which page and which item, and when.</li>
    </ul>
  </div>
</div>
</body>
</html>
"""


def main() -> int:
    ap = argparse.ArgumentParser(description="Build the website report.")
    ap.add_argument("--days", type=int, default=None, help="only the last N days")
    ap.add_argument("--out", default=str(ROOT / "report.html"), help="where to write it")
    args = ap.parse_args()

    rows = load(args.days)
    out = Path(args.out)
    out.write_text(build(rows, args.days), encoding="utf-8")

    if not rows:
        print("No visits recorded yet, so the report is empty.")
        print("Start the website with:  python3 scripts/serve.py")
    else:
        print(f"Read {len(rows)} recorded events.")
    print(f"\nReport written to: {out}")
    print("Double-click it to open, or email it to anyone who wants to see it.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
