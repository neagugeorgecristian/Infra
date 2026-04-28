// src/components/puzzleFlow.js

export function buildAdjacency(lines = []) {
  const adj = new Map();

  const add = (a, b) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a).add(b);
  };

  lines
    .filter(l => !l.isDeleted)
    .forEach(l => {
      const a = l.points[0].cityName;
      const b = l.points[1].cityName;
      add(a, b);
      add(b, a);
    });

  return adj;
}

export function evaluateTypedFlow({ cities = [], lines = [] }) {
  const adj = buildAdjacency(lines);

  const producersByType = new Map();
  for (const c of cities) {
    const produces = c.produces || [];
    produces.forEach(t => {
      if (!producersByType.has(t)) producersByType.set(t, []);
      producersByType.get(t).push(c.cityName);
    });
  }

  const bfs = (starts = []) => {
    const q = [...starts];
    const seen = new Set(starts);
    while (q.length) {
      const cur = q.shift();
      for (const nxt of adj.get(cur) || []) {
        if (!seen.has(nxt)) {
          seen.add(nxt);
          q.push(nxt);
        }
      }
    }
    return seen;
  };

  const reachableByType = new Map();
  for (const [type, starts] of producersByType.entries()) {
    reachableByType.set(type, bfs(starts));
  }

  let totalNeeds = 0;
  let metNeeds = 0;
  const consumerStatus = [];

  for (const c of cities) {
    const needs = c.needs || [];
    if (!needs.length) continue;

    const perType = {};
    for (const t of needs) {
      totalNeeds += 1;
      const served = reachableByType.get(t)?.has(c.cityName) || false;
      if (served) metNeeds += 1;
      perType[t] = served;
    }

    consumerStatus.push({
      cityName: c.cityName,
      needs,
      perType,
      allMet: needs.every(t => perType[t]),
    });
  }

  const efficiency = totalNeeds === 0 ? 100 : Math.round((metNeeds / totalNeeds) * 100);

  return {
    totalNeeds,
    metNeeds,
    unmetNeeds: totalNeeds - metNeeds,
    efficiency,
    consumerStatus,
    allDemandsMet: totalNeeds > 0 ? metNeeds === totalNeeds : false,
  };
}