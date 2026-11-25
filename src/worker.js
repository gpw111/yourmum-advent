// Your Mum's Advent API on Cloudflare Workers.
// The page itself is on GitHub Pages; it calls these endpoints in the background:
//   GET  /api/ratings   -> [{ day, vote, n }]
//   POST /api/rate      { day, vote, prev }
//   POST /api/submit    { joke, name }
// Tables are created automatically on first use.

const ALLOWED_ORIGINS = [
  "https://advent.woollgar.co.uk",
  "https://gpw111.github.io"
];
const VOTES = ["groan", "heh", "howl"];
const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS ratings (day INTEGER NOT NULL, vote TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, vote))",
  "CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, joke TEXT NOT NULL, name TEXT, created TEXT NOT NULL)"
];
let ready = false;

function cors(request) {
  const origin = request.headers.get("Origin");
  const h = { "Vary": "Origin" };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

async function init(db) {
  if (ready) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  ready = true;
}

async function readBody(request) {
  try { return await request.json(); } catch { return null; }
}

async function handle(request, env, url) {
  if (url.pathname === "/" || url.pathname === "/api") return { status: 200, data: { ok: true, service: "Your Mum's Advent API" } };
  if (!env.DB) return { status: 503, data: { error: "Database not connected" } };
  await init(env.DB);

  if (url.pathname === "/api/ratings" && request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT day, vote, n FROM ratings").all();
    return { status: 200, data: results };
  }

  if (url.pathname === "/api/rate" && request.method === "POST") {
    const b = await readBody(request);
    const day = Number(b && b.day), vote = b && b.vote, prev = b && b.prev;
    if (!Number.isInteger(day) || day < 1 || day > 24 || !VOTES.includes(vote)) return { status: 400, data: { error: "Bad request" } };
    const stmts = [env.DB.prepare(
      "INSERT INTO ratings (day, vote, n) VALUES (?1, ?2, 1) ON CONFLICT(day, vote) DO UPDATE SET n = n + 1"
    ).bind(day, vote)];
    if (VOTES.includes(prev) && prev !== vote) {
      stmts.push(env.DB.prepare("UPDATE ratings SET n = MAX(n - 1, 0) WHERE day = ?1 AND vote = ?2").bind(day, prev));
    }
    await env.DB.batch(stmts);
    return { status: 200, data: { ok: true } };
  }

  if (url.pathname === "/api/submit" && request.method === "POST") {
    const b = await readBody(request);
    const joke = String((b && b.joke) || "").trim().slice(0, 280);
    const name = String((b && b.name) || "").trim().slice(0, 40);
    if (joke.length < 8) return { status: 400, data: { error: "Too short" } };
    await env.DB.prepare("INSERT INTO submissions (joke, name, created) VALUES (?1, ?2, datetime('now'))").bind(joke, name).run();
    return { status: 200, data: { ok: true } };
  }

  return { status: 404, data: { error: "Not found" } };
}

export default {
  async fetch(request, env) {
    const headers = cors(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    let out;
    try {
      out = await handle(request, env, new URL(request.url));
    } catch (e) {
      out = { status: 500, data: { error: "Server error" } };
    }
    return Response.json(out.data, { status: out.status, headers: { ...headers, "Cache-Control": "no-store" } });
  }
};
