# Your Mum's Advent: deploying on Cloudflare

This is a Cloudflare Worker with static assets:

- `public/index.html`: the calendar page
- `src/worker.js`: serves the page and the small API (`/api/ratings`, `/api/rate`, `/api/submit`)
- `wrangler.jsonc`: the Worker settings

It deploys automatically from GitHub with the deploy command `npx wrangler deploy`.

## Ratings and joke submissions (D1 database)

The site works without the database: you just won't see rating counts, and the joke form says to try later. To switch them on:

1. In the Cloudflare dashboard, go to **Storage & Databases → D1 → Create** and name the database `yourmum-advent`.
2. Copy its **Database ID**.
3. In `wrangler.jsonc`, add the `d1_databases` block that's shown in the comment there, with that ID, then push the change.

The Worker creates its own tables the first time it's used, so you don't need to run any SQL.

## Reading submitted jokes

Go to **D1 → yourmum-advent → Console** and run:

```sql
SELECT * FROM submissions ORDER BY created DESC;
```

## Custom domain

In the Worker's **Settings → Domains & Routes**, add the custom domain `advent.woollgar.co.uk`.

## Testing before December

Add `#preview` to the address to unlock every door. Doors you open in preview mode aren't remembered.
