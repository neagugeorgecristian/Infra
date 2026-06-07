import balkansSvg from '../assets/balkans.svg';
import italySvg from '../assets/it.svg';
import mdSvg from '../assets/md.svg';

/**
 * Typed-flow puzzle scenarios — Levels 1-11.
 *
 * Coordinate system (balkans.svg, viewBox 0 0 1200 1000):
 *   Romania:  x: 22–62%, y: 10–57%
 *   Moldova:  x: 58–80%, y:  6–38%
 *   Bulgaria: x: 23–65%, y: 62–92%
 *
 * Each city declares:
 *   role          – 'producer' | 'consumer' | 'hybrid'
 *   produces      – string[]   resource types emitted
 *   needs         – string[]   resource types required
 *   demand        – { [resource]: number }
 *   supplyPerTick – { [resource]: number }
 */

const R = {
  WATER:  'water',
  ENERGY: 'energy',
};

const ROLES = {
  PRODUCER: 'producer',
  CONSUMER: 'consumer',
  HYBRID:   'hybrid',
};

const starTemplate = ({ budget2, budget3, maxConnections3 }) => ({
  oneStar:   'Complete all required deliveries',
  twoStar:   `Spend ≤ €${budget2}`,
  threeStar: `Spend ≤ €${budget3} and use ≤ ${maxConnections3} connections`,
  thresholds: { budget2, budget3, maxConnections3 },
});

