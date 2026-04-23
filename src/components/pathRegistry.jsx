// Key is always the two city names sorted alphabetically, joined with ||
// This means CityA→CityB and CityB→CityA share the same path definition
export const getPathKey = (nameA, nameB) => [nameA, nameB].sort().join('||');

// points: array of {x, y} in canvas %. null entries mean "use the city's own coords".
// segmentSpeeds: one value per segment (length = points.length - 1).
//   1.0 = normal speed, 0.3 = mountain slow, 1.5 = fast flatland
export const PATH_REGISTRY = {
  // ── Romania ────────────────────────────────────────────────────────
  'Cluj||Sibiu': {
    points: [null, { x: 44.5, y: 37.5 }, null],
    segmentSpeeds: [0.4, 0.4],          // slow — Transylvanian Alps
  },
  'Constanța||Sibiu': {
    points: [null, { x: 63, y: 53 }, { x: 52, y: 49 }, null],
    segmentSpeeds: [1.0, 0.5, 1.0],
  },
  // ── Cross-border (Europe scenario) ────────────────────────────────
  'Craiova||Sofia': {
    points: [null, { x: 30, y: 73 }, { x: 26, y: 78 }, null],
    segmentSpeeds: [0.8, 0.8],
  },
  'Constanța||Chișinău': {
    points: [null, { x: 72, y: 38 }, null],
    segmentSpeeds: [1.0, 1.0],
  },
};

// Build the SVG 'd' attribute from resolved waypoints
export const buildPathD = (resolvedPoints) => {
  if (resolvedPoints.length < 2) return '';
  const [start, ...rest] = resolvedPoints;
  const lineCmds = rest.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} ${lineCmds}`;
};

// Compute keyTimes and keyPoints for bounce (A→B→A) animation
// with per-segment speed variation. Returns { keyTimes, keyPoints, totalDuration }.
export const buildAnimationKeys = (resolvedPoints, segmentSpeeds, baseSpeed = 100) => {
  const segCount = resolvedPoints.length - 1;

  // Euclidean length of each segment (pixels — caller must supply px coords)
  // We receive percent coords; convert at call site or pass px directly.
  // Here we accept px-resolved points for accuracy.
  const segLengths = resolvedPoints.map((p, i) => {
    if (i === 0) return 0;
    const prev = resolvedPoints[i - 1];
    return Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
  }).slice(1);

  const speeds    = segmentSpeeds ?? Array(segCount).fill(1);
  const segTimes  = segLengths.map((len, i) => len / (baseSpeed * (speeds[i] ?? 1)));
  const totalHalf = segTimes.reduce((a, b) => a + b, 0);
  const waitTime  = 2;
  const total     = 2 * totalHalf + 2 * waitTime;

  // Forward pass: A → B
  const forwardCumulative = [0];
  segTimes.forEach(t => forwardCumulative.push(forwardCumulative.at(-1) + t));

  // Build keyPoints (progress along path 0→1)
  const forwardKP = forwardCumulative.map(t => t / totalHalf);   // 0 … 1

  // Pause at B, return (mirror forward), pause at A
  const pauseAtB   = (totalHalf + waitTime)  / total;
  const returnStart = pauseAtB;
  const returnKP   = [...forwardKP].reverse();
  const returnTimes = forwardCumulative.slice().reverse()
    .map(t => (totalHalf + waitTime + (totalHalf - t)) / total);

  const pauseAtA = (2 * totalHalf + 2 * waitTime) / total; // = 1

  // Merge into single keyTimes / keyPoints arrays
  const kt = [
    ...forwardCumulative.map(t => t / total),               // 0 → totalHalf
    pauseAtB,                                                // pause at B
    ...returnTimes.slice(1),                                 // return
    pauseAtA,                                                // = 1
  ];

  const kp = [
    ...forwardKP,            // 0 → 1
    1,                       // stay at 1
    ...returnKP.slice(1),    // 1 → 0
    0,                       // stay at 0
  ];

  // Deduplicate consecutive identical keyTimes (SVG requires strictly increasing)
  const merged = kt.reduce((acc, t, i) => {
    if (acc.length && Math.abs(t - acc.at(-1).t) < 0.0001) return acc;
    acc.push({ t, kp: kp[i] });
    return acc;
  }, []);

  return {
    keyTimes:      merged.map(v => v.t.toFixed(4)).join('; '),
    keyPoints:     merged.map(v => v.kp.toFixed(4)).join('; '),
    keySplines:    merged.slice(0, -1).map(() => '0.4 0 0.6 1').join('; '),
    totalDuration: total,
  };
};