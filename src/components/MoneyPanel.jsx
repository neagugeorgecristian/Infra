import React from 'react';
import './MoneyPanel.css';

function MoneyPanel({ money }) {
  return (
    <div className="money-panel">
      Money: € {money}
    </div>
  );
}

export default MoneyPanel;
