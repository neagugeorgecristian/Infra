import React from 'react';
import './LineOptions.css';

function LineOptions({ position, onClose, onDeleteLine, onUpgradeLine, onDowngradeLine, onShowInfo, line }) {
  const style = {
    left: `${position.x}px`,
    top: `${position.y}px`
  };

  // Determine if the line is upgraded based on className
  const isUpgraded = line.className === 'doubleline';

  return (
    <div className="line-options" style={style}>
      {/* Show upgrade/downgrade buttons based on line class */}
      {!isUpgraded && <button onClick={onUpgradeLine}>Upgrade Line</button>}
      {isUpgraded && <button onClick={onDowngradeLine}>Downgrade Line</button>}
      {/* Show delete only for non-upgraded lines */}
      {!isUpgraded && <button onClick={onDeleteLine}>Delete Line</button>}
      <button onClick={onShowInfo}>Information</button>
    </div>
  );
}


export default LineOptions;