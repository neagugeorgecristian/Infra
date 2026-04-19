import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import SVGMap from './SVGMap';
import LineOptions from './LineOptions';
import InfoPanel from './InfoPanel';
import NavigatorPanel from './NavigatorPanel';
import MoneyPanel from './MoneyPanel';
import LegendPanel from './LegendPanel';
import { calculateLineCost } from './utils.js';
import { useEventSystem, EventBanner } from './EventSystem';
import { SPAWNABLE_CITIES } from './CitySpawner';
import ObjectivePanel from './ObjectivePanel';

import './Map.css';

function Map({ svgMap, cities, scenarioName }) {
  const [selectedMarkers, setSelectedMarkers] = useState([]);

  const [lines, setLines] = useState(() => {
    if (cities.length < 2) return [];
    return [{
      points: [cities[0], cities[1]],
      className: 'singleline',
      speedMultiplier: 0.5
    }];
  });

  const [lineOptions, setLineOptions] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    line: null
  });

  const navigate = useNavigate();
  const [infoCity, setInfoCity] = useState(null);
  const [money, setMoney] = useState(1000);

  const GAME_DURATION = 360;
  const TARGET_MONEY = 2500;

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOverMessage, setGameOverMessage] = useState(null);

  const [satisfactionMap, setSatisfactionMap] = useState(() =>
    Object.fromEntries(cities.map(city => [city.cityName, 50]))
  );

  const [activeCities, setActiveCities] = useState(cities);
  const [newCityFlash, setNewCityFlash] = useState(null);
  const [passengersDelivered, setPassengersDelivered] = useState(0);

  const timerRef = useRef(null);
  const moneyRef = useRef(money);
  const satisfactionRef = useRef(satisfactionMap);
  const linesRef = useRef(lines);
  const passengersRef = useRef(0);

  useEffect(() => { moneyRef.current = money; }, [money]);
  useEffect(() => { satisfactionRef.current = satisfactionMap; }, [satisfactionMap]);
  useEffect(() => { linesRef.current = lines; }, [lines]);
  useEffect(() => { passengersRef.current = passengersDelivered; }, [passengersDelivered]);

  const gamePhase = timeLeft > 300 ? 0
    : timeLeft > 240 ? 1
    : timeLeft > 180 ? 2
    : timeLeft > 120 ? 3
    : timeLeft > 60  ? 4
    : 5;

  const { activeEvent } = useEventSystem({
    gamePhase,
    lines,
    setLines,
    setMoney,
    active: !gameOverMessage
  });

  // City spawning
  useEffect(() => {
    const spawnList = SPAWNABLE_CITIES[scenarioName?.toLowerCase()] || [];
    const toSpawn = spawnList.find(s => s.appearAtTimeLeft === timeLeft);
    if (!toSpawn) return;

    const newCity = toSpawn.city;
    setActiveCities(prev => [...prev, newCity]);
    setSatisfactionMap(prev => ({ ...prev, [newCity.cityName]: 50 }));
    setNewCityFlash(newCity.cityName);
    setTimeout(() => setNewCityFlash(null), 3000);
  }, [timeLeft]);

  const handleBackToMenu = () => navigate('/');

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          const avgSatisfaction =
            Object.values(satisfactionRef.current).reduce((a, b) => a + b, 0) / cities.length;

          if (moneyRef.current >= TARGET_MONEY && avgSatisfaction >= 50) {
            setGameOverMessage("🎉 Congratulations! Your cities are thriving.");
          } else if (moneyRef.current < TARGET_MONEY) {
            setGameOverMessage("💸 Not enough funding — infrastructure collapsed.");
          } else {
            setGameOverMessage("😞 Cities too unhappy — you were voted out.");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Income + satisfaction + passengers
  useEffect(() => {
    const incomeInterval = setInterval(() => {
      const currentLines = linesRef.current;
      const currentSatisfaction = satisfactionRef.current;

      const connectedCities = new Set();
      currentLines.forEach(line => {
        if (!line.isDeleted) {
          connectedCities.add(line.points[0].cityName);
          connectedCities.add(line.points[1].cityName);
        }
      });

      let totalIncome = 0;
      const updatedSatisfaction = { ...currentSatisfaction };

      for (const [city, satisfaction] of Object.entries(currentSatisfaction)) {
        const isConnected = connectedCities.has(city);

        const connectionCount = currentLines.filter(l =>
          !l.isDeleted && (
            l.points[0].cityName === city || l.points[1].cityName === city
          )
        ).length;

        if (isConnected) {
          const growthRate = Math.min(connectionCount * 2, 8);
          updatedSatisfaction[city] = Math.min(100, satisfaction + growthRate);

          const hasUpgrade = currentLines.some(l =>
            !l.isDeleted &&
            l.className === 'doubleline' &&
            (l.points[0].cityName === city || l.points[1].cityName === city)
          );
          if (hasUpgrade) {
            updatedSatisfaction[city] = Math.min(100, updatedSatisfaction[city] + 3);
          }
        } else {
          const decayRate = satisfaction > 50 ? 8 : 4;
          updatedSatisfaction[city] = Math.max(0, satisfaction - decayRate);
        }
      }

      for (const [, sat] of Object.entries(updatedSatisfaction)) {
        if (sat === 0) totalIncome -= 20;
      }

      const getIncome = (s) => {
        if (s >= 80) return 20;
        if (s >= 60) return 10;
        if (s >= 40) return 6;
        if (s >= 20) return 2;
        return 0;
      };

      for (const [city, satisfaction] of Object.entries(currentSatisfaction)) {
        if (connectedCities.has(city)) {
          totalIncome += getIncome(satisfaction);
        }
      }

      // Upkeep per active line
      const upkeepCost = currentLines.filter(l => !l.isDeleted).length * 3;
      totalIncome -= upkeepCost;

      // Passengers delivered this tick
      const newPassengers = Object.entries(currentSatisfaction)
        .filter(([city]) => connectedCities.has(city))
        .reduce((sum, [, sat]) => sum + Math.floor(sat / 20), 0);
      setPassengersDelivered(prev => prev + newPassengers);

      setSatisfactionMap(updatedSatisfaction);
      setMoney(prev => prev + totalIncome);
    }, 5000);

    return () => clearInterval(incomeInterval);
  }, []);

  const trySpendMoney = (amount, onSuccess) => {
    if (moneyRef.current >= amount) {
      setMoney(prev => prev - amount);
      onSuccess();
      return true;
    }
    alert(`Not enough money! Required: €${amount}, Available: €${moneyRef.current}`);
    return false;
  };

  const handleMarkerSelect = ({ x, y, cityName }) => {
    if (gameOverMessage) return;

    if (selectedMarkers.length === 1 && selectedMarkers[0].cityName !== cityName) {
      const point1 = selectedMarkers[0];
      const point2 = { x, y, cityName };

      const connectionExists = linesRef.current.some(line =>
        !line.isDeleted && (
          (line.points[0].cityName === point1.cityName && line.points[1].cityName === point2.cityName) ||
          (line.points[0].cityName === point2.cityName && line.points[1].cityName === point1.cityName)
        )
      );

      if (connectionExists) {
        alert(`A connection between ${point1.cityName} and ${point2.cityName} already exists.`);
        setSelectedMarkers([]);
        return;
      }

      const cost = calculateLineCost(point1, point2);
      trySpendMoney(cost, () => {
        setLines(prev => [...prev, { points: [point1, point2], className: 'singleline', speedMultiplier: 1 }]);
        setSelectedMarkers([]);
      });
    } else {
      setSelectedMarkers([{ x, y, cityName }]);
    }

    setInfoCity({ type: 'city', data: { x, y, cityName } });
  };

  const handleMapClick = (event) => {
    if (!event.target.closest('.city-marker')) setSelectedMarkers([]);
  };

  const handleLineClick = (event, line) => {
    setLineOptions({ visible: true, position: { x: event.clientX + 10, y: event.clientY + 10 }, line });
  };

  const handleCloseOptions = () => {
    setLineOptions({ visible: false, position: { x: 0, y: 0 }, line: null });
  };

  const handleDeleteLine = (lineToDelete) => {
    setLines(prev => prev.map(line =>
      line.points[0].cityName === lineToDelete.points[0].cityName &&
      line.points[1].cityName === lineToDelete.points[1].cityName &&
      line.className === lineToDelete.className
        ? { ...line, isDeleted: true }
        : line
    ));
    handleCloseOptions();
    setInfoCity(null);
  };

  const handleToggleUpgradeLine = () => {
    const target = linesRef.current.find(line =>
      line.points[0].cityName === lineOptions.line.points[0].cityName &&
      line.points[1].cityName === lineOptions.line.points[1].cityName &&
      !line.isDeleted
    );
    if (!target) return;

    const baseCost = calculateLineCost(target.points[0], target.points[1]);

    if (target.className === 'singleline') {
      if (!trySpendMoney(Math.round(baseCost * 1.5), () => {})) return;
      setLines(prev => prev.map(line =>
        line === target
          ? { ...line, className: 'doubleline', upgraded: true, speedMultiplier: line.speedMultiplier * 1.33 }
          : line
      ));
    } else {
      setMoney(prev => prev + Math.round(baseCost * 0.5));
      setLines(prev => prev.map(line =>
        line === target
          ? { ...line, className: 'singleline', upgraded: false, speedMultiplier: 1 }
          : line
      ));
    }

    handleCloseOptions();
    setInfoCity(null);
  };

  return (
    <div className="map-container" onClick={handleMapClick}>
      <NavigatorPanel onBack={handleBackToMenu} />
      <MoneyPanel money={money} />
      <LegendPanel />
      <EventBanner event={activeEvent} />
      <SVGMap
        lines={lines}
        onLineClick={handleLineClick}
        cities={activeCities}
        svgFile={svgMap}
        onMarkerClick={handleMarkerSelect}
        selectedMarkers={selectedMarkers}
        satisfactionMap={satisfactionMap}
        newCityFlash={newCityFlash}
      />

      {lineOptions.visible && (
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
      )}

      {infoCity && (
        <InfoPanel
          info={infoCity}
          satisfactionMap={satisfactionMap}
          onClose={() => setInfoCity(null)}
        />
      )}

      <div style={{
        position: 'absolute', top: 10, right: 500,
        background: '#222', color: 'white',
        padding: '10px 15px', borderRadius: '8px',
        fontSize: '18px', zIndex: 10
      }}>
        ⏱ {timeLeft}s
      </div>

      {gameOverMessage && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#111', color: 'white',
          padding: '40px', borderRadius: '16px',
          fontSize: '18px', textAlign: 'center',
          zIndex: 1000, minWidth: '320px',
          border: '2px solid #444'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '16px' }}>{gameOverMessage}</div>
          <div style={{ marginBottom: '8px' }}>🧳 Passengers delivered: <strong>{passengersDelivered}</strong></div>
          <div style={{ marginBottom: '8px' }}>
            😊 Avg satisfaction: <strong>
              {Math.round(Object.values(satisfactionMap).reduce((a, b) => a + b, 0) / cities.length)}%
            </strong>
          </div>
          <div style={{ marginBottom: '8px' }}>💰 Final balance: <strong>€{money}</strong></div>
          <div style={{ marginBottom: '24px', fontSize: '22px' }}>
            {passengersDelivered >= 100 && money >= TARGET_MONEY ? '🥇 Gold'
              : passengersDelivered >= 60 || money >= TARGET_MONEY ? '🥈 Silver'
              : '🥉 Bronze'}
          </div>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}

      {!gameOverMessage && <ObjectivePanel gamePhase={gamePhase} />}
    </div>
  );
}

export default Map;