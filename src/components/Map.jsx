import React, { useState } from 'react';
import SVGMap from './SVGMap';
import CityMarker from './CityMarker';
import LineOptions from './LineOptions';
import './Map.css';

function Map() {
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [lines, setLines] = useState([]);
  const [lineOptions, setLineOptions] = useState({
    visible: false,
    position: { x: 0, y: 0},
    line: null
  });

  const handleMarkerSelect = ({ x, y, cityName }) => {
    setSelectedMarkers((prevSelected) => {
      if (prevSelected.length === 1) {
        const newLine = {
          points: [prevSelected[0], { x, y, cityName }],
          className: 'line'
        };
        setLines((prevLines) => [...prevLines, newLine]);
        return [];
      }
      return [{ x, y, cityName }];
    });
  };

  const handleLineClick = (event, line) => {
    const rect = event.target.getBoundingClientRect();
    const position = {
      x: event.clientX + 10,
      y: event.clientY + 10
    };
    setLineOptions({ visible: true, position, line });
  }

  const handleCloseOptions = () => {
    setLineOptions({ visible: false, position: { x: 0, y: 0}, line: null });
  };

  const handleDeleteLine = () => {
    setLines((prevLines) => prevLines.filter((element) => element != lineOptions.line));
    handleCloseOptions();
  };

  const handleUpgradeLine = () => {
    setLines((prevLines) => 
      prevLines.map((line) => 
        line === lineOptions.line ? { ...line, className: 'doubleline' } : line
      )
    );
    handleCloseOptions();
  };

  return (
    <div className="map-container">
      <SVGMap lines={lines} onLineClick={handleLineClick}/>
      {lineOptions.visible && 
        <LineOptions 
          position={lineOptions.position} 
          onClose={handleCloseOptions}
          onDeleteLine={handleDeleteLine}
          onUpgradeLine={handleUpgradeLine}
        />
      }
      <CityMarker x={60} y={35} cityName="Clooj" onSelect={handleMarkerSelect} selectedMarkers={selectedMarkers} />
      <CityMarker x={20} y={20} cityName="Sibiu" onSelect={handleMarkerSelect} selectedMarkers={selectedMarkers} />
      <CityMarker x={50} y={50} cityName="Constanța" onSelect={handleMarkerSelect} selectedMarkers={selectedMarkers} />
    </div>
  );
}

export default Map;
