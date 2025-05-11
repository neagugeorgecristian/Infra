import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
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

  const GAME_DURATION = 60;
  const TARGET_MONEY = 1500;

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOverMessage, setGameOverMessage] = useState(null);
  const timerRef = useRef(null);

  const [satisfactionMap, setSatisfactionMap] = useState(() =>
    Object.fromEntries(cities.map(city => [city.cityName, 50]))
  );


  const handleBackToMenu = () => {
    navigate('/');
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (money >= TARGET_MONEY) {
            setGameOverMessage("🎉 Congratulations, you passed!");
          } else {
            setGameOverMessage("💥 Your infrastructure projects have collapsed!");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const incomeInterval = setInterval(() => {
      // Build a set of connected cities
      const connectedCities = new Set();
      lines.forEach(line => {
        if (!line.isDeleted) {
          connectedCities.add(line.points[0].cityName);
          connectedCities.add(line.points[1].cityName);
        }
      });

      let totalIncome = 0;
      const updatedSatisfaction = { ...satisfactionMap };

      for (const [city, satisfaction] of Object.entries(satisfactionMap)) {
        if (connectedCities.has(city)) {
          // Generate money only if connected
          totalIncome += Math.round(satisfaction / 5);

          // Gradually increase satisfaction up to 100
          updatedSatisfaction[city] = Math.min(100, satisfaction + 2);
        } else {
          // Unconnected cities lose satisfaction
          updatedSatisfaction[city] = Math.max(0, satisfaction - 5);
        }
      }

      setSatisfactionMap(updatedSatisfaction);
      setMoney(prev => prev + totalIncome);
    }, 5000);

    return () => clearInterval(incomeInterval);
  }, [lines, satisfactionMap]);




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
    if (gameOverMessage) return;

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
    if (gameOverMessage) return;

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
          setSatisfactionMap(prev => {
            const updated = { ...prev };
            const [cityA, cityB] = [newLine.points[0].cityName, newLine.points[1].cityName];
            updated[cityA] = Math.min(100, (updated[cityA] || 50) + 10);
            updated[cityB] = Math.min(100, (updated[cityB] || 50) + 10);
            return updated;
          });
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

    if (targetLine.className === 'singleline') {
      // Upgrade path - cost is 1.5x base

      const upgradeCost = Math.round(baseCost * 1.5);

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
      const refund = Math.round(baseCost * 0.5);
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
      
      {infoCity && (
        <InfoPanel
          info={infoCity}
          satisfactionMap={satisfactionMap}
          onClose={() => setInfoCity(null)}
        />
      )}

      <div style={{
        position: 'absolute',
        top: 10,
        right: 500,
        background: '#222',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '18px',
        zIndex: 10
      }}>
        ⏱ {timeLeft}s
      </div>

      {gameOverMessage && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'black',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          fontSize: '24px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          {gameOverMessage}
        </div>
      )}

    </div>
  );
}

export default Map;
