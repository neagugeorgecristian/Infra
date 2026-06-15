import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import PuzzleSVGMap from './PuzzleSVGMap';
import PuzzleHUD, { calculateStarCount } from './PuzzleHUD';
import NavigatorPanel from './NavigatorPanel';
import PuzzleIntroModal from './PuzzleIntroModal';
import { calculateLineCost } from './utils.js';
import { evaluateTypedFlow, computeDegreeMap, isAtMaxDegree, EMPTY_FLOW_RESULT } from './PuzzleFlow';
import { PUZZLE_LEVEL_ORDER } from '../scenarios/infraPuzzleLevels';

import './puzzle.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Minimum cost of any unbuilt connection — used to detect budget-fail. */
function getMinRemainingConnectionCost(cities, lines, calcCost) {
  const existing = new Set(
    lines
      .filter(l => !l.isDeleted)
      .map(l => [l.points[0].cityName, l.points[1].cityName].sort().join('||'))
  );
  let min = Infinity;
  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const key = [cities[i].cityName, cities[j].cityName].sort().join('||');
      if (!existing.has(key)) {
        const cost = calcCost(cities[i], cities[j]);
        if (cost < min) min = cost;
      }
    }
  }
  return min === Infinity ? 0 : min;
}

// ── Inline line-options menu ──────────────────────────────────────────────────

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

// ── Game-over overlay ─────────────────────────────────────────────────────────

