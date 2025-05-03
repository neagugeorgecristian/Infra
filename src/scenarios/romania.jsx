import roSvg from '../assets/ro.svg';

const cities = [
  { x: 79, y: 73, cityName: 'Constanța' },
  { x: 47, y: 46, cityName: 'Sibiu' },
  { x: 39, y: 28, cityName: 'Clooj' },
  { x: 44, y: 67, cityName: 'Craiova' }
];

export default {
  name: 'Romania',
  svgMap: roSvg,
  cities
};