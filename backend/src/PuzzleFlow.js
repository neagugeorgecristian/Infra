/**
 * puzzleFlow.js — Edmonds-Karp max-flow with correct directional producer rule.
 *
 * This is the backend port of src/components/PuzzleFlow.jsx.
 * Pure JavaScript — no React, no DOM dependencies.
 *
 * THE CORE RULE:
 *   Any city with role === 'producer' is a pure source for ALL resources.
 *   No resource of any type can flow INTO a producer city.
 *   Edges adjacent to producers are always one-way OUTWARD, regardless of
 *   which resource is being evaluated.
 */

// ── Edmonds-Karp (BFS Ford-Fulkerson) ────────────────────────────────────────

function edmondsKarp(cap, source, sink) {
  const n    = cap.length;
  const flow = Array.from({ length: n }, () => new Array(n).fill(0));

  while (true) {
    const parent = new Array(n).fill(-1);
    parent[source] = source;
    const queue   = [source];
    let   reached = false;

    outer:
    while (queue.length) {
      const u = queue.shift();
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && cap[u][v] - flow[u][v] > 0) {
          parent[v] = u;
          if (v === sink) { reached = true; break outer; }
          queue.push(v);
        }
      }
    }

    if (!reached) break;

    let bottleneck = Infinity;
    for (let v = sink; v !== source; ) {
      const u = parent[v];
      bottleneck = Math.min(bottleneck, cap[u][v] - flow[u][v]);
      v = u;
    }

    for (let v = sink; v !== source; ) {
      const u = parent[v];
      flow[u][v] += bottleneck;
      flow[v][u] -= bottleneck;
      v = u;
    }
  }

  return flow;
}

// ── Effective supply map ──────────────────────────────────────────────────────

function getEffectiveSupply(cities, activatedHybrids) {
  const supplyMap = new Map();
  cities.forEach(c => {
    const isHybrid = c.role === 'hybrid';
    const active   = !isHybrid || activatedHybrids.has(c.cityName);
    const supply   = {};
    if (active) {
      Object.entries(c.supplyPerTick ?? {}).forEach(([r, v]) => {
        supply[r] = (supply[r] ?? 0) + v;
      });
    }
    supplyMap.set(c.cityName, supply);
  });
  return supplyMap;
}

// ── Single-resource max-flow ──────────────────────────────────────────────────

function runFlowForResource(resource, cities, effectiveSupply, lines) {
  const N      = cities.length;
  const SOURCE = 0;
  const SINK   = N + 1;
  const NODES  = N + 2;

  const cityIdx = new Map(cities.map((c, i) => [c.cityName, i + 1]));
  const cap     = Array.from({ length: NODES }, () => new Array(NODES).fill(0));

  const producerSet = new Set(
    cities.filter(c => c.role === 'producer').map(c => c.cityName)
  );

  // Source → each city actively supplying this resource
  cities.forEach((c, i) => {
    const supply = effectiveSupply.get(c.cityName)?.[resource] ?? 0;
    if (supply > 0) cap[SOURCE][i + 1] += supply;
  });

  // Connection edges — direction enforced by producer role
  lines.filter(l => !l.isDeleted).forEach(l => {
    const aName = l.points[0].cityName;
    const bName = l.points[1].cityName;
    const a = cityIdx.get(aName);
    const b = cityIdx.get(bName);
    if (a == null || b == null) return;

    const aIsProd = producerSet.has(aName);
    const bIsProd = producerSet.has(bName);

    if (aIsProd && !bIsProd) {
      cap[a][b] += 1;
    } else if (!aIsProd && bIsProd) {
      cap[b][a] += 1;
    } else {
      cap[a][b] += 1;
      cap[b][a] += 1;
    }
  });

  // Consumers → sink
  cities.forEach((c, i) => {
    const demand = (c.demand ?? {})[resource] ?? 0;
    if (demand > 0) cap[i + 1][SINK] += demand;
  });

  const flowMatrix = edmondsKarp(cap, SOURCE, SINK);

  const result = new Map();
  cities.forEach((c, i) => {
    const demand = (c.demand ?? {})[resource] ?? 0;
    if (demand > 0) {
      result.set(c.cityName, {
        received: Math.max(0, flowMatrix[i + 1][SINK]),
        demand,
      });
    }
  });

  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function evaluateTypedFlow({ cities = [], lines = [] }) {
  const resourceTypes = new Set();
  cities.forEach(c => {
    Object.keys(c.supplyPerTick ?? {}).forEach(r => resourceTypes.add(r));
    Object.keys(c.demand        ?? {}).forEach(r => resourceTypes.add(r));
  });

  // Iterative hybrid activation (fixed-point convergence)
  const activatedHybrids = new Set();
  let allResourceResults  = new Map();

  for (let iter = 0; iter <= cities.length; iter++) {
    const prevSize        = activatedHybrids.size;
    const effectiveSupply = getEffectiveSupply(cities, activatedHybrids);

    allResourceResults = new Map();
    for (const r of resourceTypes) {
      allResourceResults.set(r, runFlowForResource(r, cities, effectiveSupply, lines));
    }

    // Activate any hybrid whose every input demand is now met
    cities
      .filter(c => c.role === 'hybrid' && !activatedHybrids.has(c.cityName))
      .forEach(h => {
        const entries = Object.entries(h.demand ?? {});
        if (!entries.length) return;
        const allMet = entries.every(([r, d]) => {
          const info = allResourceResults.get(r)?.get(h.cityName);
          return (info?.received ?? 0) >= d;
        });
        if (allMet) activatedHybrids.add(h.cityName);
      });

    if (activatedHybrids.size === prevSize) break;
  }

  // Build consumer status
  let totalNeeds = 0;
  let metNeeds   = 0;
  const consumerStatus = [];

  cities.forEach(c => {
    const needs = c.needs ?? [];
    if (!needs.length) return;

    const perType = {};
    let   allMet  = true;

    needs.forEach(r => {
      totalNeeds += 1;
      const info     = allResourceResults.get(r)?.get(c.cityName);
      const received = info?.received ?? 0;
      const demand   = info?.demand   ?? (c.demand?.[r] ?? 1);
      const met      = received >= demand;
      perType[r]     = { met, received, demand };
      if (met) metNeeds += 1;
      else     allMet = false;
    });

    consumerStatus.push({ cityName: c.cityName, needs, perType, allMet });
  });

  const efficiency = totalNeeds === 0
    ? 100
    : Math.round((metNeeds / totalNeeds) * 100);

  return {
    totalNeeds,
    metNeeds,
    unmetNeeds: totalNeeds - metNeeds,
    efficiency,
    consumerStatus,
    allDemandsMet: totalNeeds > 0 && metNeeds === totalNeeds,
    // Convert Set → Array for JSON serialisation
    activatedHybrids: [...activatedHybrids],
  };
}

// ── Degree helpers ────────────────────────────────────────────────────────────

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