import React, { useState } from 'react';
import SVGMap from './SVGMap';
import CityMarker from './CityMarker';
import LineOptions from './LineOptions';
import CityInfo from './CityInfo';
import InfoPanel from './InfoPanel';
import './Map.css';

function Map({ svgMap, cities, scenarioName }) {
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [lines, setLines] = useState([]);
  const [lineOptions, setLineOptions] = useState({
    visible: false,
    position: { x: 0, y: 0},
    line: null
  });

  const [infoCity, setInfoCity] = useState(null);
  /*
  const cities = [
    { x: 78, y: 74, cityName: 'Constanța' }, // Bottom right
    { x: 50, y: 50, cityName: 'Sibiu' },      // Center
    { x: 42, y: 30, cityName: 'Clooj' },        // Top left
    { x: 42, y: 70, cityName: 'Craiova' }        // Bottom left
  ];
  */

  const handleMarkerSelect = ({ x, y, cityName }) => {
    setInfoCity({ type: 'city', data: { x, y, cityName } });
    setSelectedMarkers((prevSelected) => {
      // Prevent duplicate lines from the same city to itself
      if (prevSelected.length === 1 && prevSelected[0].cityName !== cityName) {
        const newLine = {
          points: [prevSelected[0], { x, y, cityName }],
          className: 'singleline',
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
  };


  const handleCloseOptions = () => {
    setLineOptions({ visible: false, position: { x: 0, y: 0}, line: null });
  };

  const handleDeleteLine = (lineToDelete) => {
    setLines(prevLines => prevLines.map(line =>
      (line.points[0].cityName === lineToDelete.points[0].cityName &&
       line.points[1].cityName === lineToDelete.points[1].cityName &&
       line.className === lineToDelete.className)
        ? { ...line, isDeleted: true } // <-- mark it as deleted
        : line
    ));
    handleCloseOptions();
    setInfoCity(null);
  };

  const handleAddLine = (newLine) => {
    setLines(prevLines => {
      const existingLineIndex = prevLines.findIndex(line =>
        line.points[0].cityName === newLine.points[0].cityName &&
        line.points[1].cityName === newLine.points[1].cityName &&
        line.className === newLine.className
      );

      if (existingLineIndex !== -1) {
        // Line exists, revive it
        const updatedLines = [...prevLines];
        updatedLines[existingLineIndex].isDeleted = false;
        return updatedLines;
      } else {
        // Line doesn't exist, add new
        return [...prevLines, newLine];
      }
    });
    //handleCloseOptions();
  };

/*
  const handleToggleUpgradeLine = () => {
    setLines((prevLines) =>
      prevLines.map((line) =>
        line.points[0].cityName === lineOptions.line.points[0].cityName &&
        line.points[1].cityName === lineOptions.line.points[1].cityName &&
        !line.isDeleted
          ? {
              ...line,
              className: line.className === 'singleline' ? 'doubleline' : 'singleline',
              upgraded: line.className === 'singleline', // track upgraded status
              speedMultiplier: line.className === 'singleline' ? line.speedMultiplier * 1.33 : 1
            }
          : line
      )
    );
    
    // Update line options state after toggle to ensure correct menu display
    setLineOptions((prevState) => ({
      ...prevState,
      line: prevState.line ? { ...prevState.line, className: prevState.line.className === 'singleline' ? 'doubleline' : 'singleline' } : prevState.line
    }));

    handleCloseOptions(); // Close the menu
    setInfoCity(null); // Reset info city
  };
*/

  const handleToggleUpgradeLine = () => {
    // Step 1: Update the line immediately
    setLines((prevLines) => {
      return prevLines.map((line) => {
        if (line.points[0].cityName === lineOptions.line.points[0].cityName &&
            line.points[1].cityName === lineOptions.line.points[1].cityName &&
            !line.isDeleted) {
          return {
            ...line,
            className: line.className === 'singleline' ? 'doubleline' : 'singleline',
            upgraded: line.className === 'singleline', // Toggling the upgrade flag
            speedMultiplier: line.className === 'singleline' ? line.speedMultiplier * 1.33 : 1
          };
        }
        return line;
      });
    });

    // Step 2: Close the menu after the state has been updated
    setLineOptions((prevState) => ({
      ...prevState,
      visible: false
    }));

    setInfoCity(null); // Clear the city info
  };

  return (
    <div className="map-container" onClick={handleMapClick}>
      <SVGMap 
        lines={lines} 
        onLineClick={handleLineClick}
        cities={cities}
        svgFile={svgMap}
        onMarkerClick={handleMarkerSelect}
        selectedMarkers={selectedMarkers}
      />
      {lineOptions.visible && 
        <LineOptions 
          position={lineOptions.position} 
          onClose={handleCloseOptions}
          onDeleteLine={() => handleDeleteLine(lineOptions.line)}
          onUpgradeLine={handleToggleUpgradeLine}
          onDowngradeLine={handleToggleUpgradeLine} // if you reuse the same
          onShowInfo={() => {
            setInfoCity({ type: 'line', data: lineOptions.line });
            handleCloseOptions();
          }}
          line={lineOptions.line}
        />
      }
      {infoCity && <InfoPanel info={infoCity} onClose={() => setInfoCity(null)} />}
    </div>
  );
}

export default Map;
