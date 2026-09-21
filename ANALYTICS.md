# Seeing what people look at

The site can tell you which pages people visit, how long they stay on each
one, and **which rental items they open for a closer look** — so you can stock
more of what people actually want.

The tracking code is already built in. It does nothing until you do the setup
below, which takes about ten minutes and is free.

---

## What you will be able to see

Once it is running:

| Question | Where the answer comes from |
| --- | --- |
| How many people visited each tab | Page views, counted automatically |
| How long they stayed on each tab | Average engagement time, automatic |
| Which tab they clicked to get there | The `nav_click` event |
| **Which rental items people opened** | The `rental_preview` event |

That last one is the useful one. Page views tell you people looked at the
Rentals page. `rental_preview` tells you they opened the chafer sets eleven
times and the wood crates twice — which is what tells you where to spend money
on more stock.

---

## Setting it up

1. Go to **analytics.google.com** and sign in with a Google account.
2. Create an **account**, then a **property** (name it after the business).
3. When it asks for a platform, choose **Web**, and enter the website address.
4. It will show you a **Measurement ID** that starts with `G-`, something like
   `G-ABC1234XYZ`. Copy it.
5. Open `assets/site-config.js` and paste it in:

   ```js
   gaMeasurementId: "G-ABC1234XYZ",
   ```

6. Save, and upload the site as usual.

That is it. Nothing else needs changing.

## Checking it works

Visit the live site yourself. You should see a small bar at the bottom asking
whether to allow analytics — click **Allow analytics**.

Then in Google Analytics, open **Reports → Realtime**. You should appear
within about thirty seconds. If you do, it is working.

The normal reports are not instant — most figures take **24 to 48 hours** to
appear. Realtime is the one to check on day one.

## Where to look afterwards

- **Reports → Engagement → Pages and screens** — every page, how many views,
  and average engagement time. This is the "which tabs do people use" answer.
- **Reports → Engagement → Events** — the list of events. Look for
  `rental_preview`, then click into it to see which items by name.

If `rental_preview` is not in the list yet, it is because nobody has opened an
item preview yet, or because no rental items have photos yet — only items with
a photo can be previewed.

---

## Things worth knowing before you trust the numbers

- **It only works on the live site.** Opening the files from your own computer
  will not record anything useful. The site has to be uploaded to a web host
  first.
- **Visitors who decline are not counted.** The consent bar is there because
  tracking someone without asking is not allowed in a lot of places. Anyone who
  clicks "No thanks" is invisible to the reports, so your real visitor numbers
  are always somewhat higher than what you see.
- **Your own visits count too.** Every time you check your own site you add a
  view. Early on, when numbers are small, most of the traffic will be you.
  Google Analytics can filter your own visits out — worth doing once real
  visitors start arriving.
- **Small numbers do not mean much.** Three previews of one item and one of
  another is not evidence. Give it a few weeks before drawing conclusions about
  what to buy more of.
- **The privacy policy already covers this.** `privacy.html` says which pages
  are visited, how long is spent on them, and which items are opened are
  recorded. If you change what is tracked, that page needs updating too.

## If you would rather not use Google

Leave `gaMeasurementId` blank and nothing is tracked and no consent bar
appears. Paid alternatives like Plausible or Fathom collect less personal data
and often need no consent banner at all, but they cost money, and wiring one in
is a change to `assets/site.js`.
