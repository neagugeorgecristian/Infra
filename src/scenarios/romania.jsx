import roSvg from '../assets/ro.svg';

const cities = [
  { x: 79, y: 58, cityName: 'Constanța' },
  { x: 47, y: 36, cityName: 'Sibiu' },
  { x: 39, y: 25, cityName: 'Clooj' },
  { x: 44, y: 55, cityName: 'Craiova' }
];

export default {
  name: 'Romania',
  svgMap: roSvg,
  cities
};