function PuzzleGameOver({ result, stars, spent, initialBudget, connectionCount, flowResult, onReplay, onMenu, onNextLevel, hasNextLevel }) {
  if (result === 'success') {
    const starCount = calculateStarCount(stars, spent, connectionCount);
    const starStr   = '⭐'.repeat(starCount) + '☆'.repeat(3 - starCount);
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
          <button onClick={onReplay} style={{ padding: '8px 20px', borderRadius: '8px', background: '#1a6b2e', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            ↩ Play Again
          </button>
          {hasNextLevel && (
            <button onClick={onNextLevel} style={{ padding: '8px 20px', borderRadius: '8px', background: '#1a4a8a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              ▶ Next Level
            </button>
          )}
          <button onClick={onMenu} style={{ padding: '8px 20px', borderRadius: '8px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            🏠 Menu
          </button>
        </div>
      </div>
    );
  }

  // result === 'fail'
  return (
    <div className="puzzle-gameover puzzle-gameover--fail">
      <div className="puzzle-gameover__stars">💥</div>
      <div className="puzzle-gameover__title">Infrastructure failed!</div>
      <div style={{ color: '#ff9977', marginBottom: '16px', fontSize: '14px' }}>
        {flowResult.unmetNeeds} demand{flowResult.unmetNeeds !== 1 ? 's' : ''} could not be met
      </div>
      <div className="puzzle-gameover__stats">
        <div>🔌 Needs met: <strong>{flowResult.metNeeds}/{flowResult.totalNeeds}</strong></div>
        <div>📊 Efficiency: <strong>{flowResult.efficiency}%</strong></div>
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={onReplay} style={{ padding: '8px 20px', borderRadius: '8px', background: '#7a1a1a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
          ↩ Try Again
        </button>
        <button onClick={onMenu} style={{ padding: '8px 20px', borderRadius: '8px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
          🏠 Menu
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function PuzzleMap({ scenario }) {
  const navigate = useNavigate();

  const {
    cities: initialCities,
    svgMap,
    budget: initialBudget = 1000,
    stars,
    resources,
    connectionLimit = null,   // hard cap on total connections (null = no cap)
  } = scenario;

  const currentLevelIndex = PUZZLE_LEVEL_ORDER.indexOf(scenario.id);
  const nextLevelId = currentLevelIndex !== -1 && currentLevelIndex < PUZZLE_LEVEL_ORDER.length - 1
    ? PUZZLE_LEVEL_ORDER[currentLevelIndex + 1]
    : null;

  // ── State ─────────────────────────────────────────────────────────────────

  // Show intro modal on first mount; dismissed by clicking "I see"
  const [showIntro,       setShowIntro]       = useState(true);

  const [money,           setMoney]           = useState(initialBudget);
  const [lines,           setLines]           = useState([]);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [lineMenu,        setLineMenu]        = useState({ visible: false, position: { x: 0, y: 0 }, line: null });
  const [gameOver,        setGameOver]        = useState(null); // null | 'success' | 'fail'

  // evaluateTypedFlow is now async (backend call), so we can't call it
  // synchronously inside useState(). Start with an empty placeholder result
  // and let the useEffect below populate it on mount.
  const [flowResult,      setFlowResult]      = useState(EMPTY_FLOW_RESULT);

  const moneyRef = useRef(money);
  const linesRef = useRef(lines);
  useEffect(() => { moneyRef.current = money; }, [money]);
  useEffect(() => { linesRef.current = lines; }, [lines]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeLines     = useMemo(() => lines.filter(l => !l.isDeleted), [lines]);
  const connectionCount = activeLines.length;
  const spent           = initialBudget - money;

  // Live degree map: cityName → current connection count
  const degreeMap = useMemo(() => computeDegreeMap(lines), [lines]);

  // ── Flow evaluation + win/fail check ─────────────────────────────────────
  useEffect(() => {
    // Don't evaluate while the intro is showing — no interaction has happened yet
    if (showIntro) return;

    // Guards against setting state after this effect's lines have changed again
    // (i.e. a stale response arriving after a newer request was fired).
    let cancelled = false;

    (async () => {
      let result;
      try {
        result = await evaluateTypedFlow({ cities: initialCities, lines });
      } catch (err) {
        console.error('Flow evaluation failed:', err);
        return;
      }

      if (cancelled) return;

      setFlowResult(result);

      if (result.allDemandsMet && !gameOver) {
        setGameOver('success');
        return;
      }

      if (!result.allDemandsMet && !gameOver) {
        // Fail: connection limit reached
        if (connectionLimit != null && activeLines.length >= connectionLimit) {
          setGameOver('fail');
          return;
        }
        // Fail: budget exhausted and no affordable connection remains
        const minCost = getMinRemainingConnectionCost(initialCities, lines, calculateLineCost);
        if (minCost > 0 && moneyRef.current < minCost) {
          setGameOver('fail');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [lines, initialCities, gameOver, connectionLimit, activeLines.length, showIntro]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleDismissIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleMarkerClick = useCallback((city) => {
    if (gameOver) return;

    setSelectedMarkers(prev => {
      if (prev.length === 0) return [city];

      const first = prev[0];
      if (first.cityName === city.cityName) return [];

      const currentLines = linesRef.current;
      const currentMoney = moneyRef.current;

      // Already connected?
      const exists = currentLines.find(l =>
        !l.isDeleted && (
          (l.points[0].cityName === first.cityName && l.points[1].cityName === city.cityName) ||
          (l.points[0].cityName === city.cityName  && l.points[1].cityName === first.cityName)
        )
      );
      if (exists) {
        alert(`${first.cityName} and ${city.cityName} are already connected.`);
        return [];
      }

      // Connection limit?
      const activeCnt = currentLines.filter(l => !l.isDeleted).length;
      if (connectionLimit != null && activeCnt >= connectionLimit) {
        alert(`Connection limit reached (${connectionLimit} max). Delete a line to reroute.`);
        return [];
      }

      // Degree limit checks
      const currentDegree = computeDegreeMap(currentLines);
      const firstDef  = initialCities.find(c => c.cityName === first.cityName);
      const targetDef = initialCities.find(c => c.cityName === city.cityName);

      if (firstDef?.maxDegree != null && isAtMaxDegree(first.cityName, firstDef.maxDegree, currentDegree)) {
        alert(`${first.cityName} is at its connection limit (${firstDef.maxDegree} max).`);
        return [];
      }
      if (targetDef?.maxDegree != null && isAtMaxDegree(city.cityName, targetDef.maxDegree, currentDegree)) {
        alert(`${city.cityName} is at its connection limit (${targetDef.maxDegree} max).`);
        return [];
      }

      // Budget check
      const cost = calculateLineCost(first, city);
      if (currentMoney < cost) {
        alert(`Not enough budget. Need €${cost}, have €${currentMoney}.`);
        return [];
      }

      // Commit
      setMoney(m => m - cost);
      const newLine = { id: Date.now(), points: [first, city], className: 'singleline', isNew: true };
      setLines(prev2 => [...prev2, newLine]);
      setTimeout(() => {
        setLines(prev2 => prev2.map(l => l.id === newLine.id ? { ...l, isNew: false } : l));
      }, 1100);

      return [];
    });
  }, [gameOver, initialCities, connectionLimit]);

  const handleLineClick = useCallback((e, line) => {
    e.stopPropagation();
    setLineMenu({ visible: true, position: { x: e.clientX + 10, y: e.clientY + 10 }, line });
  }, []);

  const handleDeleteLine = useCallback(() => {
    const target = lineMenu.line;
    if (!target) return;
    setLines(prev => prev.map(l => l.id === target.id ? { ...l, isDeleted: true } : l));
    // 40% refund on deletion
    const refund = Math.round(calculateLineCost(target.points[0], target.points[1]) * 0.4);
    setMoney(m => m + refund);
    setLineMenu({ visible: false, position: { x: 0, y: 0 }, line: null });
  }, [lineMenu]);

  const handleMapClick = useCallback(() => {
    if (lineMenu.visible) setLineMenu({ visible: false, position: { x: 0, y: 0 }, line: null });
  }, [lineMenu]);

  const handleNextLevel = useCallback(() => {
    if (nextLevelId) navigate(`/scenario/${nextLevelId}`);
  }, [nextLevelId, navigate]);

  // ── Render ────────────────────────────────────────────────────────────────
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
        connectionLimit={connectionLimit}
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
        degreeMap={degreeMap}
        gameOver={!!gameOver}
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
          result={gameOver}
          stars={stars}
          spent={spent}
          initialBudget={initialBudget}
          connectionCount={connectionCount}
          flowResult={flowResult}
          onReplay={() => window.location.reload()}
          onMenu={() => navigate('/')}
          onNextLevel={handleNextLevel}
          hasNextLevel={!!nextLevelId}
        />
      )}

      {/* ── Intro modal — rendered last so it sits on top of everything ── */}
      {showIntro && (
        <PuzzleIntroModal
          scenario={scenario}
          onDismiss={handleDismissIntro}
        />
      )}
    </div>
  );
}

export default PuzzleMap;