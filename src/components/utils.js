/**
 * utils.js
 *
 * calculateLineCost stays synchronous and local — it's called on every
 * render while a marker is selected (hover-price tooltips in SVGMap.jsx /
 * PuzzleSVGMap.jsx, and the exhaustive pair-scan in PuzzleMap.jsx's
 * getMinRemainingConnectionCost). Going async there would mean either
 * flickering tooltips or a network request per mouse-move frame, so this
 * formula is intentionally duplicated from backend/src/lineCost.js for
 * INSTANT PREVIEWS ONLY.
 *
 * confirmLineCost is the backend-authoritative version. It must be awaited
 * before any purchase actually debits the player's budget — see Map.jsx's
 * trySpendMoney call sites and PuzzleMap.jsx's handleMarkerClick. The
 * server independently recomputes the price from backend/src/lineCost.js
 * and rejects malformed/out-of-range points; the client never gets to
 * dictate its own price.
 *
 * If you ever change the pricing formula, change it in BOTH this file and
 * backend/src/lineCost.js, or the preview tooltip and the actual charged
 * price will silently disagree.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const COST_PER_UNIT = 5;

const calculateDistance = (a, b) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// ── Synchronous local preview (render paths only — never charges money) ──────

export const calculateLineCost = (a, b) =>
  Math.round(calculateDistance(a, b) * COST_PER_UNIT);

// ── Async backend-authoritative cost (commit paths — actually charges money) ─

export async function confirmLineCost(a, b) {
  const response = await fetch(`${API_BASE}/api/line-cost`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ a, b }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `line-cost API error: ${response.status}`);
  }

  const data = await response.json();
  return data.cost;
}