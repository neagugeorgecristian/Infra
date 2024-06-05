import React, { useState } from 'react';
import Map from './components/Map';
import './App.css';

function App() {
  const [selectedMarkers, setSelectedMarkers] = useState([]);

  const handleMarkerClick = (cityName) => {
    console.log('Markers status: ', selectedMarkers);
    setSelectedMarkers((prevSelected) => {
      if (prevSelected.includes(cityName)) {
        return prevSelected.filter((name) => name !== cityName);
      } else {
        return [...prevSelected, cityName];
      }
    });
  };

  return (
    <div className="app-container">
      <h1 className="title">Infrastructure game</h1>
      <Map 
        selectedMarkers={selectedMarkers} 
        onMarkerClick={handleMarkerClick} 
      />
    </div>
  );
}

export default App;
