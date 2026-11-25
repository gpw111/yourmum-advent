# Your Mum's Advent: how it's hosted

- **The page** (`docs/`) is on **GitHub Pages** at `advent.woollgar.co.uk`, set by `docs/CNAME`.
- **Ratings and joke submissions** (`src/worker.js`) run on a **Cloudflare Worker** called `yourmum-advent`, using the `yourmum` D1 database. The page calls it in the background; visitors never leave the site.

Pushing to `main` updates both.

## GitHub Pages

1. Make the repo public: **Settings → General → Danger Zone → Change visibility**.
2. Go to **Settings → Pages**. Set **Source** to *Deploy from a branch*, **Branch** to `main` and the folder to `/docs`, then save.
3. Under **Custom domain**, check that it says `advent.woollgar.co.uk`. It's picked up from `docs/CNAME`.
4. At 123 Reg, add a DNS record: type **CNAME**, name `advent`, value `gpw111.github.io.`
5. Back in **Settings → Pages**, once the DNS check passes, tick **Enforce HTTPS**. The certificate can take up to an hour.

## Cloudflare Worker

- It builds from this repo with the deploy command `npx wrangler deploy`.
- Its address is set in `docs/index.html` (`const API = ...`).
- The sites allowed to call it are listed in `ALLOWED_ORIGINS` at the top of `src/worker.js`.

## Reading submitted jokes

Go to **Cloudflare → D1 → yourmum → Console** and run:

```sql
SELECT * FROM submissions ORDER BY created DESC;
```

## Testing before December

Add `#preview` to the address to unlock every door. Doors you open in preview mode aren't remembered.
