import React from 'react';
import { ReactSVG } from 'react-svg';
import mapSvg from '../assets/ro.svg'; // Import the SVG file

function SVGMap({ lines, onLineClick }) {
  const offset = 0.3; // Adjust this value to control the distance between parallel lines

  return (
    <div className="map-svg">
      <ReactSVG src={mapSvg} />
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {lines.map((line, index) => (
          line.className === 'doubleline' ? (
            <React.Fragment key={index}>
              <line
                x1={`${line.points[0].x}%`}
                y1={`${line.points[0].y + offset}%`}
                x2={`${line.points[1].x}%`}
                y2={`${line.points[1].y + offset}%`}
                stroke="black"
                strokeWidth="2"
                onClick={(event) => onLineClick(event, line)}
              />
              <line
                x1={`${line.points[0].x}%`}
                y1={`${line.points[0].y - offset}%`}
                x2={`${line.points[1].x}%`}
                y2={`${line.points[1].y - offset}%`}
                stroke="black"
                strokeWidth="2"
                onClick={(event) => onLineClick(event, line)}
              />
            </React.Fragment>
          ) : (
            <line
              key={index}
              x1={`${line.points[0].x}%`}
              y1={`${line.points[0].y}%`}
              x2={`${line.points[1].x}%`}
              y2={`${line.points[1].y}%`}
              className={line.className}
              onClick={(event) => onLineClick(event, line)}
            />
          )
        ))}
      </svg>
    </div>
  );
}

export default SVGMap;
