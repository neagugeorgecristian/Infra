import bgSvg from '../assets/bg.svg';

const cities = [
  { x: 79, y: 23, cityName: 'Varna' },
  { x: 27, y: 33, cityName: 'Sofia' },
  { x: 55, y: 12, cityName: 'Ruse' },
  { x: 39, y: 44, cityName: 'Plovdiv' }
];

export default {
  name: 'Bulgaria',
  svgMap: bgSvg,
  cities
};