import React from 'react';
import './LineOptions.css'; // Reuse styling

function InfoPanel({ info, onClose, satisfactionMap }) {
  if (!info || !info.type) return null;

  const { type, data } = info;

  const isCity = info?.type === 'city';
  const cityName = isCity ? info.data.cityName : null;
  const satisfaction = isCity ? satisfactionMap[cityName] ?? 0 : null;

  return (
    <div className="line-options" style={{ position: 'absolute', top: '10px', right: '10px' }}>
      {type === 'city' && (
        <>
          <strong>{data.cityName}</strong>
          <p>Region: {regionMap[data.cityName] || 'Unknown'}</p>
          <strong>Satisfaction:</strong> {satisfaction}
        </>
      )}

      {type === 'line' && (
        <>
          <strong>{data.points[0].cityName} → {data.points[1].cityName}</strong>
          <p>Speed multiplier: {data.speedMultiplier?.toFixed(2) || '1.00'}</p>
          <p>Status: {data.className === 'doubleline' ? 'Upgraded' : 'Standard'}</p>
        </>
      )}

      <button onClick={onClose}>Close</button>
    </div>
  );
}

const regionMap = {
  'Constanța': 'Southeast',
  'Sibiu': 'Center',
  'Clooj': 'Northwest',
  'Craiova': 'Southwest'
};

export default InfoPanel;
