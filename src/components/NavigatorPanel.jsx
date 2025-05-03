import React from 'react';
import './NavigatorPanel.css';

function NavigatorPanel({ onBack }) {
  return (
    <div className="navigator-panel">
      <button onClick={onBack}>Back to Main Menu</button>
    </div>
  );
}

export default NavigatorPanel;