// ─────────────────────────────────────────────────────────────
// L1 – First Pipe
// Intro: a single connection, one producer, one consumer.
// ─────────────────────────────────────────────────────────────
export const infraL1 = {
  id: 'infra-l1', name: 'Infra L1 – First Pipe',
  type: 'puzzle-typed-flow', svgMap: mdSvg,
  budget: 260, resources: [R.WATER],
  objectives: ['Deliver WATER to Old Town', 'Use just 1 connection'],
  stars: starTemplate({ budget2: 240, budget3: 220, maxConnections3: 1 }),
  cities: [
    {
      x: 58, y: 49, cityName: 'Chișinău',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 1 },
    },
    {
      x: 44, y: 27, cityName: 'Bălți',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L2 – Branching District
// One source, two consumers — first fork decision.
// ─────────────────────────────────────────────────────────────
export const infraL2 = {
  id: 'infra-l2', name: 'Infra L2 – Branching District',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 420, resources: [R.WATER],
  objectives: ['Deliver WATER to Hill Quarter', 'Deliver WATER to Port Quarter'],
  stars: starTemplate({ budget2: 390, budget3: 360, maxConnections3: 2 }),
  cities: [
    {
      x: 30, y: 40, cityName: 'Reservoir Delta',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 48, y: 22, cityName: 'Hill Quarter',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
    {
      x: 54, y: 50, cityName: 'Port Quarter',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L3 – Tight Budget
// Chain routing: connecting all three cheaply rewards relaying.
// ─────────────────────────────────────────────────────────────
export const infraL3 = {
  id: 'infra-l3', name: 'Infra L3 – Tight Budget',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 310, resources: [R.WATER],
  objectives: ['Deliver WATER to all districts', 'Stay within the tight budget'],
  stars: starTemplate({ budget2: 295, budget3: 278, maxConnections3: 2 }),
  cities: [
    {
      x: 33, y: 15, cityName: 'North Reservoir',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 46, y: 30, cityName: 'University',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
    {
      x: 54, y: 43, cityName: 'Factory Row',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L4 – Twin Utilities
// Intro to dual resources: two producers, three consumer types.
// ─────────────────────────────────────────────────────────────
export const infraL4 = {
  id: 'infra-l4', name: 'Infra L4 – Twin Utilities',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 620, resources: [R.WATER, R.ENERGY],
  objectives: [
    'Deliver WATER to Civic Center',
    'Deliver ENERGY to Industrial Park',
    'Deliver WATER + ENERGY to Metro Core',
  ],
  stars: starTemplate({ budget2: 580, budget3: 540, maxConnections3: 4 }),
  cities: [
    {
      x: 26, y: 48, cityName: 'River Intake',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 30, y: 18, cityName: 'Power Plant',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 2 },
    },
    {
      x: 50, y: 52, cityName: 'Civic Center',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
    {
      x: 53, y: 26, cityName: 'Industrial Park',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 57, y: 38, cityName: 'Metro Core',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L5 – Efficiency Test
// Intro to hybrids: Transfer Hub needs energy to relay water.
// ─────────────────────────────────────────────────────────────
export const infraL5 = {
  id: 'infra-l5', name: 'Infra L5 – Efficiency Test',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 740, resources: [R.WATER, R.ENERGY],
  objectives: [
    'Power Transfer Hub with ENERGY',
    'Route WATER via Transfer Hub to Harbor District',
    'Supply all demands efficiently',
  ],
  stars: starTemplate({ budget2: 700, budget3: 660, maxConnections3: 5 }),
  cities: [
    {
      x: 25, y: 52, cityName: 'South Aquifer',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 3 },
    },
    {
      x: 30, y: 16, cityName: 'North Grid',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 3 },
    },
    {
      x: 44, y: 36, cityName: 'Transfer Hub',
      role: ROLES.HYBRID, produces: [R.WATER], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: { [R.WATER]: 1 },
    },
    {
      x: 54, y: 22, cityName: 'Tech Campus',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 56, y: 50, cityName: 'Harbor District',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
    {
      x: 61, y: 36, cityName: 'Central Arcology',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L6 – The Relay Station  ★★ Medium
// 6 cities. Key insight: Relay Node boosts water coverage
// eastward — connecting it cheaply is the winning move.
// ─────────────────────────────────────────────────────────────
export const infraL6 = {
  id: 'infra-l6', name: 'Infra L6 – The Relay Station',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 860, resources: [R.WATER, R.ENERGY],
  objectives: [
    'Power Relay Node with ENERGY',
    'Route WATER through Relay Node to Eastern Village',
    'Supply ENERGY to Northern Town and Southern Farm',
  ],
  stars: starTemplate({ budget2: 820, budget3: 765, maxConnections3: 5 }),
  cities: [
    {
      x: 26, y: 34, cityName: 'Alpine Spring',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 32, y: 18, cityName: 'Power Station',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 2 },
    },
    {
      // Hybrid: once powered by energy, re-emits water further east
      x: 46, y: 30, cityName: 'Relay Node',
      role: ROLES.HYBRID, produces: [R.WATER], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: { [R.WATER]: 1 },
    },
    {
      x: 54, y: 40, cityName: 'Eastern Village',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
    {
      x: 48, y: 18, cityName: 'Northern Town',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 38, y: 52, cityName: 'Southern Farm',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L7 – Dual Circuit  ★★ Medium
// 7 cities, two resource chains. The Pump Station hybrid means
// routing energy early unlocks cheaper water distribution.
// Two districts need both resources — forces crossing the chains.
// ─────────────────────────────────────────────────────────────
export const infraL7 = {
  id: 'infra-l7', name: 'Infra L7 – Dual Circuit',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 1050, resources: [R.WATER, R.ENERGY],
  objectives: [
    'Connect all four districts',
    'Deliver WATER + ENERGY to District Alpha and District Delta',
    'Route through Pump Station for max efficiency',
  ],
  stars: starTemplate({ budget2: 980, budget3: 920, maxConnections3: 6 }),
  cities: [
    {
      x: 24, y: 44, cityName: 'River Source',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 28, y: 18, cityName: 'Wind Farm',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 2 },
    },
    {
      // Hybrid: needs energy to pump water further; smart players connect
      // Wind Farm → Pump Station then Pump Station → eastern consumers
      x: 40, y: 32, cityName: 'Pump Station',
      role: ROLES.HYBRID, produces: [R.WATER], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: { [R.WATER]: 1 },
    },
    {
      x: 52, y: 24, cityName: 'District Alpha',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 54, y: 46, cityName: 'District Beta',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
    {
      x: 35, y: 52, cityName: 'District Gamma',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 60, y: 35, cityName: 'District Delta',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L8 – Italy  ★★★ Medium-Hard
// 7 cities. Central Hub converts water → energy, creating a
// second energy source. Players who discover this save connections.
// Budget is tight: brute-force routing won't reach 3 stars.
// ─────────────────────────────────────────────────────────────
export const infraL8 = {
  id: 'infra-l8', name: 'Infra L8 – Italy',
  type: 'puzzle-typed-flow', svgMap: italySvg,
  budget: 600, resources: [R.WATER, R.ENERGY],
  objectives: [
    'Supply both utilities to Capital City',
    'Keep all smaller towns operational',
    'Discover the Central Hub shortcut',
  ],
  stars: starTemplate({ budget2: 520, budget3: 450, maxConnections3: 5 }),
  cities: [
    {
      x: 33, y: 34, cityName: 'Genoa',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 3 },
    },
    {
      x: 33, y: 22, cityName: 'Milano',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 2 },
    },
    {
      // Converts water to energy — if connected to Genoa,
      // it becomes a second energy source for the east side
      x: 44, y: 41, cityName: 'Firenze',
      role: ROLES.HYBRID, produces: [R.ENERGY], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: { [R.ENERGY]: 1 },
    },
    {
      x: 49, y: 23, cityName: 'Venezia',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 71, y: 67, cityName: 'Bari',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 49, y: 58, cityName: 'Roma',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 78, y: 77, cityName: 'Otranto',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L9 – Cross-Border  ★★★ Hard
// 8 cities spanning Romania AND Moldova.
// Two hybrid nodes (Transit City, Moldova Relay) form a
// cross-border exchange: water flows east, energy flows west.
// Chisinau needs both — the relay chain must work in both directions.
// ─────────────────────────────────────────────────────────────
export const infraL9 = {
  id: 'infra-l9', name: 'Infra L9 – Cross-Border',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 1400, resources: [R.WATER, R.ENERGY],
  objectives: [
    'Connect Romanian infrastructure to Moldova',
    'Supply WATER + ENERGY to Chișinău',
    'Deliver ENERGY to Bălți via the relay chain',
  ],
  stars: starTemplate({ budget2: 1320, budget3: 1240, maxConnections3: 7 }),
  cities: [
    {
      x: 30, y: 38, cityName: 'Danube Source',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 3 },
    },
    {
      x: 28, y: 20, cityName: 'Hydro Plant',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 3 },
    },
    {
      // Romanian side relay: converts energy → extra water supply heading east
      x: 46, y: 42, cityName: 'Transit City',
      role: ROLES.HYBRID, produces: [R.WATER], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: { [R.WATER]: 1 },
    },
    {
      // Moldovan side relay: converts water → local energy
      x: 65, y: 24, cityName: 'Moldova Relay',
      role: ROLES.HYBRID, produces: [R.ENERGY], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: { [R.ENERGY]: 1 },
    },
    {
      x: 68, y: 34, cityName: 'Chișinău',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 62, y: 16, cityName: 'Bălți',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 54, y: 50, cityName: 'East Romania',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
    {
      x: 40, y: 52, cityName: 'South Romania',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L10 – The Bottleneck  ★★★ Hard
// 9 cities, 3 producers, 1 central hybrid, 5 consumers.
// Central Nexus: receives water → emits energy.
// Optimal play: route water into Nexus early, then use the
// generated energy to feed 3 energy consumers without separate
// lines all the way back to Wind Grid / Coal Plant.
// ─────────────────────────────────────────────────────────────
export const infraL10 = {
  id: 'infra-l10', name: 'Infra L10 – The Bottleneck',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 1550, resources: [R.WATER, R.ENERGY],
  objectives: [
    'Power Central Nexus with WATER',
    'Use Nexus-generated ENERGY for outer rim consumers',
    'Achieve all deliveries within budget',
  ],
  stars: starTemplate({ budget2: 1460, budget3: 1370, maxConnections3: 8 }),
  cities: [
    {
      x: 24, y: 32, cityName: 'Spring Valley',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 3 },
    },
    {
      x: 23, y: 50, cityName: 'Coal Plant',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 2 },
    },
    {
      x: 33, y: 14, cityName: 'Wind Grid',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 2 },
    },
    {
      // The bottleneck: receives water, becomes an energy hub
      // Smart routing: connect Spring Valley here, then Nexus fans energy outward
      x: 44, y: 36, cityName: 'Central Nexus',
      role: ROLES.HYBRID, produces: [R.ENERGY], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: { [R.ENERGY]: 2 },
    },
    {
      x: 54, y: 22, cityName: 'Northern Rim',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 58, y: 38, cityName: 'Eastern Gate',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 52, y: 52, cityName: 'Southern Port',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
    {
      x: 36, y: 52, cityName: 'Southwest Town',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 36, y: 18, cityName: 'Highland Fort',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L11 – Grand Infrastructure  ★★★ Expert
// 12 cities across Romania, Moldova, and Bulgaria.
// 4 producers + 2 hybrids + 6 consumers spanning 3 countries.
// Balkan Hub links Romania → Moldova chain.
// Moldova Exchange links Moldova → Bulgaria chain.
// Only the most efficient routing achieves 3 stars.
// ─────────────────────────────────────────────────────────────
export const infraL11 = {
  id: 'infra-l11', name: 'Infra L11 – Heh',
  type: 'puzzle-typed-flow', svgMap: balkansSvg,
  budget: 2000, resources: [R.WATER, R.ENERGY],
  objectives: [
    'Connect Romania, Moldova, and Bulgaria',
    'Satisfy all 6 major consumer cities',
    'Achieve master-level routing efficiency',
  ],
  stars: starTemplate({ budget2: 1900, budget3: 1760, maxConnections3: 10 }),
  cities: [
    // ── Producers (Romania) ───────────────────────────────────
    {
      x: 26, y: 26, cityName: 'Carpathian Spring',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 3 },
    },
    {
      x: 27, y: 50, cityName: 'Danube Plant',
      role: ROLES.PRODUCER, produces: [R.WATER], needs: [],
      demand: {}, supplyPerTick: { [R.WATER]: 2 },
    },
    {
      x: 32, y: 13, cityName: 'Northern Grid',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 3 },
    },
    {
      x: 43, y: 13, cityName: 'Eastern Grid',
      role: ROLES.PRODUCER, produces: [R.ENERGY], needs: [],
      demand: {}, supplyPerTick: { [R.ENERGY]: 2 },
    },
    // ── Hybrids ───────────────────────────────────────────────
    {
      // Romanian hub: converts energy → extra water for eastern Moldova
      x: 44, y: 38, cityName: 'Balkan Hub',
      role: ROLES.HYBRID, produces: [R.WATER], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: { [R.WATER]: 1 },
    },
    {
      // Moldovan exchange: converts water → local energy for Bulgaria chain
      x: 65, y: 26, cityName: 'Moldova Exchange',
      role: ROLES.HYBRID, produces: [R.ENERGY], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: { [R.ENERGY]: 1 },
    },
    // ── Consumers — Romania ───────────────────────────────────
    {
      x: 50, y: 22, cityName: 'Transylvania',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 54, y: 50, cityName: 'Black Sea Port',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    // ── Consumers — Moldova ───────────────────────────────────
    {
      x: 64, y: 15, cityName: 'Bălți',
      role: ROLES.CONSUMER, produces: [], needs: [R.ENERGY],
      demand: { [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 70, y: 32, cityName: 'Chișinău',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    // ── Consumers — Bulgaria ──────────────────────────────────
    {
      x: 32, y: 76, cityName: 'Sofia',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER, R.ENERGY],
      demand: { [R.WATER]: 1, [R.ENERGY]: 1 }, supplyPerTick: {},
    },
    {
      x: 46, y: 78, cityName: 'Plovdiv',
      role: ROLES.CONSUMER, produces: [], needs: [R.WATER],
      demand: { [R.WATER]: 1 }, supplyPerTick: {},
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────
const infraPuzzleScenarios = {
  'infra-l1':  infraL1,
  'infra-l2':  infraL2,
  'infra-l3':  infraL3,
  'infra-l4':  infraL4,
  'infra-l5':  infraL5,
  'infra-l6':  infraL6,
  'infra-l7':  infraL7,
  'infra-l8':  infraL8,
  'infra-l9':  infraL9,
  'infra-l10': infraL10,
  'infra-l11': infraL11,
};

export const PUZZLE_LEVEL_ORDER = [
  'infra-l1',  'infra-l2',  'infra-l3',  'infra-l4',
  'infra-l5',  'infra-l6',  'infra-l7',  'infra-l8',
  'infra-l9',  'infra-l10', 'infra-l11',
];

export default infraPuzzleScenarios;