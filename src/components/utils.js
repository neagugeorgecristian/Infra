const COST_PER_UNIT = 5;

const calculateDistance = (a, b) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

export const calculateLineCost = (a, b) =>
  Math.round(calculateDistance(a, b) * COST_PER_UNIT);