// POST /api/rate {day, vote, prev}
const VOTES = ["groan", "heh", "howl"];
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }
  const day = Number(body.day), vote = body.vote, prev = body.prev;
  if (!Number.isInteger(day) || day < 1 || day > 24 || !VOTES.includes(vote)) return new Response("Bad request", { status: 400 });
  const stmts = [env.DB.prepare(
    "INSERT INTO ratings (day, vote, n) VALUES (?1, ?2, 1) ON CONFLICT(day, vote) DO UPDATE SET n = n + 1"
  ).bind(day, vote)];
  if (VOTES.includes(prev) && prev !== vote) {
    stmts.push(env.DB.prepare("UPDATE ratings SET n = MAX(n - 1, 0) WHERE day = ?1 AND vote = ?2").bind(day, prev));
  }
  await env.DB.batch(stmts);
  return Response.json({ ok: true });
}
