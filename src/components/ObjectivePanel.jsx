import React from 'react';

const PHASE_OBJECTIVES = [
  "Connect all starting cities",
  "Reach €1200 before the rush begins",
  "Keep all cities above 30% satisfaction",
  "Survive the demand surge",
  "Maintain 3 happy cities for 20 seconds",
  "Hold the network together until time runs out"
];

function ObjectivePanel({ gamePhase, completedCount, objectives }) {
  const custom = Array.isArray(objectives) && objectives.length > 0;
  const objectiveText = custom
    ? objectives[Math.min(gamePhase, objectives.length - 1)]
    : PHASE_OBJECTIVES[gamePhase];

  const total = custom ? objectives.length : 5;

  return (
    <div style={{
      background: 'rgba(0,0,0,0.75)', color: 'white',
      padding: '8px 20px', borderRadius: '8px',
      fontSize: '14px', textAlign: 'center',
      whiteSpace: 'nowrap'
    }}>
      🎯 <strong>Objective:</strong> {objectiveText}
      <span style={{ marginLeft: '12px', opacity: 0.7 }}>✅ {completedCount}/{total}</span>
    </div>
  );
}

export default ObjectivePanel;