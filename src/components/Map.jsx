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
  const [deletedLines, setDeletedLines] = useState([]); // Track deleted lines

  const [infoCity, setInfoCity] = useState(null);
  const cities = [
    { x: 78, y: 74, cityName: 'Constanța' }, // Bottom right
    { x: 50, y: 50, cityName: 'Sibiu' },      // Center
    { x: 42, y: 30, cityName: 'Clooj' },        // Top left
    { x: 42, y: 70, cityName: 'Craiova' }        // Bottom left
  ];

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
    if (lineOptions.line) {
      // Remove the line immediately from the `lines` array
      setLines((prevLines) => prevLines.filter((line) => line !== lineOptions.line));
      // Optionally track deleted lines (this is useful if you need to access the history of deleted lines)
      setDeletedLines((prevDeleted) => [...prevDeleted, lineOptions.line]);
      // Reset the line options visibility to close the menu immediately after deletion
      handleCloseOptions();
    }
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
      <SVGMap 
        lines={lines} 
        onLineClick={handleLineClick}
        cities={cities}
        onMarkerClick={handleMarkerSelect}
        selectedMarkers={selectedMarkers}
        deletedLines={deletedLines}
      />
      {lineOptions.visible && 
        <LineOptions 
          position={lineOptions.position} 
          onClose={handleCloseOptions}
          onDeleteLine={handleDeleteLine}
          onUpgradeLine={handleUpgradeLine}
          onShowInfo={() => setInfoCity(lineOptions.line?.points[0])}
        />
      }
      {infoCity && <CityInfo city={infoCity} onClose={() => setInfoCity(null)} />}
    </div>
  );
}

export default Map;
