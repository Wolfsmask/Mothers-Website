# Seeing what people are interested in

Nothing here needs an account, and nothing needs installing on her computer.

---

## What she does

1. She gets an email from you with a **PDF attached**.
2. She taps it.
3. She reads it.

That is all of it. Nothing to install, no account, no password, no website to
log in to. It works on her phone, her tablet, or any computer, and it works
with no internet once it has arrived.

The PDF has four big numbers at the top, then a chart of which rental items
people opened most, and a chart of which pages they visited. It says in plain
words how to read them.

**Everything else on this page is your side of it**, and it is two commands.

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

Any time you want to send her an update:

    python3 scripts/build_report.py

That writes two files into the project folder:

- **`report.pdf`** &mdash; the one to email her. PDFs open on anything, and
  preview straight inside Gmail on a phone.
- **`report.html`** &mdash; the same thing as a web page, if you would rather
  look at it on your own screen. It has a **Save this as a PDF** button.

The PDF is made using Chrome or Edge, whichever is already on the computer, so
there is nothing extra to install. If neither is found it says so, and you open
the web page and press the button instead.

Useful options:

    python3 scripts/build_report.py --days 30      # only the last month
    python3 scripts/build_report.py --out ~/Desktop/september.html
    python3 scripts/build_report.py --no-pdf       # web page only

Send her a fresh one whenever it is worth looking at — monthly is plenty.

## What the report shows her (the PDF)

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
