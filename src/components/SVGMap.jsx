import React from 'react';
import { ReactSVG } from 'react-svg';
import mapSvg from '../assets/ro.svg'; // Import the SVG file

function SVGMap({ lines, onLineClick }) {
  return (
    <div className="map-svg">
      <ReactSVG src={mapSvg} />
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {lines.map((line, index) => (
          <line
            key={index}
            x1={`${line[0].x}%`}
            y1={`${line[0].y}%`}
            x2={`${line[1].x}%`}
            y2={`${line[1].y}%`}
            stroke="black"
            strokeWidth="2"
            onClick={(event) => onLineClick(event, line)}
          />
        ))}
      </svg>
    </div>
  );
}

export default SVGMap;
