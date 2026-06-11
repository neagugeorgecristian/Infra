import React from 'react';
import { useParams } from 'react-router-dom';

import Map from '../components/Map';
import PuzzleMap from '../components/PuzzleMap';
import MinWindowGate from '../components/MinWindowGate';

import romania  from '../scenarios/romania';
import bulgaria from '../scenarios/bulgaria';
import moldova  from '../scenarios/moldova';
import balkans  from '../scenarios/balkans';
import infraPuzzleScenarios from '../scenarios/infraPuzzleLevels';

function GamePage({ selectedMarkers, onMarkerClick }) {
  const { id } = useParams();

  const scenarioMap = {
    romania,
    bulgaria,
    moldova,
    balkans,
    ...infraPuzzleScenarios,
  };

  const scenario = scenarioMap[id];
  if (!scenario) return <p>Scenario not found: {id}</p>;

  const content = scenario.type === 'puzzle-typed-flow'
    ? <PuzzleMap key={id} scenario={scenario} />
    : (
      <Map
        key={id}
        scenario={scenario}
        svgMap={scenario.svgMap}
        cities={scenario.cities}
        scenarioName={scenario.name}
        scenarioType={scenario.type}
        regionUnlock={scenario.regionUnlock}
      />
    );

  return (
    <MinWindowGate>
      {content}
    </MinWindowGate>
  );
}

export default GamePage;