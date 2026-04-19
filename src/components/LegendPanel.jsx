import React from 'react';
import './LegendPanel.css';

function LegendPanel() {
  return (
    <div className="legend-panel">
      <div className="legend-title">Line speeds</div>

      <div className="legend-item">
        <div className="legend-line red"></div>
        <span>0–160 km/h</span>
      </div>

      <div className="legend-item">
        <div className="legend-line blue"></div>
        <span>160–250 km/h</span>
      </div>
    </div>
  );
}

export default LegendPanel;