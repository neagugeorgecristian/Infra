import React, { useState, useEffect } from 'react';

// Minimum dimensions required to play
const MIN_WIDTH  = 1280;
const MIN_HEIGHT = 550;

/**
 * MinWindowGate
 *
 * Renders a full-screen overlay if the browser window is smaller than
 * the minimum required dimensions. Children render normally when the
 * window is large enough.
 *
 * Uses window.innerWidth / innerHeight (the CSS viewport size), which
 * naturally reflects maximized vs non-maximized state on desktop.
 */
function MinWindowGate({ children }) {
  const [size, setSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tooSmall = size.w < MIN_WIDTH || size.h < MIN_HEIGHT;

  if (!tooSmall) return children;

  return (
    <>
      {/* Render children underneath but fully blocked */}
      <div style={{ visibility: 'hidden', pointerEvents: 'none' }}>
        {children}
      </div>

      {/* Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#050d1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        color: '#8bb8d8',
        textAlign: 'center',
        padding: '32px',
      }}>
        {/* Blueprint grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(74,176,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,176,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Icon */}
          <div style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.6 }}>⛶</div>

          {/* Headline */}
          <div style={{
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#4ab0ff',
            marginBottom: '16px',
            opacity: 0.8,
          }}>
            Display too small
          </div>

          {/* Main message */}
          <div style={{
            fontSize: '22px',
            fontFamily: "'Exo 2', system-ui, sans-serif",
            fontWeight: 700,
            color: '#c8e0f4',
            marginBottom: '12px',
          }}>
            Maximize your window to play
          </div>

          {/* Sub-message */}
          <div style={{
            fontSize: '14px',
            color: '#4a6a80',
            marginBottom: '28px',
            lineHeight: 1.6,
          }}>
            This game requires at least {MIN_WIDTH} × {MIN_HEIGHT} px<br />
            Your current window is {size.w} × {size.h} px
          </div>

          {/* Live size indicator */}
          <div style={{
            display: 'inline-flex',
            gap: '24px',
            background: 'rgba(74,176,255,0.06)',
            border: '1px solid rgba(74,176,255,0.15)',
            borderRadius: '4px',
            padding: '10px 24px',
            fontSize: '13px',
          }}>
            <span>
              <span style={{ color: size.w >= MIN_WIDTH ? '#44cc88' : '#ff5533' }}>
                {size.w >= MIN_WIDTH ? '✓' : '✗'}
              </span>
              {' '}Width: <strong style={{ color: '#c8e0f4' }}>{size.w}px</strong>
              {' '}<span style={{ opacity: 0.4 }}>/ {MIN_WIDTH}</span>
            </span>
            <span>
              <span style={{ color: size.h >= MIN_HEIGHT ? '#44cc88' : '#ff5533' }}>
                {size.h >= MIN_HEIGHT ? '✓' : '✗'}
              </span>
              {' '}Height: <strong style={{ color: '#c8e0f4' }}>{size.h}px</strong>
              {' '}<span style={{ opacity: 0.4 }}>/ {MIN_HEIGHT}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default MinWindowGate;