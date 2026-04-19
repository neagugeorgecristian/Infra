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
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "18px",
            color: "white"
          }}
        >
          <span>Made with ❤️ in the</span>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg"
            alt="EU"
            style={{ height: "1em" }}
          />
        </div>
      </div>
    </Router>
  );
}

export default App;
