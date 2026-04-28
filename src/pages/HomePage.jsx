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
    { id: 'balkans', label: 'Balkans Scenario'},
    { id: 'europe', label: 'Europe - Balkans Unlock' },
    { id: 'infra-l1', label: 'Infra Puzzle L1 – First Pipe' },
    { id: 'infra-l2', label: 'Infra Puzzle L2 – Branching District' },
    { id: 'infra-l3', label: 'Infra Puzzle L3 – Tight Budget' },
    { id: 'infra-l4', label: 'Infra Puzzle L4 – Twin Utilities' },
    { id: 'infra-l5', label: 'Infra Puzzle L5 – Efficiency Test' },
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
