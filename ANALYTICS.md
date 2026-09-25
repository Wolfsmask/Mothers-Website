# Seeing what people are interested in

Nothing here needs an account, and nothing needs installing on her computer.

---

## The short version

While the website is running on your PC, it keeps a private record of which
pages and which rental items people looked at. One command turns that into a
**single report file** you can email her. She double-clicks it and it opens.
That is the whole thing.

---

## Running the website, and recording visits

Instead of whatever you use now, start it with:

    python3 scripts/serve.py

It prints two addresses: one for that computer, and one that other devices on
the same wifi can use. Leave the window open; press Ctrl+C to stop.

While it runs it writes to `data/events.jsonl` — one line per page opened and
per rental item someone clicked to enlarge.

**What is recorded:** the time, which page, and which item. That is all. No IP
addresses, no names, no device details. Nothing leaves your computer.

## Making the report for her

Any time you want an update:

    python3 scripts/build_report.py

That writes **`report.html`** in the project folder. Email it, text it, put it
on a memory stick — she double-clicks it and it opens in her browser.

It is one self-contained file. It needs no internet, no account, no software,
and no login. It works on any computer or phone that can open a web page.

Useful options:

    python3 scripts/build_report.py --days 30      # only the last month
    python3 scripts/build_report.py --out ~/Desktop/september.html

Send her a fresh one whenever it is worth looking at — monthly is plenty.

## What the report shows her

- **Which rental items people opened**, ranked. This is the one that answers
  "what should I get more of".
- **Which pages people visited.**
- **Which items people started an enquiry about.**
- Headline numbers, and a plain-English note on how to read them.

---

## Her inbox is the other half, and needs nothing at all

When someone opens an item and clicks **Ask about this item**, the enquiry
they send names that item in the subject line:

> **Rental Inquiry — Sterno chafer sets — Megan Wright**

So her email already records which items people care enough about to write in
about. Searching for `Rental Inquiry` shows them. That is the strongest signal
there is, because writing in costs the visitor effort — and it works whether
or not anyone ever runs the report.

---

## The honest catch about hosting from a home PC

The website is only reachable **while that computer is switched on and awake**,
and unless the router has been set up to allow it, only devices on the same
wifi can open it at all. Friends and family on the same network, yes; a
customer who finds it on Google, no.

So expect the report to be quiet at first. That is the hosting, not the
website.

When it is time for the business to be genuinely findable, a free host such as
Cloudflare Pages or Netlify runs it 24 hours a day on a real web address, and
`assets/site-config.js` already has a `cloudflareToken` setting for the free
cookieless counter that comes with it. Nothing about the website has to
change. Until then, the local recorder does the same job on your machine.

---

## If you would rather use Google Analytics

Still supported, still off until switched on. Put a Measurement ID from
analytics.google.com into `gaMeasurementId` in `assets/site-config.js`.

It adds time-on-page, at the cost of a consent pop-up on the site, invisibility
for everyone who declines it, and an account and dashboard to learn. For a
business this size the report file is easier and tells you the same things.

---

## Reading any of it sensibly

- **Your own visits count.** Early on most of them will be you or her.
- **Small numbers mean nothing.** Three of one item and one of another is not
  evidence. Give it a few weeks.
- **Only visits while the site was actually running are counted.**
- **The privacy policy already covers this.** If you change what is recorded,
  update `privacy.html` too.
