/**
 * lineCost.js — backend port of src/components/utils.js.
 *
 * Pure JavaScript — no React, no DOM dependencies.
 *
 * This is the SINGLE SOURCE OF TRUTH for connection pricing. The frontend
 * keeps a local copy of this exact formula (see src/components/utils.js)
 * for instant hover-tooltip previews, but every price that actually
 * affects the player's budget must be confirmed here before the backend
 * accepts a purchase. Never trust a price the client reports back to you.
 */

const COST_PER_UNIT = 5;

// Coordinates arrive as percentages (0-100) of the SVG viewBox in every
// scenario file, so a sane upper bound catches malformed/garbage payloads
// without rejecting any legitimate city.
const MAX_COORD = 1000;

function isValidPoint(p) {
  return (
    p != null &&
    typeof p.x === 'number' && Number.isFinite(p.x) && p.x >= -MAX_COORD && p.x <= MAX_COORD &&
    typeof p.y === 'number' && Number.isFinite(p.y) && p.y >= -MAX_COORD && p.y <= MAX_COORD
  );
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Computes the cost of a connection between two points.
 * Throws if either point is missing or has non-finite/out-of-range coords,
 * so callers (routes) can turn that into a clean 400 instead of a 500 or
 * a silently wrong price (e.g. NaN, or a cost of 0 for malformed input).
 */
export function calculateLineCost(a, b) {
  if (!isValidPoint(a) || !isValidPoint(b)) {
    throw new Error('Invalid point: expected { x: number, y: number } within range');
  }
  return Math.round(calculateDistance(a, b) * COST_PER_UNIT);
}

export { isValidPoint };
