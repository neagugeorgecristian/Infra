import React, { useRef, useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import { getPathKey, PATH_REGISTRY, buildPathD, buildAnimationKeys } from './pathRegistry.jsx';

function SVGMap({ lines, onLineClick, cities, selectedMarkers, onMarkerClick,
                  svgFile, satisfactionMap = {}, newCityFlash, gameOver = false,
                  calculateLineCost, svgBeforeInjection, svgRenderKey  }) {
  const svgContainerRef = useRef(null);
  const svgOverlayRef   = useRef(null);   // ref used for coordinate conversion
  const [viewBox, setViewBox] = useState('0 0 1200 800');
  const maxWidth  = 1200;
  const maxHeight = 1000;

  const [hoveredCity, setHoveredCity] = useState(null);

  // ── Ghost line state ─────────────────────────────────────────────────────
  // mousePos is kept in SVG viewBox coordinates so it aligns perfectly with
  // all other geometry drawn inside the overlay <svg>.
  const [mousePos, setMousePos] = useState(null);

  // Clear the ghost line whenever the selection is reset from outside
  useEffect(() => {
    if (selectedMarkers.length === 0) setMousePos(null);
  }, [selectedMarkers]);

  // Convert a DOM mouse event to SVG viewBox coordinates via the CTM
  const handleMouseMove = (e) => {
    if (selectedMarkers.length !== 1) return;
    const svg = svgOverlayRef.current;
    if (!svg) return;
    try {
      const pt  = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      setMousePos({ x: svgP.x, y: svgP.y });
    } catch (_) {
      // getScreenCTM() can fail on unmounted elements – safely ignore
    }
  };

  const handleMouseLeave = () => setMousePos(null);
  // ─────────────────────────────────────────────────────────────────────────

  const useSvgContainerSize = (viewBox, maxWidth, maxHeight) => {
    const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    const svgAspectRatio = vbWidth / vbHeight;
    const maxAspectRatio = maxWidth / maxHeight;

    if (svgAspectRatio > maxAspectRatio) {
      return { width: maxWidth, height: maxWidth / svgAspectRatio };
    }
    return { width: maxHeight * svgAspectRatio, height: maxHeight };
  };

  const { width: containerWidth, height: containerHeight } = useSvgContainerSize(viewBox, maxWidth, maxHeight);

  useEffect(() => {
    const svgElement = svgContainerRef.current?.querySelector('svg');
    if (svgElement) {
      const vb = svgElement.getAttribute('viewBox');
      if (vb) setViewBox(vb);
    }
  }, [svgFile]);

  const [svgSize, setSvgSize] = useState({ width: 1200, height: 1000 });

  const percentToPx = (xPercent, yPercent) => ({
    x: (xPercent / 100) * svgSize.width,
    y: (yPercent / 100) * svgSize.height,
  });

  useEffect(() => {
    setSvgSize({ width: containerWidth, height: containerHeight });
  }, [containerWidth, containerHeight]);

  // Precompute ghost-line start point in viewBox coordinates.
  // cx/cy in SVG percentage syntax resolve to (pct/100 * vbDimension).
  const ghostStart = (() => {
    if (selectedMarkers.length !== 1 || !mousePos) return null;
    const city = selectedMarkers[0];
    const [, , vbW, vbH] = viewBox.split(' ').map(Number);
    return {
      x: (city.x / 100) * vbW,
      y: (city.y / 100) * vbH,
    };
  })();

  return (
    <div
      className="map-svg"
      ref={svgContainerRef}
      style={{ width: containerWidth, height: containerHeight, position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ReactSVG
        key={svgRenderKey || svgFile}
        src={svgFile}
        beforeInjection={svgBeforeInjection}
      />
      <svg
        ref={svgOverlayRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {lines.map((line, index) => {
          if (line.isDeleted) return null;

          const from   = line.points[0];
          const to     = line.points[1];
          const fromPx = percentToPx(from.x, from.y);
          const toPx   = percentToPx(to.x,   to.y);

          // ── Custom path lookup ──────────────────────────────────────────────
          const pathKey    = getPathKey(from.cityName, to.cityName);
          const customPath = PATH_REGISTRY[pathKey];

          const rawWaypoints = customPath
            ? customPath.points.map((wp, i) => {
                if (wp === null) return i === 0 ? fromPx : toPx;
                return percentToPx(wp.x, wp.y);
              })
            : [fromPx, toPx];

          const isReversed  = customPath &&
            [from.cityName, to.cityName].sort().join('||').split('||')[0] !== from.cityName;
          const waypoints   = isReversed ? [...rawWaypoints].reverse() : rawWaypoints;

          const segSpeeds   = isReversed && customPath
            ? [...customPath.segmentSpeeds].reverse()
            : customPath?.segmentSpeeds ?? [1];

          const pathD    = buildPathD(waypoints);
          const lineKey  = line.id || index;
          const pathId   = `path-${lineKey}`;

          const { keyTimes, keyPoints, keySplines, totalDuration } =
            buildAnimationKeys(waypoints, segSpeeds);

          const pathLen = waypoints.reduce((acc, wp, i) => {
            if (i === 0) return 0;
            const prev = waypoints[i - 1];
            return acc + Math.sqrt((wp.x - prev.x) ** 2 + (wp.y - prev.y) ** 2);
          }, 0);

          const midPx = waypoints[Math.floor(waypoints.length / 2)];

          return (
            <React.Fragment key={lineKey}>
              <path id={pathId} d={pathD} fill="none" stroke="none" />

              <path
                d={pathD}
                fill="none"
                stroke={line.upgraded ? 'blue' : 'red'}
                strokeWidth={line.upgraded ? 3 : 2}
                strokeDasharray={line.isNew ? pathLen : undefined}
                strokeDashoffset={line.isNew ? pathLen : undefined}
                strokeOpacity={line.isDisrupted ? 0.4 : 1}
                strokeLinecap="round"
                onClick={e => onLineClick(e, line)}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              >
                {line.isNew && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from={pathLen}
                    to={0}
                    dur="0.9s"
                    fill="freeze"
                    calcMode="spline"
                    keyTimes="0;0.65;0.82;0.91;1"
                    keySplines="0.4 0 0.2 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                    values={`${pathLen};${pathLen * 0.08};${-pathLen * 0.04};${pathLen * 0.02};0`}
                  />
                )}
              </path>

              {line.isDisrupted && midPx && (<>
                <line x1={midPx.x - 8} y1={midPx.y - 8} x2={midPx.x + 8} y2={midPx.y + 8}
                  stroke="orange" strokeWidth="3" strokeLinecap="round" />
                <line x1={midPx.x + 8} y1={midPx.y - 8} x2={midPx.x - 8} y2={midPx.y + 8}
                  stroke="orange" strokeWidth="3" strokeLinecap="round" />
              </>)}

              {!gameOver && !line.isDisrupted && !line.isNew && (
                <circle r="4" fill="yellow" stroke="#aa8800" strokeWidth="0.5">
                  <animateMotion
                    dur={`${totalDuration}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes={keyTimes}
                    keyPoints={keyPoints}
                    keySplines={keySplines}
                    begin="1s"
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              )}
            </React.Fragment>
          );
        })}

        {/* ── Ghost dotted line: first city → mouse cursor ──────────────── */}
        {ghostStart && mousePos && (
          <line
            x1={ghostStart.x}
            y1={ghostStart.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2"
            strokeDasharray="10 6"
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}

        {cities.map((city, i) => {
          const { x: cx, y: cy } = percentToPx(city.x, city.y);
          const sat         = satisfactionMap[city.cityName] ?? 50;
          const isSelected  = selectedMarkers.some(m => m.cityName === city.cityName);
          const isFirstCity = selectedMarkers.length === 1;
          const isHovered   = hoveredCity === city.cityName;

          const showPrice = isFirstCity
            && isHovered
            && calculateLineCost
            && !isSelected;

          const previewCost = showPrice
            ? calculateLineCost(selectedMarkers[0], city)
            : null;

          return (
            <g
              key={i}
              className="city-marker"
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              onClick={() => onMarkerClick(city)}
              onMouseEnter={() => setHoveredCity(city.cityName)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {isSelected && (
                <circle cx={`${city.x}%`} cy={`${city.y}%`} r="11"
                  fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6"
                />
              )}

              {newCityFlash === city.cityName && (
                <circle cx={`${city.x}%`} cy={`${city.y}%`} r="14"
                  fill="none" stroke="#ffff00" strokeWidth="2" opacity="0.8">
                  <animate attributeName="r"       values="10;20;10" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
                </circle>
              )}

              <circle
                cx={`${city.x}%`}
                cy={`${city.y}%`}
                r="7"
                fill={
                  isSelected   ? 'white'
                  : sat >= 80  ? '#00cc44'
                  : sat >= 50  ? '#ffaa00'
                  : sat >= 20  ? '#ff4400'
                  : '#880000'
                }
                stroke={newCityFlash === city.cityName ? '#ffff00' : 'white'}
                strokeWidth={newCityFlash === city.cityName ? 2.5 : 1}
              />

              <text
                x={`${city.x}%`}
                y={`${city.y - 1.5}%`}
                textAnchor="middle"
                fontSize="13"
                fill="white"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {city.cityName}
              </text>

              {showPrice && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={cx - 28} y={cy - 38}
                    width="56" height="22"
                    rx="6"
                    fill="#111" fillOpacity="0.88"
                    stroke="#ffdd44" strokeWidth="1.2"
                  />
                  <text
                    x={cx} y={cy - 22}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#ffdd44"
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

export default SVGMap;