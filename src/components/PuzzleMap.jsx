import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import PuzzleSVGMap from './PuzzleSVGMap';
import PuzzleHUD, { calculateStarCount } from './PuzzleHUD';
import NavigatorPanel from './NavigatorPanel';
import { calculateLineCost } from './utils.js';
import { evaluateTypedFlow } from './PuzzleFlow';

import './puzzle.css';

// ── Small inline line-options menu ───────────────────────────────────────────

function PuzzleLineOptions({ position, line, onDelete, onClose }) {
  if (!line) return null;
  return (
    <div
      className="puzzle-line-options"
      style={{ left: position.x, top: position.y }}
    >
      <button className="danger" onClick={onDelete}>🗑 Delete connection</button>
      <button onClick={onClose}>✕ Close</button>
    </div>
  );
}

// ── Game-over overlay ────────────────────────────────────────────────────────

function PuzzleGameOver({ stars, spent, initialBudget, connectionCount, flowResult, onReplay, onMenu }) {
  const starCount  = calculateStarCount(stars, spent, connectionCount);
  const starStr    = '⭐'.repeat(starCount) + '☆'.repeat(3 - starCount);

  return (
    <div className="puzzle-gameover">
      <div className="puzzle-gameover__stars">{starStr}</div>
      <div className="puzzle-gameover__title">All resources delivered!</div>
      <div className="puzzle-gameover__stats">
        <div>💰 Spent: <strong>€{spent}</strong> of €{initialBudget}</div>
        <div>🔗 Connections used: <strong>{connectionCount}</strong></div>
        <div>🔌 Needs met: <strong>{flowResult.metNeeds}/{flowResult.totalNeeds}</strong></div>
        <div>📊 Efficiency: <strong>{flowResult.efficiency}%</strong></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={onReplay}
          style={{ padding: '8px 20px', borderRadius: '8px', background: '#1a6b2e', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
          ↩ Play Again
        </button>
        <button onClick={onMenu}
          style={{ padding: '8px 20px', borderRadius: '8px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
          🏠 Menu
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

function PuzzleMap({ scenario }) {
  const navigate = useNavigate();

  const {
    cities: initialCities,
    svgMap,
    budget: initialBudget = 1000,
    stars,
    resources,
  } = scenario;

  // ── State ──────────────────────────────────────────────────────────────────
  const [money,           setMoney]           = useState(initialBudget);
  const [lines,           setLines]           = useState([]);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [lineMenu,        setLineMenu]        = useState({ visible: false, position: { x: 0, y: 0 }, line: null });
  const [gameOver,        setGameOver]        = useState(false);
  const [flowResult,      setFlowResult]      = useState(() =>
    evaluateTypedFlow({ cities: initialCities, lines: [] })
  );

  // Refs so callbacks always see fresh values without re-creating them
  const moneyRef = useRef(money);
  const linesRef = useRef(lines);
  useEffect(() => { moneyRef.current = money; }, [money]);
  useEffect(() => { linesRef.current = lines; }, [lines]);

  // ── Re-evaluate flow whenever lines change ─────────────────────────────────
  useEffect(() => {
    const result = evaluateTypedFlow({ cities: initialCities, lines });
    setFlowResult(result);
    if (result.allDemandsMet && !gameOver) {
      setGameOver(true);
    }
  }, [lines, initialCities, gameOver]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const spent           = initialBudget - money;
  const activeLines     = lines.filter(l => !l.isDeleted);
  const connectionCount = activeLines.length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Called when the user clicks a city marker */
  const handleMarkerClick = useCallback((city) => {
    if (gameOver) return;

    setSelectedMarkers(prev => {
      // No city selected yet → select this one
      if (prev.length === 0) return [city];

      const first = prev[0];

      // Clicked same city → deselect
      if (first.cityName === city.cityName) return [];

      // Attempt to create a connection between first and city
      const existingLine = linesRef.current.find(l =>
        !l.isDeleted && (
          (l.points[0].cityName === first.cityName && l.points[1].cityName === city.cityName) ||
          (l.points[0].cityName === city.cityName  && l.points[1].cityName === first.cityName)
        )
      );

      if (existingLine) {
        alert(`${first.cityName} and ${city.cityName} are already connected.`);
        return [];
      }

      const cost = calculateLineCost(first, city);
      if (moneyRef.current < cost) {
        alert(`Not enough budget. Need €${cost}, have €${moneyRef.current}.`);
        return [];
      }

      // Commit the connection
      setMoney(m => m - cost);
      const newLine = {
        id: Date.now(),
        points: [first, city],
        className: 'singleline',
        isNew: true,
      };
      setLines(prev2 => [...prev2, newLine]);
      setTimeout(() => {
        setLines(prev2 => prev2.map(l => l.id === newLine.id ? { ...l, isNew: false } : l));
      }, 1100);

      return [];  // deselect after connecting
    });
  }, [gameOver]);

  /** Clicking a drawn line opens the small options menu */
  const handleLineClick = useCallback((e, line) => {
    e.stopPropagation();
    setLineMenu({ visible: true, position: { x: e.clientX + 10, y: e.clientY + 10 }, line });
  }, []);

  const handleDeleteLine = useCallback(() => {
    const target = lineMenu.line;
    if (!target) return;
    setLines(prev => prev.map(l => l.id === target.id ? { ...l, isDeleted: true } : l));
    // Refund half the cost when a line is deleted
    const refund = Math.round(calculateLineCost(target.points[0], target.points[1]) * 0.5);
    setMoney(m => m + refund);
    setLineMenu({ visible: false, position: { x: 0, y: 0 }, line: null });
  }, [lineMenu]);

  /** Click on blank map area → close menus and deselect */
  const handleMapClick = useCallback((e) => {
    if (lineMenu.visible) {
      setLineMenu({ visible: false, position: { x: 0, y: 0 }, line: null });
    }
  }, [lineMenu]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="puzzle-container" onClick={handleMapClick}>
      <NavigatorPanel onBack={() => navigate('/')} />

      <PuzzleHUD
        budget={initialBudget}
        remaining={money}
        spent={spent}
        flowResult={flowResult}
        stars={stars}
        connectionCount={connectionCount}
        resources={resources}
      />

      <PuzzleSVGMap
        lines={lines}
        cities={initialCities}
        svgFile={svgMap}
        selectedMarkers={selectedMarkers}
        onMarkerClick={handleMarkerClick}
        onLineClick={handleLineClick}
        flowResult={flowResult}
        calculateLineCost={calculateLineCost}
        gameOver={gameOver}
      />

      {lineMenu.visible && lineMenu.line && (
        <PuzzleLineOptions
          position={lineMenu.position}
          line={lineMenu.line}
          onDelete={handleDeleteLine}
          onClose={() => setLineMenu({ visible: false, position: { x: 0, y: 0 }, line: null })}
        />
      )}

      {gameOver && (
        <PuzzleGameOver
          stars={stars}
          spent={spent}
          initialBudget={initialBudget}
          connectionCount={connectionCount}
          flowResult={flowResult}
          onReplay={() => window.location.reload()}
          onMenu={() => navigate('/')}
        />
      )}
    </div>
  );
}

export default PuzzleMap;
