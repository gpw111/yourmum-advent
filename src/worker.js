// Your Mum's Advent: serves the page from ./public and the small API under /api/.
// The D1 database (binding "DB") is optional: without it the page still works,
// ratings show no counts and the joke form says to try later.

const VOTES = ["groan", "heh", "howl"];
const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS ratings (day INTEGER NOT NULL, vote TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, vote))",
  "CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, joke TEXT NOT NULL, name TEXT, created TEXT NOT NULL)"
];
let ready = false;

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "no-store" } });

async function init(db) {
  if (ready) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  ready = true;
}

async function body(request) {
  try { return await request.json(); } catch { return null; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (!env.DB) return json({ error: "Database not connected yet" }, 503);
    await init(env.DB);

    if (url.pathname === "/api/ratings" && request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT day, vote, n FROM ratings").all();
      return json(results);
    }

    if (url.pathname === "/api/rate" && request.method === "POST") {
      const b = await body(request);
      const day = Number(b && b.day), vote = b && b.vote, prev = b && b.prev;
      if (!Number.isInteger(day) || day < 1 || day > 24 || !VOTES.includes(vote)) return json({ error: "Bad request" }, 400);
      const stmts = [env.DB.prepare(
        "INSERT INTO ratings (day, vote, n) VALUES (?1, ?2, 1) ON CONFLICT(day, vote) DO UPDATE SET n = n + 1"
      ).bind(day, vote)];
      if (VOTES.includes(prev) && prev !== vote) {
        stmts.push(env.DB.prepare("UPDATE ratings SET n = MAX(n - 1, 0) WHERE day = ?1 AND vote = ?2").bind(day, prev));
      }
      await env.DB.batch(stmts);
      return json({ ok: true });
    }

    if (url.pathname === "/api/submit" && request.method === "POST") {
      const b = await body(request);
      const joke = String((b && b.joke) || "").trim().slice(0, 280);
      const name = String((b && b.name) || "").trim().slice(0, 40);
      if (joke.length < 8) return json({ error: "Too short" }, 400);
      await env.DB.prepare("INSERT INTO submissions (joke, name, created) VALUES (?1, ?2, datetime('now'))").bind(joke, name).run();
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  }
};
