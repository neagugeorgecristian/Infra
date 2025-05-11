// src/customPaths.js

export const predefinedPaths = {
  "Constanța-Sibiu": {
    percentBased: true,
    d: (from, to) =>
      `M ${from.x}% ${from.y}% C ${from.x + 10}% ${from.y - 20}%, ${to.x - 10}% ${to.y + 20}%, ${to.x}% ${to.y}%`,
  },
  "Sibiu-Constanța": {
    percentBased: true,
    d: (from, to) =>
      `M ${to.x}% ${to.y}% C ${to.x - 10}% ${to.y + 20}%, ${from.x + 10}% ${from.y - 20}%, ${from.x}% ${from.y}%`,
  },
};
