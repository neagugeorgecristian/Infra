import balkansSvg from '../assets/balkans.svg';

const cities = [
  { x: 79, y: 29, cityName: 'Varna' },
  { x: 27, y: 39, cityName: 'Sofia' },
  { x: 55, y: 15, cityName: 'Ruse' },
  { x: 39, y: 54, cityName: 'Plovdiv' }
];

export default {
  name: 'Balkans',
  svgMap: balkansSvg,
  cities
};