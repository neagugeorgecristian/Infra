import React, { useEffect, useState } from 'react';
import './CityMarker.css'; // Import the CSS file for CityMarker styles

function CityMarker({ x, y, cityName, onSelect, selectedMarkers }) {
  const isSelected = selectedMarkers.some(marker => marker.cityName === cityName); // derive from props

  const markerStyle = {
    left: `${x}%`,
    top: `${y}%`,
    backgroundColor: isSelected ? 'red' : 'blue',
  };

  const handleClick = (e) => {
    e.stopPropagation(); // prevent map deselection
    onSelect({ x, y, cityName });
    console.log('Clicked on citymarker ' + cityName + ', selected: ', isSelected);
  };

  return (
    <div className="city-marker" style={markerStyle} onClick={handleClick}>
      <div className="city-label">{cityName}</div>
    </div>
  );
}

export default CityMarker;