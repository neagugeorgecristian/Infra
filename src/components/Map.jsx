import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SVGMap from './SVGMap';
import CityMarker from './CityMarker';
import LineOptions from './LineOptions';
import CityInfo from './CityInfo';
import InfoPanel from './InfoPanel';
import NavigatorPanel from './NavigatorPanel';
import MoneyPanel from './MoneyPanel';
import { calculateLineCost } from './utils';

import './Map.css';

function Map({ svgMap, cities, scenarioName }) {
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [lines, setLines] = useState([]);
  const [lineOptions, setLineOptions] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    line: null
  });

  const navigate = useNavigate();
  const [infoCity, setInfoCity] = useState(null);
  const [money, setMoney] = useState(1000);

  const handleBackToMenu = () => {
    navigate('/');
  };

  // ✅ UNIVERSAL MONEY WRAPPER
  const trySpendMoney = (amount, onSuccess) => {
    if (money >= amount) {
      setMoney(prev => prev - amount);
      onSuccess();
      return true;
    } else {
      alert(`Not enough money! Required: €${amount}, Available: €${money}`);
      console.log(`Not enough money! Required: €${amount}, Available: €${money}`);
      return false;
    }
  };


  const handleMarkerSelect = ({ x, y, cityName }) => {
    if (selectedMarkers.length === 1 && selectedMarkers[0].cityName !== cityName) {
      const point1 = selectedMarkers[0];
      const point2 = { x, y, cityName };

      const cost = Math.round(
        Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)) * 10
      );

      trySpendMoney(cost, () => {
        const newLine = {
          points: [point1, point2],
          className: 'singleline',
          speedMultiplier: 1
        };
        setLines(prev => [...prev, newLine]);
        setSelectedMarkers([]);
      });
    } else {
      setSelectedMarkers([{ x, y, cityName }]);
    }

    setInfoCity({ type: 'city', data: { x, y, cityName } });
  };

  const handleMapClick = (event) => {
    if (!event.target.closest('.city-marker')) {
      setSelectedMarkers([]);
    }
  };

  const handleLineClick = (event, line) => {
    const position = {
      x: event.clientX + 10,
      y: event.clientY + 10
    };
    setLineOptions({ visible: true, position, line });
  };

  const handleCloseOptions = () => {
    setLineOptions({ visible: false, position: { x: 0, y: 0 }, line: null });
  };

  const handleDeleteLine = (lineToDelete) => {
    setLines(prevLines => prevLines.map(line =>
      (line.points[0].cityName === lineToDelete.points[0].cityName &&
        line.points[1].cityName === lineToDelete.points[1].cityName &&
        line.className === lineToDelete.className)
        ? { ...line, isDeleted: true }
        : line
    ));
    handleCloseOptions();
    setInfoCity(null);
  };

  const handleAddLine = (newLine) => {
    const cost = calculateLineCost(newLine.points[0], newLine.points[1]);

    trySpendMoney(cost, () => {
      setLines(prevLines => {
        const existingIndex = prevLines.findIndex(line =>
          line.points[0].cityName === newLine.points[0].cityName &&
          line.points[1].cityName === newLine.points[1].cityName &&
          line.className === newLine.className
        );

        if (existingIndex !== -1) {
          const updated = [...prevLines];
          updated[existingIndex].isDeleted = false;
          return updated;
        } else {
          return [...prevLines, newLine];
        }
      });
    });
  };

  const handleToggleUpgradeLine = () => {
    const targetLine = lines.find(line =>
      line.points[0].cityName === lineOptions.line.points[0].cityName &&
      line.points[1].cityName === lineOptions.line.points[1].cityName &&
      !line.isDeleted
    );

    if (!targetLine) {
      console.log('No matching line found.');
      return;
    }

    const baseCost = calculateLineCost(targetLine.points[0], targetLine.points[1]);
    const upgradeCost = baseCost;

    if (targetLine.className === 'singleline') {
      // Upgrade path
      if (!trySpendMoney(upgradeCost, () => {})) {
        return; // Not enough money, exit early
      }

      setLines(prevLines =>
        prevLines.map(line =>
          line === targetLine
            ? {
                ...line,
                className: 'doubleline',
                upgraded: true,
                speedMultiplier: line.speedMultiplier * 1.33
              }
            : line
        )
      );

    } else {
      // Downgrade path → refund half the upgrade cost
      const refund = Math.round(upgradeCost / 2);
      setMoney(prev => prev + refund);

      setLines(prevLines =>
        prevLines.map(line =>
          line === targetLine
            ? {
                ...line,
                className: 'singleline',
                upgraded: false,
                speedMultiplier: 1
              }
            : line
        )
      );
    }

    setLineOptions(prev => ({
      ...prev,
      visible: false
    }));

    setInfoCity(null);
  };



  return (
    <div className="map-container" onClick={handleMapClick}>
      <NavigatorPanel onBack={handleBackToMenu} />
      <MoneyPanel money={money} />
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
          onDowngradeLine={handleToggleUpgradeLine}
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
