// GET /api/ratings -> [{day, vote, n}]
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT day, vote, n FROM ratings").all();
  return Response.json(results, { headers: { "cache-control": "no-store" } });
}
