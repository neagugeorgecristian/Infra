import React from 'react';
import './LineOptions.css'; // Reuse styling

function CityInfo({ city, onClose }) {
	if (!city) return null;

	const regionMap = {
		'Constanța': 'Southeast',
		'Sibiu': 'Center',
		'Clooj': 'Northwest'
	};

	return (
		<div className="line-options" style={{ position: 'absolute', top: '10px', right: '10px'}}>
			<strong>{city.cityName}</strong>
			<p>Region: {regionMap[city.cityName] || 'Unknown'}</p>
			<button onClick={onClose}>Close</button>
		</div>
	);
}

export default CityInfo;