import balkansSvg from '../assets/balkans.svg';

/**
 * Typed-flow puzzle data (exploratory).
 * Existing engine can safely ignore unknown fields.
 */

const R = {
  WATER: 'water',
  ENERGY: 'energy',
};

const ROLES = {
  PRODUCER: 'producer',
  CONSUMER: 'consumer',
  HYBRID: 'hybrid',
};

const starTemplate = ({ budget2, budget3, maxConnections3 }) => ({
  oneStar: 'Complete all required deliveries',
  twoStar: `Spend <= €${budget2}`,
  threeStar: `Spend <= €${budget3} and use <= ${maxConnections3} connections`,
});

export const infraL1 = {
  id: 'infra-l1',
  name: 'Infra L1 – First Pipe',
  type: 'puzzle-typed-flow',
  svgMap: balkansSvg,
  budget: 260,
  resources: [R.WATER],
  objectives: [
    'Deliver WATER to Old Town',
    'Use 1 connection',
  ],
  stars: starTemplate({ budget2: 240, budget3: 220, maxConnections3: 1 }),
  cities: [
    {
      x: 34, y: 37, cityName: 'Blue Spring',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {},
      supplyPerTick: { [R.WATER]: 1 },
    },
    {
      x: 56, y: 45, cityName: 'Old Town',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 },
      supplyPerTick: {},
    },
  ],
};

export const infraL2 = {
  id: 'infra-l2',
  name: 'Infra L2 – Branching District',
  type: 'puzzle-typed-flow',
  svgMap: balkansSvg,
  budget: 420,
  resources: [R.WATER],
  objectives: [
    'Deliver WATER to Hill Quarter',
    'Deliver WATER to Port Quarter',
  ],
  stars: starTemplate({ budget2: 390, budget3: 360, maxConnections3: 2 }),
  cities: [
    {
      x: 30, y: 42, cityName: 'Reservoir Delta',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {},
      supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 55, y: 32, cityName: 'Hill Quarter',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 },
      supplyPerTick: {},
    },
    {
      x: 61, y: 56, cityName: 'Port Quarter',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 },
      supplyPerTick: {},
    },
  ],
};

export const infraL3 = {
  id: 'infra-l3',
  name: 'Infra L3 – Tight Budget',
  type: 'puzzle-typed-flow',
  svgMap: balkansSvg,
  budget: 310, // intentionally tight
  resources: [R.WATER],
  objectives: [
    'Deliver WATER to all districts',
    'Stay under strict budget',
  ],
  stars: starTemplate({ budget2: 295, budget3: 280, maxConnections3: 2 }),
  cities: [
    {
      x: 26, y: 45, cityName: 'North Reservoir',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {},
      supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 50, y: 30, cityName: 'University',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 },
      supplyPerTick: {},
    },
    {
      x: 62, y: 47, cityName: 'Factory Row',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 },
      supplyPerTick: {},
    },
  ],
};

export const infraL4 = {
  id: 'infra-l4',
  name: 'Infra L4 – Twin Utilities',
  type: 'puzzle-typed-flow',
  svgMap: balkansSvg,
  budget: 620,
  resources: [R.WATER, R.ENERGY],
  objectives: [
    'Deliver WATER to Civic Center',
    'Deliver ENERGY to Industrial Park',
    'Deliver WATER + ENERGY to Metro Core',
  ],
  stars: starTemplate({ budget2: 580, budget3: 540, maxConnections3: 4 }),
  cities: [
    {
      x: 25, y: 55, cityName: 'River Intake',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {},
      supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 31, y: 25, cityName: 'Power Plant',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {},
      supplyPerTick: { [R.ENERGY]: 2 },
    },
    {
      x: 53, y: 57, cityName: 'Civic Center',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 },
      supplyPerTick: {},
    },
    {
      x: 58, y: 30, cityName: 'Industrial Park',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 },
      supplyPerTick: {},
    },
    {
      x: 69, y: 44, cityName: 'Metro Core',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 },
      supplyPerTick: {},
    },
  ],
};

export const infraL5 = {
  id: 'infra-l5',
  name: 'Infra L5 – Efficiency Test',
  type: 'puzzle-typed-flow',
  svgMap: balkansSvg,
  budget: 740,
  resources: [R.WATER, R.ENERGY],
  objectives: [
    'Satisfy all WATER and ENERGY demands',
    'Minimize extra lines (efficiency focus)',
  ],
  stars: starTemplate({ budget2: 700, budget3: 660, maxConnections3: 5 }),
  cities: [
    {
      x: 21, y: 58, cityName: 'South Aquifer',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {},
      supplyPerTick: { [R.WATER]: 3 },
    },
    {
      x: 25, y: 24, cityName: 'North Grid',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {},
      supplyPerTick: { [R.ENERGY]: 3 },
    },
    {
      x: 46, y: 42, cityName: 'Transfer Hub',
      role: ROLES.HYBRID, produces: [R.WATER], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 },
      supplyPerTick: { [R.WATER]: 1 },
    },
    {
      x: 60, y: 24, cityName: 'Tech Campus',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 },
      supplyPerTick: {},
    },
    {
      x: 63, y: 56, cityName: 'Harbor District',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 },
      supplyPerTick: {},
    },
    {
      x: 74, y: 40, cityName: 'Central Arcology',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 },
      supplyPerTick: {},
    },
  ],
};

const infraPuzzleScenarios = {
  'infra-l1': infraL1,
  'infra-l2': infraL2,
  'infra-l3': infraL3,
  'infra-l4': infraL4,
  'infra-l5': infraL5,
};

export default infraPuzzleScenarios;