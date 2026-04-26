import React from 'react';
import { useParams } from 'react-router-dom';
import Map from '../components/Map';
import romania from '../scenarios/romania';
import bulgaria from '../scenarios/bulgaria';
import moldova from '../scenarios/moldova';
import europeScenario from '../scenarios/europe';
import balkans from '../scenarios/balkans';

function GamePage({ selectedMarkers, onMarkerClick }) {
  const { id } = useParams();

  const scenarioMap = {
    romania,
    bulgaria,
    moldova,
    balkans,
    europe: europeScenario
  };

  const scenario = scenarioMap[id];

  if (!scenario) return <p>Scenario not found</p>;

  return (
    <Map 
      svgMap={scenario.svgMap} 
      cities={scenario.cities} 
      scenarioName={scenario.name}
      scenarioType={scenario.type}
    />
  );
}

export default GamePage;