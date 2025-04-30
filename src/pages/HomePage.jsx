import React from 'react';
import { useNavigate } from 'react-router-dom';
//import './HomePage.css'; // Add styles

function HomePage() {
  const navigate = useNavigate();

  const scenarios = [
    { id: 'romania', label: 'Romania Scenario' },
    { id: 'bulgaria', label: 'Bulgaria Scenario' },
    { id: 'moldova', label: 'Moldova Scenario' }
  ];

  return (
    <div className="homepage">
      {scenarios.map(s => (
        <div 
          key={s.id} 
          className="scenario-card"
          onClick={() => navigate(`/scenario/${s.id}`)}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}

export default HomePage;
