import React, { useEffect, useState } from 'react';
import './CityMarker.css'; // Import the CSS file for CityMarker styles

function CityMarker({ x, y, cityName, onSelect, selectedMarkers }) {
  const [isSelected, setIsSelected] = useState(false); // State to track selection

  useEffect(() => {
    if (selectedMarkers.length === 0) {
      setIsSelected(false);
    } else if (selectedMarkers.length === 1 && selectedMarkers[0].cityName === cityName) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }, [selectedMarkers, cityName]);

  const markerStyle = {
    left: `${x}%`,
    top: `${y}%`,
    backgroundColor: isSelected ? 'red' : 'blue', // Change background color based on selection
  };

  const handleClick = () => {
    setIsSelected(!isSelected); // Toggle selection state
    onSelect({ x, y, cityName });
    console.log('Selection on citymarker ' + cityName + ': ', isSelected);
  };

  return (
    <div className="city-marker" style={markerStyle} onClick={handleClick}>
      <div className="city-label">{cityName}</div>
    </div>
  );
}

export default CityMarker;
