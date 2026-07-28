# Making published changes appear on the live site instantly

When you press **Publish** in the Studio, Sanity has to *tell* the live website
that something changed. It does that by sending a message (a "webhook") to the
site. This guide sets that up. It takes about five minutes and you only do it
once.

> ## ⚠️ Read this first: this is for the LIVE site only
>
> **A webhook cannot reach `localhost`.** Sanity sends its message across the
> internet to a public web address — and the `localhost:3000` preview running
> on a laptop is not a public address, so no message can ever arrive there.
>
> You don't need it there anyway: while developing, the site is configured to
> ask Sanity for fresh content on **every page refresh**, so published changes
> show up on localhost as soon as you reload the page — webhook or no webhook.
>
> This guide only matters for the deployed production site.

## Before you start, have these two things

1. The site's production web address (e.g. `https://www.example.com`).
2. The value of `SANITY_REVALIDATE_SECRET` that is set on the hosting platform
   (e.g. in Vercel → the project → Settings → Environment Variables). If it
   isn't set there yet, set it first — the webhook is useless without it.

## Step by step

1. Go to **[sanity.io/manage](https://sanity.io/manage)** and open this
   project.
2. Click the **API** tab.
3. Click **Webhooks**, then **Create webhook**.
4. Fill in the form exactly like this:
   - **Name:** `Revalidate live site` (or anything you like).
   - **URL:** `https://<production-domain>/api/revalidate` — replace
     `<production-domain>` with the site's real address. No trailing slash.
   - **Dataset:** `production` (the dataset the site reads from).
   - **Trigger on:** tick all three — **Create**, **Update**, and **Delete**.
     Deletions matter: removing a service must remove its page too.
   - **Filter:** leave empty.
   - **Projection:** **leave empty.** This is important — the site reads the
     document's `_type` from the message. A custom projection that leaves out
     `_type` makes every single publish fail with an error 400.
   - **Drafts:** leave **disabled** (unticked). The site only shows published
     content; being told about draft edits would do nothing.
   - **HTTP method:** `POST`.
   - **API version:** `2026-07-01` (the same version the site uses).
   - **Secret:** paste the **same value** as `SANITY_REVALIDATE_SECRET` on the
     hosting platform.
5. Click **Save**.

## The secret must match exactly

The secret you paste into the Sanity form and the `SANITY_REVALIDATE_SECRET`
on the hosting platform must be **byte-for-byte identical**. A single trailing
space accidentally copied into either one makes every publish silently fail
with a 401 — the Studio will say "Published", the site will never update, and
nothing on screen will tell you why. If in doubt, retype rather than paste, or
paste into a plain text editor first to check for stray spaces.

## How to check it's working

1. Paste `https://<production-domain>/api/revalidate` into a browser. You
   should see a small confirmation that the route is deployed and
   `"revalidateSecretPresent": true`. If you see `false`, the secret is
   missing on the hosting platform.
2. Publish any small change in the Studio, then in
   [sanity.io/manage](https://sanity.io/manage) → API → Webhooks, open the
   webhook's **Attempts log**. A green **200** means it worked. A 401 means
   the secrets don't match; a 400 means a projection is set that shouldn't be.
3. Reload the affected page on the live site — the change should be there.

If the webhook is *not* set up, the site still updates on its own — but only
every 24 hours. That is the "changes take a day to appear" symptom.
