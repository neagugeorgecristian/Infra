import React, { useRef, useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import { buildPathD, buildAnimationKeys } from './pathRegistry.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────

const RESOURCE_COLOR = {
  water:  '#4ab0ff',
  energy: '#ffdd44',
};

const RESOURCE_ICON = {
  water:  '💧',
  energy: '⚡',
  goods: '📦',
};

// ── Shape helpers ─────────────────────────────────────────────────────────────

/**
 * Returns SVG polygon `points` string for a regular n-sided polygon.
 * cx/cy are in viewBox coordinates.  r is the circumradius.
 * rotOffset shifts the first vertex (radians); default puts a flat edge on top.
 */
function polygonPoints(cx, cy, r, sides, rotOffset = 0) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i / sides) - Math.PI / 2 + rotOffset;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

/** Total units a city produces (sum over all resource types). */
function getTotalSupply(city) {
  return Object.values(city.supplyPerTick ?? {}).reduce((a, b) => a + b, 0);
}

/**
 * Maps a supply count → number of polygon sides.
 * 0-2 → circle (return 0 as sentinel), 3 → triangle, 4 → square, etc.
 */
function supplySides(supply) {
  if (supply <= 2) return 0;  // 0 = circle
  return Math.min(supply, 8); // cap at octagon
}

/**
 * Renders the main body of a city as the appropriate shape.
 *
 * Producer / active-hybrid  → shape based on supplyPerTick (circle=2, tri=3…)
 * Inactive hybrid            → octagon with dashed stroke (waiting state)
 * Consumer                   → diamond (rotated square, 4 sides + 45° offset)
 */
