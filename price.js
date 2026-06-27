// Cloudflare Pages Function — GET /api/price?s=<symbol>
// Free, no API key. Proxies Stooq end-of-day CSV and returns small JSON.
// Why this exists: browsers block direct cross-origin fetches to most price
// sources (CORS). A tiny same-origin function sidesteps that. Deploy this on
// Cloudflare Pages (free) or Vercel and the dashboard's price row lights up.

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const s = (url.searchParams.get("s") || "").trim();

  // allow only safe symbol characters
  if (!/^[a-z0-9.\-]{1,12}$/i.test(s)) {
    return json({ error: "bad symbol" }, 400);
  }

  try {
    const r = await fetch(`https://stooq.com/q/d/l/?s=${encodeURIComponent(s)}&i=d`, {
      headers: { "User-Agent": "weather-desk/1.0" },
    });
    const csv = await r.text();

    // CSV header: Date,Open,High,Low,Close,Volume
    const rows = csv.trim().split("\n").slice(1).filter(Boolean);
    if (rows.length < 2) return json({ error: "no data for symbol", symbol: s }, 404);

    const parse = (line) => {
      const p = line.split(",");
      return { date: p[0], close: parseFloat(p[4]) };
    };
    const last = parse(rows[rows.length - 1]);
    const prev = parse(rows[rows.length - 2]);
    const changePct = prev.close ? ((last.close - prev.close) / prev.close) * 100 : 0;

    return json(
      {
        symbol: s,
        date: last.date,
        last: round(last.close),
        prevClose: round(prev.close),
        changePct: round(changePct, 2),
      },
      200,
      3600 // cache 1h at the edge — EOD data changes once a day
    );
  } catch (e) {
    return json({ error: "fetch failed" }, 502);
  }
}

function round(n, d = 2) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
function json(obj, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store",
    },
  });
}
