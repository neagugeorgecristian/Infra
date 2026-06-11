import { useNavigate } from 'react-router-dom';

import romania from '../scenarios/romania';
import bulgaria from '../scenarios/bulgaria';
import moldova from '../scenarios/moldova';
import balkans from '../scenarios/balkans';

import infraPuzzleScenarios from '../scenarios/infraPuzzleLevels';

function HomePage() {
  const navigate = useNavigate();

  const classicScenarios = [
    { id: 'romania', scenario: romania },
    { id: 'bulgaria', scenario: bulgaria },
    { id: 'moldova', scenario: moldova },
    { id: 'balkans', scenario: balkans },
  ];

  const regionUnlockScenarios = [
    { id: 'europe', label: 'Europe - Balkans Unlock' },
  ];

  const puzzleScenarios = Object.entries(infraPuzzleScenarios).map(([id, scenario]) => ({
    id,
    scenario,
  }));

  const scenarios = [
    ...classicScenarios.map(({ id, scenario }) => ({ id, label: scenario.name })),
    ...regionUnlockScenarios,
    ...puzzleScenarios.map(({ id, scenario }) => ({ id, label: scenario.name })),
  ];

  return (
    <div className="homepage">
      <h1 className="title">Infrastructure game</h1>
      {scenarios.map(s => (
        <div key={s.id} className="scenario-card" onClick={() => navigate(`/scenario/${s.id}`)}>
          {s.label}
        </div>
      ))}
      <div style={{
        position: 'absolute', bottom: '10px',
        left: '10px',
        display: 'flex', alignItems: 'center',
        gap: '6px', fontSize: '18px', color: 'white'
      }}>Credits:
        <a href="https://simplemaps.com/" target="_blank" rel="noopener noreferrer">
          <span>simplemaps.com</span>
        </a>
      </div>
      <div style={{
        position: 'absolute', bottom: '10px',
        right: '10px',
        display: 'flex', alignItems: 'center',
        gap: '6px', fontSize: '18px', color: 'white'
      }}>Credits:
        <a href="https://simplemaps.com/" target="_blank" rel="noopener noreferrer">
          <span>simplemaps.com</span>
        </a>
      </div>
    </div>
  );
}

export default HomePage;