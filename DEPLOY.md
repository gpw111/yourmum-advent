# Your Mum's Advent: deploying on Cloudflare Pages

- `public/index.html`: the calendar page
- `functions/api/[[path]].js`: the small API (`/api/ratings`, `/api/rate`, `/api/submit`)
- `wrangler.jsonc`: the project settings, including the `DB` binding to the `yourmum` D1 database

The function creates its own database tables the first time it's used, so you don't need to run any SQL.

## Create the Pages project

1. Go to **Workers & Pages → Create**, choose the **Pages** tab, then **Import an existing Git repository**.
2. Pick `gpw111/yourmum-advent`.
3. Name the project `yourmum-advent`, set the framework preset to **None**, leave the build command blank and set the build output directory to `public`.
4. Click **Save and Deploy**.

## Custom domain (your DNS stays where it is)

1. In the Pages project, open **Custom domains → Set up a custom domain** and enter `advent.woollgar.co.uk`.
2. At your DNS provider, add a CNAME record:
   - Name: `advent`
   - Target: `yourmum-advent.pages.dev`
3. Back in Cloudflare, wait for the domain to show as **Active**. The HTTPS certificate is issued automatically.

## Reading submitted jokes

Go to **D1 → yourmum → Console** and run:

```sql
SELECT * FROM submissions ORDER BY created DESC;
```

## Testing before December

Add `#preview` to the address to unlock every door. Doors you open in preview mode aren't remembered.
