import express from 'express';
import cors from 'cors';
import { evaluateTypedFlow } from './puzzleFlow.js';
import { getSpawnableCity } from './citySpawner.js';
import { calculateLineCost } from './lineCost.js';

const app  = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/evaluate-flow
 *
 * Body: { cities: City[], lines: Line[] }
 *
 * Returns the same shape as the frontend evaluateTypedFlow(), except
 * activatedHybrids is an Array<string> (JSON-safe) instead of a Set.
 */
app.post('/api/evaluate-flow', (req, res) => {
  const { cities, lines } = req.body;

  if (!Array.isArray(cities) || !Array.isArray(lines)) {
    return res.status(400).json({ error: 'cities and lines must be arrays' });
  }

  try {
    const result = evaluateTypedFlow({ cities, lines });
    res.json(result);
  } catch (err) {
    console.error('[evaluate-flow] error:', err);
    res.status(500).json({ error: 'Flow evaluation failed' });
  }
});

/**
 * GET /api/spawn-city?scenario=<name>&timeLeft=<seconds>
 *
 * Query: scenario (string, scenario name e.g. "Moldova"), timeLeft (number)
 *
 * Returns: { city: City | null }
 *
 * city is the city definition that should spawn at this exact timeLeft
 * value for this scenario, or null if nothing should spawn on this tick.
 */
app.get('/api/spawn-city', (req, res) => {
  const { scenario, timeLeft } = req.query;

  if (typeof scenario !== 'string' || timeLeft === undefined) {
    return res.status(400).json({ error: 'scenario and timeLeft query params are required' });
  }

  const parsedTimeLeft = Number(timeLeft);
  if (Number.isNaN(parsedTimeLeft)) {
    return res.status(400).json({ error: 'timeLeft must be a number' });
  }

  try {
    const city = getSpawnableCity(scenario, parsedTimeLeft);
    res.json({ city });
  } catch (err) {
    console.error('[spawn-city] error:', err);
    res.status(500).json({ error: 'Spawn lookup failed' });
  }
});

/**
 * POST /api/line-cost
 *
 * Body: { a: { x: number, y: number }, b: { x: number, y: number } }
 *
 * Returns: { cost: number }
 *
 * This is the AUTHORITATIVE price for a connection between two points.
 * The frontend keeps a local copy of the same formula for instant hover
 * previews, but every cost that actually debits the player's budget must
 * be confirmed against this endpoint before the purchase is committed.
 */
app.post('/api/line-cost', (req, res) => {
  const { a, b } = req.body ?? {};

  try {
    const cost = calculateLineCost(a, b);
    res.json({ cost });
  } catch (err) {
    // calculateLineCost throws on malformed/out-of-range points — that's
    // always a client error (400), never a server error.
    res.status(400).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ ok: true }));

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`infra-backend listening on http://localhost:${PORT}`);
});