function CityShape({ city, cx, cy, r, fillColor, strokeColor, strokeWidth, isHybrid, isActivated }) {
  const isProducer = city.role === 'producer';
  const isConsumer = city.role === 'consumer';

  // ── Consumer: diamond ────────────────────────────────────────────────────
  if (isConsumer) {
    return (
      <polygon
        points={polygonPoints(cx, cy, r * 1.15, 4, Math.PI / 4)}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  // ── Inactive hybrid: dashed octagon ─────────────────────────────────────
  if (isHybrid && !isActivated) {
    return (
      <polygon
        points={polygonPoints(cx, cy, r, 8)}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray="3 2"
      />
    );
  }

  // ── Producer / active hybrid: supply-based shape ─────────────────────────
  const supply = getTotalSupply(city);
  const sides  = supplySides(supply);

  if (sides === 0) {
    // Circle (supply ≤ 2)
    return (
      <circle
        cx={cx} cy={cy} r={r}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <polygon
      points={polygonPoints(cx, cy, r, sides)}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
}

// ── Line resource computation (BFS from each producer) ────────────────────────

function computeLineResources(cities, lines) {
  const activeLines = lines.filter(l => !l.isDeleted);
  const adj = new Map();

  activeLines.forEach(l => {
    const a = l.points[0].cityName;
    const b = l.points[1].cityName;

    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);

    adj.get(a).push({ neighbor: b, lineId: l.id });
    adj.get(b).push({ neighbor: a, lineId: l.id });
  });

  const lineResources = {};

  cities.forEach(city => {
    if (!city.produces?.length) return;

    city.produces.forEach(resource => {
      const visited = new Set([city.cityName]);
      const queue   = [city.cityName];

      while (queue.length) {
        const cur = queue.shift();

        (adj.get(cur) || []).forEach(({ neighbor, lineId }) => {
          if (!lineResources[lineId]) lineResources[lineId] = new Set();

          lineResources[lineId].add(resource);

          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
    });
  });

  return lineResources;
}

// ── Component ──────────────────────────────────────────────────────────────────

function PuzzleSVGMap({
  lines,
  cities,
  svgFile,
  selectedMarkers,
  onMarkerClick,
  onLineClick,
  flowResult,
  calculateLineCost,
  degreeMap,
  gameOver,
}) {
  const containerRef  = useRef(null);
  const overlayRef    = useRef(null);

  const [viewBox, setViewBox]   = useState('0 0 1200 800');
  const [mousePos, setMousePos] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);

  const MAX_W = 1200;
  const MAX_H = 1000;

  // Derive viewBox dimensions for coordinate maths
  const [, , vbW, vbH] = viewBox.split(' ').map(Number);

  const handleAfterInjection = (svg) => {
    const vb = svg?.getAttribute('viewBox');
    if (vb) setViewBox(vb);
  };

  // Container sizing (preserve aspect ratio)
  const aspect = vbW / vbH;
  const cW     = aspect > MAX_W / MAX_H ? MAX_W : MAX_H * aspect;
  const cH     = aspect > MAX_W / MAX_H ? MAX_W / aspect : MAX_H;

  // pct → viewBox-space px
  const pct2vb = (xPct, yPct) => ({
    x: (xPct / 100) * vbW,
    y: (yPct / 100) * vbH,
  });

  const SHAPE_RADIUS = 9;
  const HIT_RADIUS = 26;

  const getHoveredCityFromPoint = (point) => {
    if (selectedMarkers.length !== 1) return null;

    return cities.find(city => {
      if (selectedMarkers[0].cityName === city.cityName) return false;

      const cityPoint = pct2vb(city.x, city.y);
      return Math.hypot(point.x - cityPoint.x, point.y - cityPoint.y) <= HIT_RADIUS;
    })?.cityName ?? null;
  };

  // Ghost line tracking
  useEffect(() => {
    if (selectedMarkers.length === 0) setMousePos(null);
  }, [selectedMarkers]);

  const handleMouseMove = (e) => {
    if (selectedMarkers.length !== 1) {
      setHoveredCity(null);
      return;
    }

    const svg = overlayRef.current;
    if (!svg) return;

    try {
      const pt  = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;

      const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      const point = { x: sp.x, y: sp.y };

      setMousePos(point);
      setHoveredCity(getHoveredCityFromPoint(point));
    } catch (_) {
      // getScreenCTM() can fail on unmounted elements – safely ignore
    }
  };

  const ghostStart = selectedMarkers.length === 1 && mousePos
    ? pct2vb(selectedMarkers[0].x, selectedMarkers[0].y)
    : null;

  // Derived flow data
  const servedSet = new Set(
    (flowResult?.consumerStatus || []).filter(s => s.allMet).map(s => s.cityName)
  );
  const activatedHybrids = flowResult?.activatedHybrids ?? new Set();
  const lineResourceMap  = computeLineResources(cities, lines);

  return (
    <div
      ref={containerRef}
      style={{ width: cW, height: cH, position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setMousePos(null);
        setHoveredCity(null);
      }}
    >
      {/* Background SVG */}
      <ReactSVG src={svgFile} afterInjection={handleAfterInjection} />

      {/* Overlay */}
      <svg
        ref={overlayRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Connection lines ──────────────────────────────────────── */}
        {lines.map((line, idx) => {
          if (line.isDeleted) return null;

          const from   = line.points[0];
          const to     = line.points[1];
          const fromPx = pct2vb(from.x, from.y);
          const toPx   = pct2vb(to.x, to.y);
          const wpts   = [fromPx, toPx];
          const pathD  = buildPathD(wpts);
          const lineId = line.id ?? idx;
          const pathId = `pp-${lineId}`;
          const pathLen = Math.hypot(toPx.x - fromPx.x, toPx.y - fromPx.y);

          const resources    = lineResourceMap[lineId];
          const resourceList = resources ? [...resources] : [];
          const lineColor    = resourceList.length === 1
            ? RESOURCE_COLOR[resourceList[0]] ?? '#aaaaaa'
            : resourceList.length > 1 ? '#cccccc' : '#666666';

          const { keyTimes, keyPoints, keySplines, totalDuration } =
            buildAnimationKeys(wpts, [1]);

          return (
            <React.Fragment key={lineId}>
              <path id={pathId} d={pathD} fill="none" stroke="none" />

              <path
                d={pathD}
                fill="none"
                stroke={lineColor}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={line.isNew ? pathLen : undefined}
                strokeDashoffset={line.isNew ? pathLen : undefined}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={e => onLineClick(e, line)}
              >
                {line.isNew && (
                  <animate attributeName="stroke-dashoffset" from={pathLen} to={0} dur="0.9s" fill="freeze" />
                )}
              </path>

              {!gameOver && !line.isNew && resourceList.length > 0 && (
                <circle r="4" fill={lineColor} stroke="white" strokeWidth="0.8">
                  <animateMotion
                    dur={`${totalDuration}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes={keyTimes}
                    keyPoints={keyPoints}
                    keySplines={keySplines}
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              )}
            </React.Fragment>
          );
        })}

        {/* ── Ghost dotted line ─────────────────────────────────────── */}
        {ghostStart && mousePos && (
          <line
            x1={ghostStart.x}
            y1={ghostStart.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            strokeDasharray="8 5"
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}

        {/* ── City markers ──────────────────────────────────────────── */}
        {cities.map((city, i) => {
          const isSelected  = selectedMarkers.some(m => m.cityName === city.cityName);
          const isProducer  = city.role === 'producer';
          const isHybrid    = city.role === 'hybrid';
          const isConsumer  = city.role === 'consumer';
          const isActivated = activatedHybrids.has(city.cityName);
          const isServed    = servedSet.has(city.cityName);

          const primaryResource = (city.produces ?? [])[0] ?? (city.needs ?? [])[0];
          const resourceColor   = RESOURCE_COLOR[primaryResource] ?? '#aaaaaa';

          // ── Colours ────────────────────────────────────────────────
          const fillColor = isConsumer
            ? (isServed ? '#44cc88' : '#ff6633')
            : isHybrid && !isActivated
              ? '#888888'
              : resourceColor;

          const strokeColor = isSelected
            ? 'white'
            : isConsumer
              ? (isServed ? '#115522' : '#882200')
              : isHybrid && !isActivated
                ? '#555555'
                : '#1a4480';

          // ── ViewBox-space coordinates ──────────────────────────────
          const { x: cvbX, y: cvbY } = pct2vb(city.x, city.y);

          // ── Supply label & role label ──────────────────────────────
          const totalSupply = getTotalSupply(city);
          const supplyLabel = (isProducer || (isHybrid && isActivated)) && totalSupply > 0
            ? `×${totalSupply}`
            : null;

          const roleLabel = isProducer
            ? `▲ ${(city.produces ?? []).map(r => RESOURCE_ICON[r] ?? r).join(' ')}`
            : isHybrid
              ? `↕ ${([...(city.produces ?? []), ...(city.needs ?? [])]).map(r => RESOURCE_ICON[r] ?? r).join(' ')}`
              : `▼ ${(city.needs ?? []).map(r => RESOURCE_ICON[r] ?? r).join(' ')}`;

          // ── Degree / cost preview ──────────────────────────────────
          const cityDef   = city;
          const curDegree = degreeMap?.get(city.cityName) ?? 0;
          const atDegCap  = cityDef?.maxDegree != null && curDegree >= cityDef.maxDegree;

          const showPrice = selectedMarkers.length === 1
            && hoveredCity === city.cityName
            && !isSelected
            && calculateLineCost != null;

          const previewCost = showPrice
            ? calculateLineCost(selectedMarkers[0], city)
            : null;

          const tooltipX = cvbX;
          const tooltipY = cvbY - 44;

          return (
            <g
              key={i}
              style={{ cursor: atDegCap ? 'not-allowed' : 'pointer', pointerEvents: 'auto', opacity: atDegCap ? 0.55 : 1 }}
              onClick={() => onMarkerClick(city)}
            >
              {/* Broad invisible hit target so hover/click works across the whole town area. */}
              <circle
                cx={cvbX}
                cy={cvbY}
                r={HIT_RADIUS}
                fill="#fff"
                opacity="0.001"
                pointerEvents="auto"
              />

              {/* Pulse ring — producers only */}
              {isProducer && (
                <circle
                  cx={cvbX}
                  cy={cvbY}
                  r="12"
                  fill="none"
                  stroke={resourceColor}
                  strokeWidth="1.5"
                  opacity="0.35"
                >
                  <animate attributeName="r" values="10;22;10" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Activation glow — hybrid just became active */}
              {isHybrid && isActivated && (
                <circle
                  cx={cvbX}
                  cy={cvbY}
                  r="14"
                  fill="none"
                  stroke={resourceColor}
                  strokeWidth="1.5"
                  opacity="0.4"
                >
                  <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0;0.45" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Served ring — consumers */}
              {isConsumer && isServed && (
                <circle
                  cx={cvbX}
                  cy={cvbY}
                  r="15"
                  fill="none"
                  stroke="#44cc88"
                  strokeWidth="1.5"
                  opacity="0.55"
                />
              )}

              {/* Selection dashed ring */}
              {isSelected && (
                <circle
                  cx={cvbX}
                  cy={cvbY}
                  r="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  opacity="0.85"
                />
              )}

              {/* ── Main city shape ─────────────────────────────────── */}
              <CityShape
                city={city}
                cx={cvbX}
                cy={cvbY}
                r={SHAPE_RADIUS}
                fillColor={fillColor}
                strokeColor={strokeColor}
                strokeWidth={2}
                isHybrid={isHybrid}
                isActivated={isActivated}
              />

              {/* Supply count badge (top-right of shape) */}
              {supplyLabel && (
                <text
                  x={cvbX + 11}
                  y={cvbY - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={resourceColor}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {supplyLabel}
                </text>
              )}

              {/* City name */}
              <text
                x={cvbX}
                y={cvbY - 13}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="white"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {city.cityName}
              </text>

              {/* Role / resource label */}
              <text
                x={cvbX}
                y={cvbY + 22}
                textAnchor="middle"
                fontSize="9"
                fill={
                  (isProducer || (isHybrid && isActivated))
                    ? resourceColor
                    : isServed ? '#aaffcc' : '#ffbbaa'
                }
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {roleLabel}
              </text>

              {/* Degree indicator: current / max connections */}
              {city.maxDegree != null && (
                <text
                  x={cvbX - 11}
                  y={cvbY - 8}
                  textAnchor="middle"
                  fontSize="8"
                  fill={atDegCap ? '#ff6655' : '#aaaaaa'}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {curDegree}/{city.maxDegree}
                </text>
              )}

              {/* €-cost tooltip on hover */}
              {showPrice && previewCost != null && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={tooltipX - 30}
                    y={tooltipY}
                    width="60"
                    height="22"
                    rx="6"
                    fill="#111"
                    fillOpacity="0.9"
                    stroke="#ffdd44"
                    strokeWidth="1.2"
                  />
                  <text
                    x={tooltipX}
                    y={tooltipY + 16}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#ffdd44"
                    style={{ userSelect: 'none' }}
                  >
                    €{previewCost}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default PuzzleSVGMap;