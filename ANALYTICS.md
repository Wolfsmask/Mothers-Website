# Seeing what people are interested in

Three ways, easiest first. **The first one is already working and needs
nothing at all.** Most small businesses never need more than the first two.

---

## 1. Your inbox (nothing to set up)

When someone opens a rental item on the website and clicks **Ask about this
item**, the message they send now names that item. The email arrives with a
subject line like:

> **Rental Inquiry - Sterno chafer sets - Megan Wright**

and the item repeated inside the message.

So your email is already a record of what people want. Search your inbox for
`Rental Inquiry` and you can see, at a glance, which items people ask about
and how often. If six of the last ten are chafer sets, that is your answer.

No account, no setup, no dashboard. This works from the moment the site is
live.

**What it tells you:** which items are wanted enough that someone actually got
in touch — the strongest signal there is, because it cost them effort.

**What it does not tell you:** how many people looked and did not write.

---

## 2. Visitor numbers, through your website host

You have to put the website somewhere, and that means one account no matter
what. So use a host that shows you the numbers in the same place.

**Cloudflare Pages** is free, and its Web Analytics is free and built into the
same dashboard. That is one account in total, not two.

1. Sign up at **pages.cloudflare.com** and upload the website folder.
2. In the dashboard, open **Web Analytics** and turn it on for the site.
3. It gives you a short token. Open `assets/site-config.js` and paste it in:

   ```js
   cloudflareToken: "your-token-here",
   ```

4. Upload the site again.

**What you get:** how many people visited, which pages they went to, where
they came from (Google, Facebook, a link someone shared), and what days are
busy. That answers "which tabs do people use".

**Why this one:** it counts people without cookies and without storing
anything on their computer, so **no consent pop-up appears** and the site
stays simple. Nothing to install.

Free tiers change, so check what is current when you sign up.

---

## 3. Google Analytics (only if you want the detail)

Already wired in; it stays off until you add an ID. Use it only if you want
**time spent on each page** and **which items get opened without anyone
writing in** — that is the one thing the first two cannot give you.

The costs are real: a consent pop-up appears on the site, visitors who decline
are invisible, and the dashboard takes a while to learn.

1. Go to **analytics.google.com**, sign in with the business Google account.
2. Create a property, choose **Web**, enter the website address.
3. Copy the **Measurement ID** (starts with `G-`) into `assets/site-config.js`:

   ```js
   gaMeasurementId: "G-ABC1234XYZ",
   ```

Where to look afterwards:

- **Reports → Engagement → Pages and screens** — visits and average time on
  each page.
- **Reports → Engagement → Events** — look for `rental_preview` and click into
  it to see which items by name.

You can run this alongside Cloudflare, or instead of it. You do not need both.

---

## Before you trust any of the numbers

- **Nothing records until the site is live.** Opening the files from your own
  computer does not count.
- **Your own visits count too.** Early on, most of the traffic will be you.
- **Small numbers mean nothing.** Three views of one item and one of another
  is not evidence. Give it a few weeks.
- **Google Analytics only counts people who accept the prompt**, so real
  traffic is always higher than it reports. Cloudflare counts everyone.
- **The privacy policy already covers all of this.** If you change what is
  tracked, `privacy.html` needs updating too.

## The short version

Do nothing, and your inbox already tells you which items people ask about.
Add the Cloudflare token when you want visitor numbers. Only bother with
Google Analytics if you find yourself wanting more than that.
