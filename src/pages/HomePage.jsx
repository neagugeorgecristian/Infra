import React from 'react';
import { useNavigate } from 'react-router-dom';
//import './HomePage.css'; // Add styles

// BEFORE
function HomePage() {
  const navigate = useNavigate();

  const scenarios = [
    { id: 'romania', label: 'Romania Scenario' },
    { id: 'bulgaria', label: 'Bulgaria Scenario' },
    { id: 'moldova', label: 'Moldova Scenario' },
    { id: 'europe', label: 'Europe - Balkans Unlock' }
  ];

  return (
    <div className="homepage">
      {scenarios.map(s => (
        <div key={s.id} className="scenario-card" onClick={() => navigate(`/scenario/${s.id}`)}>
          {s.label}
        </div>
      ))}
      <div style={{
        position: 'absolute', bottom: '10px',
        display: 'flex', alignItems: 'center',
        gap: '6px', fontSize: '18px', color: 'white'
      }}>
        <span>Made with ❤️ in the</span>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg"
          alt="EU"
          style={{ height: '1em' }}
        />
      </div>
    </div>
  );
}

export default HomePage;
