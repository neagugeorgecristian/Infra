import React from 'react';

const PHASE_OBJECTIVES = [
  "Connect all starting cities",
  "Reach €1200 before the rush begins",
  "Keep all cities above 30% satisfaction",
  "Survive the demand surge",
  "Maintain 3 happy cities for 20 seconds",
  "Hold the network together until time runs out"
];

function ObjectivePanel({ gamePhase, completedCount }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.75)', color: 'white',
      padding: '8px 20px', borderRadius: '8px',
      fontSize: '14px', textAlign: 'center',
      whiteSpace: 'nowrap'
    }}>
      🎯 <strong>Objective:</strong> {PHASE_OBJECTIVES[gamePhase]}
      <span style={{ marginLeft: '12px', opacity: 0.7 }}>✅ {completedCount}/5</span>
    </div>
  );
}

export default ObjectivePanel;