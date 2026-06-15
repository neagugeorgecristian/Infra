import express from 'express';
import cors from 'cors';
import { evaluateTypedFlow } from './puzzleFlow.js';

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

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ ok: true }));

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`infra-backend listening on http://localhost:${PORT}`);
});