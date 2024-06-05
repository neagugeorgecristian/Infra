import React from 'react';
import './LineOptions.css';

function LineOptions({ position, onClose, onDeleteLine, onUpgradeLine }) {
	const style = {
		left: `${position.x}px`,
		top: `${position.y}px`
	};

	return (
		<div className="line-options" style={style}>
			<button onClick={onDeleteLine}>Delete Line</button>
			<button onClick={onUpgradeLine}>Upgrade Line</button>
			<button onClick={onClose}>Information</button>
		</div>
	);
}

export default LineOptions;