import balkansSvg from '../assets/balkans.svg';

const REGION_UNLOCK = {
  initialUnlocked: ['RO'],

  regions: {
    RO: {
      label: 'Romania',
      unlockCost: 0,
      cities: [
        { x: 39, y: 28, cityName: 'Cluj' },
        { x: 79, y: 73, cityName: 'Constanța' },
      ],
    },
    MD: {
      label: 'Moldova',
      unlockCost: 500,
      cities: [
        { x: 62, y: 28, cityName: 'Bălți' },
        { x: 66, y: 40, cityName: 'Chișinău' },
      ],
    },
    BG: {
      label: 'Bulgaria',
      unlockCost: 800,
      cities: [
        { x: 27, y: 39, cityName: 'Sofia' },
        { x: 79, y: 29, cityName: 'Varna' },
      ],
    },
  },
};

const initialCities = REGION_UNLOCK.initialUnlocked.flatMap(
  id => REGION_UNLOCK.regions[id].cities
);

export default {
  name: 'Balkans',
  type: 'svg-region-unlock',
  svgMap: balkansSvg,
  cities: initialCities,
  regionUnlock: REGION_UNLOCK,
};