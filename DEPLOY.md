# Your Mum's Advent: deploying to Cloudflare Pages

The site is `index.html` plus three small API functions in `functions/api/`, backed by a free Cloudflare D1 database:

- `GET /api/ratings`: the vote counts for every day
- `POST /api/rate`: records a vote (Groan, Heh or Howling)
- `POST /api/submit`: saves a joke sent through the "Send us your joke" form

Because of the functions, deploy with Wrangler (Cloudflare's command-line tool) or from a GitHub repo, not by drag-and-drop.

## Steps (Wrangler)

1. Install Node.js, then run `npx wrangler login`.
2. Create the database: `npx wrangler d1 create yourmum-advent`. Note the `database_id` it prints.
3. Create the tables: `npx wrangler d1 execute yourmum-advent --remote --file=schema.sql`
4. Deploy from this folder: `npx wrangler pages deploy . --project-name=yourmum-advent`
5. In the Cloudflare dashboard, open **Workers & Pages → yourmum-advent → Settings → Bindings**, add a **D1 database** binding named `DB` pointing at `yourmum-advent`, then deploy again (step 4).
6. Under **Custom domains**, add `advent.woollgar.co.uk`. If woollgar.co.uk's DNS is on Cloudflare, the record is created for you. Otherwise, add a CNAME record named `advent` that points to `yourmum-advent.pages.dev`.

## Reading submitted jokes

Open **Storage & Databases → D1 → yourmum-advent → Console** and run:

```sql
SELECT * FROM submissions ORDER BY created DESC;
```

## Testing before December

Add `#preview` to the address to unlock every door. Doors you open in preview mode aren't remembered, so your real calendar stays closed.
