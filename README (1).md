# Crop & Energy Weather Desk

A single-page dashboard that shows, for four weather-exposed markets, **how current
conditions in each market's key region compare to its own 10-year seasonal normal** —
and the direction that anomaly has historically pushed supply or demand.

Markets covered: **Coffee (arabica), Cocoa, Wheat (HRW), Natural Gas.**

> **It is not a price predictor and not financial advice.** Public weather forecasts are
> already priced into futures by professional desks long before a free app can act on them.
> This is a *context* tool: it surfaces the weather story behind a market so you can do
> better-informed research. Do not treat any signal as an edge or an arbitrage.

---

## How it works

| Step | Source | Cost |
|---|---|---|
| Forecast (next 16 days) for each region | Open-Meteo Forecast API | Free, **no key** |
| 10-year "normal" for the same calendar window | Open-Meteo ERA5 archive | Free, **no key** |
| Anomaly = forecast vs. normal → signal | computed in the browser | Free |
| End-of-day price (optional) | Stooq, via a tiny proxy function | Free, **no key** |

Each market maps to the region and variable that actually drives it:

- **Coffee** → South Minas Gerais, Brazil → *frost / drought* (nightly low temp + rainfall)
- **Cocoa** → San-Pédro/Soubré, Côte d'Ivoire → *rainfall* (drought vs. disease-spreading wet)
- **Wheat** → Kansas, USA → *drought + heat* during grain-fill
- **Natural gas** → US Midwest → *temperature distance from normal* (heating/cooling demand)

The weather logic is fully live with **zero configuration**. Prices are an optional add-on.

---

## Deploy — pick one (both free)

### Option A · GitHub Pages (weather only, simplest)
1. Create a new GitHub repo and upload `index.html`.
2. Repo **Settings → Pages → Source: `main` branch, root**.
3. Open the published URL. Weather anomalies work immediately. The price row will say
   "Live prices off" because GitHub Pages can't run the proxy function.

### Option B · Cloudflare Pages (weather **+** live prices, still free)
1. Push this whole folder (`index.html` **and** the `functions/` folder) to a GitHub repo.
2. Go to **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**,
   pick the repo, accept the defaults (no build command, output dir = `/`), Deploy.
3. Cloudflare auto-detects `functions/api/price.js` and serves it at `/api/price`.
   The price row now shows delayed end-of-day quotes.

Vercel works the same way if you prefer it (the `functions/` convention is compatible
with minor tweaks).

---

## Adjusting it

- **Symbols:** set per market in `COMMODITIES[].symbol` in `index.html` (Stooq tickers,
  e.g. `kc.f`, `cc.f`, `zw.f`, `ng.f`). If a price row 404s, the symbol is the thing to fix.
- **Regions:** change `lat`/`lon` to track a different growing belt (e.g. swap Kansas for a
  Russian or Australian wheat region, or add a second coffee point in Brazil).
- **Normal window:** `NORMAL_YEARS` (default 10). More years = smoother normal, more data per load.
- **Signal thresholds:** all in the `signal()` function, written as plain hedged language.

---

## Honest limitations

- One point per region is a simplification; real desks use whole-belt grids.
- ERA5 archive lags ~5 days, so "normal" excludes the last few days (handled in code).
- Correlations between weather and price are real but **noisy and regime-dependent** — a
  drought doesn't *have* to move price if it's already expected or offset elsewhere.
- Free price data is end-of-day and delayed; never trade off it.

## Attribution & licence

Weather data © Open-Meteo.com, licensed CC-BY 4.0 — attribution is shown in the page footer
and is required if you redistribute. Keep it there.
