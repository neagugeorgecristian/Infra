import React from 'react';
import SVGMap from './SVGMap';

const BTN_POS = {
  MD: { left: '70%', top: '22%' },
  BG: { left: '42%', top: '70%' },
};

function RegionUnlockSVGMap(props) {
  const {
    regionUnlock,
    unlockedRegions,
    onUnlockRegion,
    money,
  } = props;

  const isUnlocked = (id) => unlockedRegions.includes(id);
  const costOf = (id) => regionUnlock?.regions?.[id]?.unlockCost ?? 0;
  const labelOf = (id) => regionUnlock?.regions?.[id]?.label ?? id;

  const svgBeforeInjection = (svg) => {
    const paths = svg.querySelectorAll('#topology path[id]');
    paths.forEach((p) => {
      const id = p.getAttribute('id');
      const cfg = regionUnlock?.regions?.[id];
      if (!cfg) return;

      const unlocked = isUnlocked(id);
      p.style.transition = 'fill 0.25s ease, opacity 0.25s ease';
      p.style.fill = unlocked ? '#0d7a2b' : '#666666';
      p.style.opacity = unlocked ? '1' : '0.72';
      p.style.cursor = 'default'; // no click unlock on paths
    });
  };

  // Force ReactSVG reinjection when unlock state changes so styles always refresh.
  const svgRenderKey = `balkans-${unlockedRegions.join('-')}`;

  return (
    <div style={{ position: 'relative' }}>
      <SVGMap
        {...props}
        svgBeforeInjection={svgBeforeInjection}
        svgRenderKey={svgRenderKey}
      />

      {['MD', 'BG'].map((id) => {
        if (isUnlocked(id)) return null;
        const cost = costOf(id);
        const canAfford = money >= cost;
        const pos = BTN_POS[id];

        return (
          <button
            key={id}
            onClick={(e) => {
              e.stopPropagation();
              if (!canAfford) return;
              onUnlockRegion(id);
            }}
            disabled={!canAfford}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              background: canAfford ? '#1a6b2e' : '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              opacity: canAfford ? 1 : 0.75,
              whiteSpace: 'nowrap',
            }}
          >
            🔒 Unlock {labelOf(id)}<br />€{cost}
          </button>
        );
      })}
    </div>
  );
}

export default RegionUnlockSVGMap;