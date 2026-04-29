import React from 'react';
import { useParams } from 'react-router-dom';

// Classic game engine (Romania / Bulgaria / Moldova / Balkans)
import Map from '../components/Map';

// ── NEW: isolated puzzle engine ──────────────────────────────────────────────
// Only imported when the scenario type requires it.
// This keeps the classic engine's bundle untouched.
import PuzzleMap from '../components/PuzzleMap';

// Scenarios
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

  // ── Routing branch ────────────────────────────────────────────────────────
  // puzzle-typed-flow scenarios get their own self-contained controller.
  // Every other type continues to use the classic Map component unchanged.
  if (scenario.type === 'puzzle-typed-flow') {
    return <PuzzleMap scenario={scenario} />;
  }

  // Classic path — props signature unchanged
  return (
    <Map
      scenario={scenario}
      svgMap={scenario.svgMap}
      cities={scenario.cities}
      scenarioName={scenario.name}
      scenarioType={scenario.type}
      regionUnlock={scenario.regionUnlock}
    />
  );
}

export default GamePage;
