// POST /api/submit {joke, name}
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }
  const joke = String(body.joke || "").trim().slice(0, 280);
  const name = String(body.name || "").trim().slice(0, 40);
  if (joke.length < 8) return new Response("Too short", { status: 400 });
  await env.DB.prepare("INSERT INTO submissions (joke, name, created) VALUES (?1, ?2, datetime('now'))").bind(joke, name).run();
  return Response.json({ ok: true });
}
