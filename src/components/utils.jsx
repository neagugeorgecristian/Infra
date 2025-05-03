export function calculateDistance(pointA, pointB) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateLineCost(pointA, pointB) {
  const distance = calculateDistance(pointA, pointB);
  const costPerUnit = 5; // adjust as needed
  return Math.round(distance * costPerUnit);
}
