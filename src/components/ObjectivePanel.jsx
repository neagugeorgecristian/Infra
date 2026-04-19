import React from 'react';

const PHASE_OBJECTIVES = [
  "Connect all starting cities",
  "Reach €1200 before the rush begins",
  "Keep all cities above 30% satisfaction",
  "Survive the demand surge",
  "Maintain 3 happy cities for 20 seconds",
  "Hold the network together until time runs out"
];

function ObjectivePanel({ gamePhase }) {
  return (
    <div style={{
      position: 'absolute', bottom: '20px', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.75)', color: 'white',
      padding: '8px 20px', borderRadius: '8px',
      fontSize: '14px', zIndex: 10, textAlign: 'center'
    }}>
      🎯 <strong>Objective:</strong> {PHASE_OBJECTIVES[gamePhase]}
    </div>
  );
}

export default ObjectivePanel;