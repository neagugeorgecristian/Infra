import React from 'react';
import './puzzle.css';

const RESOURCE_ICON = {
  water:  '💧',
  energy: '⚡',
};

/**
 * Calculates the current star count based on budget spent and
 * connection count against the scenario's star thresholds.
 * Returns 1, 2, or 3.
 */
export function calculateStarCount(stars, spent, connectionCount) {
  if (!stars?.thresholds) return 1;
  const { budget2, budget3, maxConnections3 } = stars.thresholds;
  if (spent <= budget3 && connectionCount <= maxConnections3) return 3;
  if (spent <= budget2) return 2;
  return 1;
}

function PuzzleHUD({ budget, remaining, spent, flowResult, stars, connectionCount, resources }) {
  const pct = Math.max(0, (remaining / budget) * 100);

  const barClass = pct > 50 ? '' : pct > 25
    ? ' puzzle-hud__budget-fill--warning'
    : ' puzzle-hud__budget-fill--critical';

  const consumerStatus = flowResult?.consumerStatus ?? [];
  const allMet         = flowResult?.allDemandsMet ?? false;
  const previewStars   = allMet ? calculateStarCount(stars, spent, connectionCount) : 0;

  return (
    <div className="puzzle-hud">
      <div className="puzzle-hud__title">
        {(resources ?? []).map(r => RESOURCE_ICON[r] ?? r).join(' ')} Infrastructure Puzzle
      </div>

      {/* Budget */}
      <div className="puzzle-hud__budget">
        <div>Budget: <strong>€{remaining}</strong> / €{budget}</div>
        <div className="puzzle-hud__budget-bar">
          <div
            className={`puzzle-hud__budget-fill${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Live objectives derived from flowResult so they auto-update */}
      <div className="puzzle-hud__objectives">
        <strong>Deliveries:</strong>
        {consumerStatus.map(status => (
          <div
            key={status.cityName}
            className={`puzzle-hud__objective ${status.allMet ? 'puzzle-hud__objective--met' : 'puzzle-hud__objective--unmet'}`}
          >
            {status.allMet ? '✅' : '⬜'}{' '}
            {status.needs.map(n => RESOURCE_ICON[n] ?? n).join(' + ')} → {status.cityName}
          </div>
        ))}
      </div>

      {/* Live stats */}
      <div className="puzzle-hud__stats">
        <div>🔗 Connections: <strong>{connectionCount}</strong></div>
        <div>💰 Spent: <strong>€{spent}</strong></div>
        {previewStars > 0 && (
          <div>
            Current rating: {'⭐'.repeat(previewStars)}{'☆'.repeat(3 - previewStars)}
          </div>
        )}
      </div>

      {/* Star guide so players know what to aim for */}
      {stars && (
        <div className="puzzle-hud__stars-guide">
          <div>⭐&nbsp; {stars.oneStar}</div>
          <div>⭐⭐ {stars.twoStar}</div>
          <div>⭐⭐⭐ {stars.threeStar}</div>
        </div>
      )}
    </div>
  );
}

export default PuzzleHUD;
