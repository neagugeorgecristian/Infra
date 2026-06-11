import React from 'react';
import './PuzzleIntroModal.css';

const RESOURCE_ICON = {
  water:  '💧',
  energy: '⚡',
  goods: '📦',
};

/**
 * PuzzleIntroModal
 *
 * Renders a full-screen backdrop with a blueprint-styled modal
 * showing the scenario's intro story. Dismissed via "I see" CTA.
 *
 * Props:
 *   scenario  – the full scenario object (reads .name, .intro, .resources, .objectives, .id)
 *   onDismiss – callback fired when the user clicks "I see"
 */
function PuzzleIntroModal({ scenario, onDismiss }) {
  const { name, intro, resources = [], objectives = [], id = '' } = scenario;

  // Derive a short level label from the id, e.g. "infra-l3" → "L-03"
  const levelMatch = id.match(/(\d+)$/);
  const levelLabel = levelMatch ? `L-${String(levelMatch[1]).padStart(2, '0')}` : 'BRIEFING';

  return (
    <div className="puzzle-intro-backdrop" onClick={onDismiss}>
      <div
        className="puzzle-intro-modal"
        onClick={e => e.stopPropagation()} // clicking inside doesn't close
      >
        {/* Corner decorations */}
        <div className="puzzle-intro-corner puzzle-intro-corner--tl" />
        <div className="puzzle-intro-corner puzzle-intro-corner--tr" />
        <div className="puzzle-intro-corner puzzle-intro-corner--bl" />
        <div className="puzzle-intro-corner puzzle-intro-corner--br" />

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="puzzle-intro-header">
          <div className="puzzle-intro-level-badge">{levelLabel}</div>
          <div className="puzzle-intro-header-text">
            <div className="puzzle-intro-label">Infrastructure Briefing</div>
            <div className="puzzle-intro-title">{name}</div>
          </div>
        </div>

        {/* ── Resource tags ───────────────────────────────────────── */}
        {resources.length > 0 && (
          <div className="puzzle-intro-resources">
            {resources.map(r => (
              <span
                key={r}
                className={`puzzle-intro-resource-tag puzzle-intro-resource-tag--${r}`}
              >
                {RESOURCE_ICON[r] ?? r} {r}
              </span>
            ))}
          </div>
        )}

        {/* ── Story body ──────────────────────────────────────────── */}
        <div className="puzzle-intro-body">
          <div className="puzzle-intro-transmission">Incoming transmission</div>
          <p className="puzzle-intro-story">
            {intro ?? 'Your mission briefing has not been received. Proceed with caution.'}
          </p>
        </div>

        {/* ── Objectives strip ────────────────────────────────────── */}
        {objectives.length > 0 && (
          <div className="puzzle-intro-objectives">
            <div className="puzzle-intro-objectives-label">Operational targets</div>
            {objectives.map((obj, i) => (
              <div key={i} className="puzzle-intro-objective-item">{obj}</div>
            ))}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="puzzle-intro-footer">
          <span className="puzzle-intro-hint">click anywhere to dismiss</span>
          <button className="puzzle-intro-cta" onClick={onDismiss}>
            I see →
          </button>
        </div>
      </div>
    </div>
  );
}

export default PuzzleIntroModal;