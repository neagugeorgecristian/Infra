import roSvg from '../assets/ro.svg';
import mdSvg from '../assets/md.svg';
import bgSvg from '../assets/bg.svg';

// Each country's position as % of the 1200×1000 combined container.
// Sized so their pixel dimensions match each SVG's native aspect ratio:
//   Romania  1000×704  → 1.42  ≈ 744×524 px  (62% × 52%)
//   Moldova  1000×1000 → 1.00  ≈ 288×288 px  (24% × 29%)  (some letterbox accepted)
//   Bulgaria 1000×651  → 1.54  ≈ 636×413 px  (53% × 41%)
export const COUNTRY_LAYOUT = {
  romania:  { left: 2,  top: 5,  width: 62, height: 55 },
  moldova:  { left: 64, top: 5,  width: 25, height: 38 },
  bulgaria: { left: 5,  top: 62, width: 60, height: 35 },
};

export const COUNTRY_FILES = {
  romania:  roSvg,
  moldova:  mdSvg,
  bulgaria: bgSvg,
};

export const UNLOCK_COSTS = {
  moldova:  500,
  bulgaria: 800,
};

// Transform a city's local percentage (within its country SVG) into
// a percentage of the combined 1200×1000 container.
const transform = (city, key) => {
  const l = COUNTRY_LAYOUT[key];
  return {
    ...city,
    x: parseFloat((l.left + (city.x / 100) * l.width).toFixed(2)),
    y: parseFloat((l.top  + (city.y / 100) * l.height).toFixed(2)),
  };
};

export const COUNTRY_CITIES = {
  romania: [
    { x: 79, y: 73, cityName: 'Constanța' },
    { x: 47, y: 46, cityName: 'Sibiu'     },
    { x: 39, y: 28, cityName: 'Cluj'      },
    { x: 44, y: 67, cityName: 'Craiova'   },
  ].map(c => transform(c, 'romania')),

  moldova: [
    { x: 58, y: 49, cityName: 'Chișinău' },
    { x: 44, y: 27, cityName: 'Bălți'    },
  ].map(c => transform(c, 'moldova')),

  bulgaria: [
    { x: 27, y: 39, cityName: 'Sofia' },
    { x: 79, y: 29, cityName: 'Varna' },
  ].map(c => transform(c, 'bulgaria')),
};

export default {
  name:    'Europe',
  type:    'europe',
  svgMap:  null,
  cities:  COUNTRY_CITIES.romania,
};