import React, { useRef, useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import { predefinedPaths } from '../customPaths';


function SVGMap({ lines, onLineClick, cities, selectedMarkers, onMarkerClick, svgFile }) {
  const svgContainerRef = useRef(null);
  const [viewBox, setViewBox] = useState('0 0 1200 800');
  const maxWidth = 1200;
  const maxHeight = 1000;

  // TODO: Possible move to utils
  const useSvgContainerSize = (viewBox, maxWidth, maxHeight) => {
    const [minX, minY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    const svgAspectRatio = vbWidth / vbHeight;
    const maxAspectRatio = maxWidth / maxHeight;

    let finalWidth, finalHeight;

    if (svgAspectRatio > maxAspectRatio) {
      finalWidth = maxWidth;
      finalHeight = maxWidth / svgAspectRatio;
    } else {
      finalHeight = maxHeight;
      finalWidth = maxHeight * svgAspectRatio;
    }

    return { width: finalWidth, height: finalHeight };
  };


  const { width: containerWidth, height: containerHeight } = useSvgContainerSize(viewBox, maxWidth, maxHeight);

  useEffect(() => {
    const svgElement = svgContainerRef.current?.querySelector('svg');
    if (svgElement) {
      const vb = svgElement.getAttribute('viewBox');
      if (vb) {
        setViewBox(vb);
      }
    }
  }, [svgFile]); // re-run when svgFile changes

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
        {/* Your lines and cities rendering stays unchanged */}
        {lines.map((line, index) => {
          if (line.isDeleted) return null;
          const from = line.points[0];
          const to = line.points[1];
          const fromPx = percentToPx(from.x, from.y);
          const toPx = percentToPx(to.x, to.y);

          const pathId = `path-${index}`;
          const baseDuration = 2;
          const speed = line.speedMultiplier || 1;
          const duration = baseDuration / speed;



          return (
            <React.Fragment key={index}>
            
              <line
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke={line.upgraded ? 'blue' : 'red'}
                strokeWidth="2"
                onClick={(e) => onLineClick(e, line)}
              />
            
              <path
                id={pathId}
                d={`M ${fromPx.x} ${fromPx.y} L ${toPx.x} ${toPx.y}`}
                fill="none"
                stroke="none"
              />
              <circle r="3" fill="red">
                <animateMotion dur={`${duration}s`} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
              <circle r="3" fill="red">
                <animateMotion
                  dur={`${duration}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                  begin={`${duration / 2}s`}
                >
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
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
              r="5"
              fill={
                selectedMarkers.some((marker) => marker.cityName === city.cityName)
                  ? 'red'
                  : 'blue'
              }
              stroke="white"
              strokeWidth="1"
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
