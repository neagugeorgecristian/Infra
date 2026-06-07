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