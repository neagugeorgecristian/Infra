import React, { useState } from 'react';
import SVGMap from './SVGMap';
import CityMarker from './CityMarker';
import LineOptions from './LineOptions';
import CityInfo from './CityInfo';
import './Map.css';

function Map() {
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [lines, setLines] = useState([]);
  const [lineOptions, setLineOptions] = useState({
    visible: false,
    position: { x: 0, y: 0},
    line: null
  });
  const [infoCity, setInfoCity] = useState(null);

  const handleMarkerSelect = ({ x, y, cityName }) => {
    setSelectedMarkers((prevSelected) => {
      // Prevent duplicate lines from the same city to itself
      if (prevSelected.length === 1 && prevSelected[0].cityName !== cityName) {
        const newLine = {
          points: [prevSelected[0], { x, y, cityName }],
          className: 'line',
          speedMultiplier: 1
        };
        setLines((prevLines) => [...prevLines, newLine]);
        return [];
      }
      return [{ x, y, cityName }];
    });
  };

  const handleMapClick = (event) => {
    // If the click target is not a city marker or a descendant
    if (!event.target.closest('.city-marker')) {
      setSelectedMarkers([]);
    }
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
        line === lineOptions.line 
          ? { 
              ...line, 
              className: 'doubleline',
              speedMultiplier: line.speedMultiplier * 1.33
            } 
          : line
      )
    );
    handleCloseOptions();
  };

  return (
    <div className="map-container" onClick={handleMapClick}>
      <SVGMap lines={lines} onLineClick={handleLineClick}/>
      {lineOptions.visible && 
        <LineOptions 
          position={lineOptions.position} 
          onClose={handleCloseOptions}
          onDeleteLine={handleDeleteLine}
          onUpgradeLine={handleUpgradeLine}
          onShowInfo={() => setInfoCity(lineOptions.line?.points[0])}
        />
      }
      <CityMarker x={60} y={35} cityName="Clooj" onSelect={handleMarkerSelect} selectedMarkers={selectedMarkers} />
      <CityMarker x={20} y={20} cityName="Sibiu" onSelect={handleMarkerSelect} selectedMarkers={selectedMarkers} />
      <CityMarker x={50} y={50} cityName="Constanța" onSelect={handleMarkerSelect} selectedMarkers={selectedMarkers} />
      {infoCity && <CityInfo city={infoCity} onClose={() => setInfoCity(null)} />}
    </div>
  );
}

export default Map;
