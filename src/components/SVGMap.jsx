import React, { useRef, useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';

function SVGMap({ lines, onLineClick, cities, selectedMarkers, onMarkerClick, svgFile, satisfactionMap = {}, newCityFlash, gameOver = false }) {
  const svgContainerRef = useRef(null);
  const [viewBox, setViewBox] = useState('0 0 1200 800');
  const maxWidth = 1200;
  const maxHeight = 1000;

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

  return (
    <div
      className="map-svg"
      ref={svgContainerRef}
      style={{ width: containerWidth, height: containerHeight, position: 'relative' }}
    >
      <ReactSVG src={svgFile} />
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {lines.map((line, index) => {
          if (line.isDeleted) return null;
          const from = line.points[0];
          const to = line.points[1];
          const fromPx = percentToPx(from.x, from.y);
          const toPx = percentToPx(to.x, to.y);
          const midPx = { x: (fromPx.x + toPx.x) / 2, y: (fromPx.y + toPx.y) / 2 };

          const lineKey = line.id || index;
          const pathId = `path-${lineKey}`;

          const SPEED_PX_PER_SEC = 100;
          const speedMultiplier = line.speedMultiplier || 0.5;
          const dx = toPx.x - fromPx.x;
          const dy = toPx.y - fromPx.y;
          const distancePx = Math.sqrt(dx * dx + dy * dy);
          const travelTime = distancePx / (SPEED_PX_PER_SEC * speedMultiplier);
          const waitTime = 2;
          const totalDuration = 2 * travelTime + 2 * waitTime;
          const t1 = travelTime / totalDuration;
          const t2 = (travelTime + waitTime) / totalDuration;
          const t3 = (2 * travelTime + waitTime) / totalDuration;
          const keyTimes = `0; ${t1.toFixed(4)}; ${t2.toFixed(4)}; ${t3.toFixed(4)}; 1`;
          const keyPoints = `0; 1; 1; 0; 0`;

          return (
            <React.Fragment key={lineKey}>
              <line
                x1={`${from.x}%`} y1={`${from.y}%`}
                x2={`${to.x}%`}   y2={`${to.y}%`}
                stroke={line.upgraded ? 'blue' : 'red'}
                strokeWidth="2"
                strokeDasharray={line.isDisrupted ? '6 4' : 'none'}
                strokeOpacity={line.isDisrupted ? 0.5 : 1}
                onClick={(e) => onLineClick(e, line)}
              />

              {/* Issue 1: X mark on disrupted lines */}
              {line.isDisrupted && (
                <>
                  <line x1={midPx.x - 8} y1={midPx.y - 8} x2={midPx.x + 8} y2={midPx.y + 8}
                    stroke="orange" strokeWidth="3" strokeLinecap="round" />
                  <line x1={midPx.x + 8} y1={midPx.y - 8} x2={midPx.x - 8} y2={midPx.y + 8}
                    stroke="orange" strokeWidth="3" strokeLinecap="round" />
                </>
              )}

              <path
                id={pathId}
                d={`M ${fromPx.x} ${fromPx.y} L ${toPx.x} ${toPx.y}`}
                fill="none" stroke="none"
              />

              {/* Issue 1 & 5: don't animate when disrupted or game over */}
              {!gameOver && !line.isDisrupted && (
                <circle r="3" fill="yellow">
                  <animateMotion
                    dur={`${totalDuration}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes={keyTimes}
                    keyPoints={keyPoints}
                    keySplines="0.4 0 0.6 1; 0 0 1 1; 0.4 0 0.6 1; 0 0 1 1"
                    begin="1s"
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              )}
            </React.Fragment>
          );
        })}

        {cities.map((city, index) => (
          <g
            key={index}
            className="city-marker"
            onClick={() => onMarkerClick(city)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={`${city.x}%`}
              cy={`${city.y}%`}
              r="7"
              fill={
                selectedMarkers.some(m => m.cityName === city.cityName)
                  ? 'white'
                  : (satisfactionMap[city.cityName] ?? 50) >= 80 ? '#00cc44'
                  : (satisfactionMap[city.cityName] ?? 50) >= 50 ? '#ffaa00'
                  : (satisfactionMap[city.cityName] ?? 50) >= 20 ? '#ff4400'
                  : '#880000'
              }
              stroke={newCityFlash === city.cityName ? '#ffff00' : 'white'}
              strokeWidth={newCityFlash === city.cityName ? '3' : '1'}
            />
            <text
              x={`${city.x}%`}
              y={`${city.y - 1.5}%`}
              textAnchor="middle"
              fontSize="16"
              fill="white"
            >
              {city.cityName}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default SVGMap;