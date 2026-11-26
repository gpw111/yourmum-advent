# Your Mum's Advent: how it's hosted

- **The pages** (`docs/`) are on **GitHub Pages** at `advent.woollgar.co.uk`, set by `docs/CNAME`:
  - `docs/index.html`: Your Mum's Advent at `/`
  - `docs/sonic/index.html`: Sonic Advent at `/sonic/`
  - `docs/kpop/index.html`: KPop Demon Hunters Advent at `/kpop/`
  - `docs/bakeoff/index.html`: Bake Off Advent at `/bakeoff/`
  - `docs/pokemon/index.html`: Pokémon Advent at `/pokemon/`
  - `docs/boobs/index.html`: Boob Advent at `/boobs/`
  - `docs/cranes/index.html`: Crane Advent at `/cranes/`
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
- Its address is `https://yourmum-advent.iamthebest111.workers.dev`, set in `docs/index.html` (`const API = ...`).
- The sites allowed to call it are listed in `ALLOWED_ORIGINS` at the top of `src/worker.js`.

## Reading submitted jokes

Go to **Cloudflare → D1 → yourmum → Console** and run:

```sql
SELECT * FROM submissions ORDER BY created DESC;        -- Your Mum's Advent
SELECT * FROM submissions_sonic ORDER BY created DESC;  -- Sonic Advent
SELECT * FROM submissions_kpop ORDER BY created DESC;   -- KPop Demon Hunters Advent
SELECT * FROM submissions_bakeoff ORDER BY created DESC; -- Bake Off Advent
SELECT * FROM submissions_pokemon ORDER BY created DESC; -- Pokémon Advent
SELECT * FROM submissions_boobs ORDER BY created DESC;   -- Boob Advent
SELECT * FROM submissions_cranes ORDER BY created DESC;  -- Crane Advent
```

Each calendar keeps its own votes and submissions (`ratings`, `ratings_sonic`, `ratings_kpop`, `ratings_bakeoff`, `ratings_pokemon`, `ratings_boobs`, `ratings_cranes`).

## Testing before December

Add `#preview` to the address to unlock every door. Doors you open in preview mode aren't remembered.
