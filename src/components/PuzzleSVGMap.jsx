import React, { useRef, useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import { buildPathD, buildAnimationKeys } from './pathRegistry.jsx';

// ── Constants ────────────────────────────────────────────────────────────────

const RESOURCE_COLOR = {
  water:  '#4ab0ff',
  energy: '#ffdd44',
};

const RESOURCE_ICON = {
  water:  '💧',
  energy: '⚡',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Given the active lines, determine which resource types flow along each line.
 * Strategy: BFS from each producer; any line traversed while reaching a
 * consumer carries that producer's resource.  Simple and sufficient for the
 * current puzzle sizes.
 */
function computeLineResources(cities, lines) {
  const activeLines = lines.filter(l => !l.isDeleted);
  const cityByName = Object.fromEntries(cities.map(c => [c.cityName, c]));

  // adjacency: cityName → Set of cityNames, keyed by line id
  const adj = new Map();
  activeLines.forEach(l => {
    const a = l.points[0].cityName;
    const b = l.points[1].cityName;
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push({ neighbor: b, lineId: l.id });
    adj.get(b).push({ neighbor: a, lineId: l.id });
  });

  // resource carried per line id
  const lineResources = {};  // lineId → Set<resource>

  cities.forEach(city => {
    if (!city.produces?.length) return;
    city.produces.forEach(resource => {
      // BFS
      const visited = new Set([city.cityName]);
      const queue = [city.cityName];
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

// ── Component ────────────────────────────────────────────────────────────────

function PuzzleSVGMap({
  lines,
  cities,
  svgFile,
  selectedMarkers,
  onMarkerClick,
  onLineClick,
  flowResult,
  calculateLineCost,
  gameOver,
}) {
  const containerRef  = useRef(null);
  const overlayRef    = useRef(null);

  const [viewBox, setViewBox]   = useState('0 0 1200 800');
  const [svgSize, setSvgSize]   = useState({ width: 1200, height: 800 });
  const [mousePos, setMousePos] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);

  const MAX_W = 1200;
  const MAX_H = 1000;

  // ── viewBox from injected SVG ──────────────────────────────────────────────
  const handleAfterInjection = (svg) => {
    const vb = svg?.getAttribute('viewBox');
    if (vb) setViewBox(vb);
  };

  // ── Container sizing (preserve aspect ratio) ──────────────────────────────
  const [, , vbW, vbH] = viewBox.split(' ').map(Number);
  const aspect    = vbW / vbH;
  const cW        = aspect > MAX_W / MAX_H ? MAX_W : MAX_H * aspect;
  const cH        = aspect > MAX_W / MAX_H ? MAX_W / aspect : MAX_H;

  useEffect(() => setSvgSize({ width: cW, height: cH }), [cW, cH]);

  const pct2px = (xPct, yPct) => ({
    x: (xPct / 100) * svgSize.width,
    y: (yPct / 100) * svgSize.height,
  });

  // ── Ghost line (first city selected → mouse) ──────────────────────────────
  useEffect(() => {
    if (selectedMarkers.length === 0) setMousePos(null);
  }, [selectedMarkers]);

  const handleMouseMove = (e) => {
    if (selectedMarkers.length !== 1) return;
    const svg = overlayRef.current;
    if (!svg) return;
    try {
      const pt  = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      setMousePos({ x: sp.x, y: sp.y });
    } catch (_) { /* SVG not yet mounted */ }
  };

  const ghostStart = selectedMarkers.length === 1 && mousePos
    ? { x: (selectedMarkers[0].x / 100) * vbW, y: (selectedMarkers[0].y / 100) * vbH }
    : null;

  // ── Derived data from flow result ─────────────────────────────────────────
  const servedSet = new Set(
    (flowResult?.consumerStatus || []).filter(s => s.allMet).map(s => s.cityName)
  );

  const lineResourceMap = computeLineResources(cities, lines);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{ width: cW, height: cH, position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Background country SVG */}
      <ReactSVG
        src={svgFile}
        afterInjection={handleAfterInjection}
      />

      {/* Overlay: lines + cities */}
      <svg
        ref={overlayRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
        }}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Connection lines ─────────────────────────────── */}
        {lines.map((line, idx) => {
          if (line.isDeleted) return null;

          const from   = line.points[0];
          const to     = line.points[1];
          const fromPx = pct2px(from.x, from.y);
          const toPx   = pct2px(to.x,   to.y);
          const wpts   = [fromPx, toPx];
          const pathD  = buildPathD(wpts);
          const lineId = line.id ?? idx;
          const pathId = `pp-${lineId}`;

          const pathLen = Math.hypot(toPx.x - fromPx.x, toPx.y - fromPx.y);

          const resources = lineResourceMap[lineId];
          // If multiple resources flow on this line, use the first; else neutral
          const resourceList = resources ? [...resources] : [];
          const lineColor = resourceList.length === 1
            ? RESOURCE_COLOR[resourceList[0]] ?? '#aaaaaa'
            : resourceList.length > 1
              ? '#cccccc'   // mixed
              : '#666666';  // not carrying anything

          const { keyTimes, keyPoints, keySplines, totalDuration } =
            buildAnimationKeys(wpts, [1]);

          return (
            <React.Fragment key={lineId}>
              <path id={pathId} d={pathD} fill="none" stroke="none" />

              {/* Clickable line */}
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
                  <animate
                    attributeName="stroke-dashoffset"
                    from={pathLen} to={0}
                    dur="0.9s" fill="freeze"
                  />
                )}
              </path>

              {/* Animated resource dot */}
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

        {/* ── Ghost dotted line ────────────────────────────── */}
        {ghostStart && mousePos && (
          <line
            x1={ghostStart.x} y1={ghostStart.y}
            x2={mousePos.x}   y2={mousePos.y}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            strokeDasharray="8 5"
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}

        {/* ── City markers ─────────────────────────────────── */}
        {cities.map((city, i) => {
          const isSelected = selectedMarkers.some(m => m.cityName === city.cityName);
          const isProducer = city.role === 'producer';
          const isHybrid   = city.role === 'hybrid';
          const isConsumer = city.role === 'consumer';
          const isServed   = servedSet.has(city.cityName);

          const primaryResource = (city.produces ?? [])[0] ?? (city.needs ?? [])[0];
          const resourceColor   = RESOURCE_COLOR[primaryResource] ?? '#aaaaaa';

          // Fill: producers use resource color; consumers: green if served, red if not
          const fillColor = (isProducer || isHybrid)
            ? resourceColor
            : isServed ? '#44cc88' : '#ff6633';

          const strokeColor = isSelected     ? 'white'
            : (isProducer || isHybrid)       ? '#1a4480'
            : isServed                       ? '#115522'
            :                                  '#882200';

          // Price preview on hover when a city is already selected
          const showPrice = selectedMarkers.length === 1
            && hoveredCity === city.cityName
            && !isSelected
            && calculateLineCost != null;

          const previewCost = showPrice
            ? calculateLineCost(selectedMarkers[0], city)
            : null;

          const { x: cxPx, y: cyPx } = pct2px(city.x, city.y);

          // Label for what this city produces / needs
          const roleLabel = isProducer
            ? `▲ ${(city.produces ?? []).map(r => RESOURCE_ICON[r] ?? r).join(' ')}`
            : isHybrid
              ? `↕ ${([...(city.produces ?? []), ...(city.needs ?? [])]).map(r => RESOURCE_ICON[r] ?? r).join(' ')}`
              : `▼ ${(city.needs ?? []).map(r => RESOURCE_ICON[r] ?? r).join(' ')}`;

          return (
            <g
              key={i}
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              onClick={() => onMarkerClick(city)}
              onMouseEnter={() => setHoveredCity(city.cityName)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Pulse ring for producers */}
              {isProducer && (
                <circle cx={`${city.x}%`} cy={`${city.y}%`} r="12"
                  fill="none" stroke={resourceColor} strokeWidth="1.5" opacity="0.35"
                >
                  <animate attributeName="r"       values="10;22;10" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4"  dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Green ring when consumer is served */}
              {isConsumer && isServed && (
                <circle cx={`${city.x}%`} cy={`${city.y}%`} r="13"
                  fill="none" stroke="#44cc88" strokeWidth="1.5" opacity="0.55"
                />
              )}

              {/* Selection dashed ring */}
              {isSelected && (
                <circle cx={`${city.x}%`} cy={`${city.y}%`} r="14"
                  fill="none" stroke="white" strokeWidth="2"
                  strokeDasharray="4 3" opacity="0.85"
                />
              )}

              {/* Main body */}
              <circle
                cx={`${city.x}%`} cy={`${city.y}%`} r="9"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2"
              />

              {/* City name */}
              <text
                x={`${city.x}%`} y={`${city.y - 1.8}%`}
                textAnchor="middle"
                fontSize="12" fontWeight="bold" fill="white"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {city.cityName}
              </text>

              {/* Role / resource label */}
              <text
                x={`${city.x}%`} y={`${city.y + 2.3}%`}
                textAnchor="middle"
                fontSize="9"
                fill={(isProducer || isHybrid) ? resourceColor : isServed ? '#aaffcc' : '#ffbbaa'}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {roleLabel}
              </text>

              {/* €-cost tooltip on hover */}
              {showPrice && previewCost != null && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={cxPx - 30} y={cyPx - 40}
                    width="60" height="22" rx="6"
                    fill="#111" fillOpacity="0.9"
                    stroke="#ffdd44" strokeWidth="1.2"
                  />
                  <text
                    x={cxPx} y={cyPx - 24}
                    textAnchor="middle"
                    fontSize="12" fontWeight="bold" fill="#ffdd44"
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
