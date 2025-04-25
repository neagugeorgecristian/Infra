import React, { useRef, useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import mapSvg from '../assets/ro.svg';

function SVGMap({ lines, onLineClick }) {
  const offset = 0.3;
  const svgRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ width: 1, height: 1 }); // prevent divide-by-zero;

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSvgSize({ width, height });
      }
    });

    if (svgRef.current) {
      observer.observe(svgRef.current);
    }

    return () => {
      if (svgRef.current) {
        observer.unobserve(svgRef.current);
      }
    };
  }, []);

  const percentToPx = (xPercent, yPercent) => ({
    x: (xPercent / 100) * svgSize.width,
    y: (yPercent / 100) * svgSize.height,
  });

  return (
    <div className="map-svg" ref={svgRef}>
      <ReactSVG src={mapSvg} />
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {lines.map((line, index) => {
          const from = line.points[0];
          const to = line.points[1];

          const fromPx = percentToPx(from.x, from.y);
          const toPx = percentToPx(to.x, to.y);
          const pathId = `path-${index}`;

          const baseDuration = 2; // seconds
          const speed = line.speedMultiplier || 1;
          const duration = baseDuration / speed;

          return (
            <React.Fragment key={index}>
              {/* Clickable lines */}
              {line.className === 'doubleline' ? (
                <>
                  <line
                    x1={`${from.x}%`} y1={`${from.y + offset}%`}
                    x2={`${to.x}%`} y2={`${to.y + offset}%`}
                    stroke="black" strokeWidth="2"
                    onClick={(e) => onLineClick(e, line)}
                  />
                  <line
                    x1={`${from.x}%`} y1={`${from.y - offset}%`}
                    x2={`${to.x}%`} y2={`${to.y - offset}%`}
                    stroke="black" strokeWidth="2"
                    onClick={(e) => onLineClick(e, line)}
                  />
                </>
              ) : (
                <line
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`} y2={`${to.y}%`}
                  className={line.className}
                  onClick={(e) => onLineClick(e, line)}
                />
              )}

              {/* Invisible path for animation */}
              <path
                id={pathId}
                d={`M ${fromPx.x} ${fromPx.y} L ${toPx.x} ${toPx.y}`}
                fill="none"
                stroke="none"
              />
              {/* Moving dots */}
              <circle r="3" fill="red">
                <animateMotion dur={`${duration}s`} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
              <circle r="3" fill="red">
                <animateMotion dur={`${duration}s`} repeatCount="indefinite" rotate="auto" begin={`${duration / 2}s`}>
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
}

export default SVGMap;
