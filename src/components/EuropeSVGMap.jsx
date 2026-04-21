import React from 'react';
import { ReactSVG } from 'react-svg';
import { COUNTRY_LAYOUT, COUNTRY_FILES, UNLOCK_COSTS } from '../scenarios/europe';

const W = 1200;
const H = 1000;

function EuropeSVGMap({
  lines, onLineClick, cities, selectedMarkers, onMarkerClick,
  satisfactionMap = {}, newCityFlash, gameOver = false,
  unlockedCountries, onUnlockCountry, money,
}) {
  const px = (xPct, yPct) => ({
    x: (xPct / 100) * W,
    y: (yPct / 100) * H,
  });

  return (
    <div className="map-svg" style={{ width: W, height: H, position: 'relative' }}>

      {/* ── Country SVG backgrounds ─────────────────────────────────── */}
      {Object.entries(COUNTRY_LAYOUT).map(([country, l]) => {
        const unlocked  = unlockedCountries.includes(country);
        const cost      = UNLOCK_COSTS[country];
        const canAfford = cost !== undefined && money >= cost;

        return (
          <div key={country} style={{
            position: 'absolute',
            left: `${l.left}%`, top: `${l.top}%`,
            width: `${l.width}%`, height: `${l.height}%`,
          }}>
            {/* SVG with greyscale filter when locked */}
            <div className="country-svg-container" style={{
              width: '100%', height: '100%',
              filter: unlocked ? 'none' : 'grayscale(100%) brightness(0.4)',
              transition: 'filter 0.6s ease',
            }}>
              <ReactSVG
                src={COUNTRY_FILES[country]}
                style={{ width: '100%', height: '100%', display: 'block' }}
                beforeInjection={svg => {
                  svg.setAttribute('width',  '100%');
                  svg.setAttribute('height', '100%');
                  // stretch to fill — slight distortion is acceptable in a game
                  svg.setAttribute('preserveAspectRatio', 'none');
                  svg.style.display = 'block';
                }}
              />
            </div>

            {/* Unlock button, centred over the greyed country */}
            {!unlocked && cost !== undefined && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center', zIndex: 5,
              }}>
                <button
                  onClick={() => onUnlockCountry(country)}
                  disabled={!canAfford}
                  style={{
                    background: canAfford ? '#1a6b2e' : '#555',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '8px 14px', fontSize: '13px',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    opacity: canAfford ? 1 : 0.75,
                    whiteSpace: 'nowrap',
                  }}
                >
                  🔒 Unlock {country.charAt(0).toUpperCase() + country.slice(1)}<br />
                  €{cost}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Lines + city markers overlay ────────────────────────────── */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {lines.map((line, index) => {
          if (line.isDeleted) return null;

          const from = line.points[0];
          const to   = line.points[1];
          const fp   = px(from.x, from.y);
          const tp   = px(to.x,   to.y);
          const mp   = { x: (fp.x + tp.x) / 2, y: (fp.y + tp.y) / 2 };

          const lineKey = line.id || index;
          const pathId  = `eur-path-${lineKey}`;
          const speed   = line.speedMultiplier || 0.5;
          const dx = tp.x - fp.x, dy = tp.y - fp.y;
          const dist  = Math.sqrt(dx*dx + dy*dy);
          const tTime = dist / (100 * speed);
          const wTime = 2;
          const total = 2 * tTime + 2 * wTime;
          const t1 = tTime / total;
          const t2 = (tTime + wTime) / total;
          const t3 = (2 * tTime + wTime) / total;
          const kt = `0; ${t1.toFixed(4)}; ${t2.toFixed(4)}; ${t3.toFixed(4)}; 1`;
          const kp = `0; 1; 1; 0; 0`;

          return (
            <React.Fragment key={lineKey}>
              <line
                x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                stroke={line.upgraded ? 'blue' : 'red'} strokeWidth="2"
                strokeDasharray={line.isDisrupted ? '6 4' : 'none'}
                strokeOpacity={line.isDisrupted ? 0.5 : 1}
                onClick={e => onLineClick(e, line)}
                style={{ cursor: 'pointer' }}
              />
              {line.isDisrupted && (<>
                <line x1={mp.x-8} y1={mp.y-8} x2={mp.x+8} y2={mp.y+8}
                  stroke="orange" strokeWidth="3" strokeLinecap="round" />
                <line x1={mp.x+8} y1={mp.y-8} x2={mp.x-8} y2={mp.y+8}
                  stroke="orange" strokeWidth="3" strokeLinecap="round" />
              </>)}
              <path id={pathId} d={`M ${fp.x} ${fp.y} L ${tp.x} ${tp.y}`}
                fill="none" stroke="none" />
              {!gameOver && !line.isDisrupted && (
                <circle r="3" fill="yellow">
                  <animateMotion dur={`${total}s`} repeatCount="indefinite"
                    calcMode="spline" keyTimes={kt} keyPoints={kp}
                    keySplines="0.4 0 0.6 1; 0 0 1 1; 0.4 0 0.6 1; 0 0 1 1"
                    begin="1s">
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              )}
            </React.Fragment>
          );
        })}

        {cities.map((city, i) => {
          const { x: cx, y: cy } = px(city.x, city.y);
          return (
            <g key={i} className="city-marker"
              onClick={() => onMarkerClick(city)} style={{ cursor: 'pointer' }}>
              <circle cx={cx} cy={cy} r="7"
                fill={
                  selectedMarkers.some(m => m.cityName === city.cityName) ? 'white'
                  : (satisfactionMap[city.cityName] ?? 50) >= 80 ? '#00cc44'
                  : (satisfactionMap[city.cityName] ?? 50) >= 50 ? '#ffaa00'
                  : (satisfactionMap[city.cityName] ?? 50) >= 20 ? '#ff4400'
                  : '#880000'
                }
                stroke={newCityFlash === city.cityName ? '#ffff00' : 'white'}
                strokeWidth={newCityFlash === city.cityName ? '3' : '1'}
              />
              <text x={cx} y={cy - 12} textAnchor="middle" fontSize="12" fill="white">
                {city.cityName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default EuropeSVGMap;