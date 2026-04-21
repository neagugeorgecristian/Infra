import { useEffect, useState } from 'react';

const EVENTS = [
  { id: 'delay',    phase: 2, message: '🚨 Train delayed! One line paused for 10s.',          effect: 'pauseLine'   },
  { id: 'surge',    phase: 3, message: '📈 Demand surge! Satisfaction decays faster for 15s.', effect: 'decayBoost'  },
  { id: 'shutdown', phase: 4, message: '⚡ Power outage! A random line is shut down for 20s.', effect: 'shutdownLine' },
  { id: 'grant',    phase: 1, message: '🇪🇺 EU infrastructure grant received: +€300!',          effect: 'moneyBoost'  },
];

export function useEventSystem({ gamePhase, linesRef, setLines, setMoney, active }) {
  const [activeEvent, setActiveEvent]   = useState(null);
  const [usedEvents,  setUsedEvents]    = useState(new Set());

  useEffect(() => {
    if (!active || activeEvent) return;

    const interval = setInterval(() => {
      const available = EVENTS.filter(e => e.phase === gamePhase && !usedEvents.has(e.id));
      if (!available.length || Math.random() > 0.4) return;

      const event = available[Math.floor(Math.random() * available.length)];
      setActiveEvent(event);
      setUsedEvents(prev => new Set([...prev, event.id]));

      if (event.effect === 'moneyBoost') {
        setMoney(prev => prev + 300);
      }

      if (event.effect === 'shutdownLine') {
        // Use linesRef.current for fresh data; use id (not reference) for matching
        const activeLines = linesRef.current.filter(l => !l.isDeleted);
        if (activeLines.length > 0) {
          const target   = activeLines[Math.floor(Math.random() * activeLines.length)];
          const targetId = target.id;                            // ← id-based, not reference

          setLines(prev => prev.map(l =>
            l.id === targetId ? { ...l, isDisrupted: true } : l
          ));
          setTimeout(() => {
            setLines(prev => prev.map(l =>
              l.id === targetId ? { ...l, isDisrupted: false } : l
            ));
          }, 20000);
        }
      }

      setTimeout(() => setActiveEvent(null), 4000);
    }, 15000);

    return () => clearInterval(interval);
  }, [gamePhase, active, activeEvent]);   // linesRef is a ref, doesn't need to be here

  return { activeEvent };
}

export function EventBanner({ event }) {
  if (!event) return null;
  return (
    <div style={{
      position: 'absolute', top: '60px', left: '50%',
      transform: 'translateX(-50%)',
      background: '#cc3300', color: 'white',
      padding: '12px 24px', borderRadius: '8px',
      fontSize: '16px', fontWeight: 'bold',
      zIndex: 100, textAlign: 'center',
    }}>
      {event.message}
    </div>
  );
}