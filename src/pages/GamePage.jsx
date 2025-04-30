import React from 'react';
import { useParams } from 'react-router-dom';
import Map from '../components/Map';
import romania from '../scenarios/romania';
import bulgaria from '../scenarios/bulgaria';
import moldova from '../scenarios/moldova';

function GamePage({ selectedMarkers, onMarkerClick }) {
  const { id } = useParams();

  const scenarioMap = {
    romania,
    bulgaria,
    moldova
  };

  const scenario = scenarioMap[id];

  if (!scenario) return <p>Scenario not found</p>;

  return (
    <Map 
      svgMap={scenario.svgMap} 
      cities={scenario.cities} 
      scenarioName={scenario.name}
      selectedMarkers={selectedMarkers}
      onMarkerClick={onMarkerClick}
    />
  );
}

export default GamePage;
