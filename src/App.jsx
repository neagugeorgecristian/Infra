import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
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
    <Router>
      <div className="app-container">
        <h1 className="title">Infrastructure game</h1>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/scenario/:id" 
            element={
              <GamePage 
                selectedMarkers={selectedMarkers}
                onMarkerClick={handleMarkerClick}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
