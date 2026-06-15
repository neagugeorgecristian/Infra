/**
 * PuzzleFlow.jsx — Frontend shim.
 *
 * computeDegreeMap, isAtMaxDegree, and buildAdjacency remain pure local
 * functions (they are synchronous helpers used in rendering, not flow eval).
 *
 * evaluateTypedFlow is now async and calls the backend API.
 * The returned shape is identical to the old synchronous version, with one
 * difference: activatedHybrids comes back as a Set (converted from the
 * Array the backend serialises over JSON).
 *
 * Callers inside useEffect should await it:
 *   const result = await evaluateTypedFlow({ cities, lines });
 *
 * The EMPTY_RESULT constant is provided for useState initialisers that need
 * a synchronous placeholder before the first API response arrives.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ── Empty result used as the synchronous initial value in useState() ──────────

export const EMPTY_FLOW_RESULT = {
  totalNeeds:      0,
  metNeeds:        0,
  unmetNeeds:      0,
  efficiency:      100,
  consumerStatus:  [],
  allDemandsMet:   false,
  activatedHybrids: new Set(),
};

// ── Async flow evaluation (calls backend) ─────────────────────────────────────

export async function evaluateTypedFlow({ cities = [], lines = [] }) {
  const response = await fetch(`${API_BASE}/api/evaluate-flow`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ cities, lines }),
  });

  if (!response.ok) {
    throw new Error(`evaluate-flow API error: ${response.status}`);
  }

  const data = await response.json();

  // Backend serialises activatedHybrids as an Array for JSON safety.
  // Convert back to a Set so the rest of the frontend code is unchanged.
  return {
    ...data,
    activatedHybrids: new Set(data.activatedHybrids ?? []),
  };
}

// ── Degree helpers (stay local — pure sync, used in render paths) ─────────────

export function computeDegreeMap(lines) {
  const degree = new Map();
  lines.filter(l => !l.isDeleted).forEach(l => {
    const a = l.points[0].cityName;
    const b = l.points[1].cityName;
    degree.set(a, (degree.get(a) ?? 0) + 1);
    degree.set(b, (degree.get(b) ?? 0) + 1);
  });
  return degree;
}

export function isAtMaxDegree(cityName, maxDegree, degreeMap) {
  if (maxDegree == null) return false;
  return (degreeMap.get(cityName) ?? 0) >= maxDegree;
}

// ── Legacy compat ─────────────────────────────────────────────────────────────

export function buildAdjacency(lines = []) {
  const adj = new Map();
  const add  = (a, b) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a).add(b);
  };
  lines.filter(l => !l.isDeleted).forEach(l => {
    add(l.points[0].cityName, l.points[1].cityName);
    add(l.points[1].cityName, l.points[0].cityName);
  });
  return adj;
}