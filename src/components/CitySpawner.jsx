/**
 * CitySpawner.jsx — Frontend shim.
 *
 * This used to be a static data module (SPAWNABLE_CITIES + an inline
 * Array.find() lookup performed in Map.jsx). The data and lookup logic now
 * live in backend/src/citySpawner.js; this file just calls the API.
 *
 * getSpawnableCity(scenarioName, timeLeft) is async and resolves to the
 * city object that should spawn at that exact timeLeft, or null if nothing
 * should spawn on this tick.
 *
 * Callers (Map.jsx's spawn useEffect) should await it inside an async IIFE
 * with a cancellation guard, the same pattern used for evaluateTypedFlow.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function getSpawnableCity(scenarioName, timeLeft) {
  const params = new URLSearchParams({
    scenario: scenarioName ?? '',
    timeLeft: String(timeLeft),
  });

  const response = await fetch(`${API_BASE}/api/spawn-city?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`spawn-city API error: ${response.status}`);
  }

  const data = await response.json();
  return data.city ?? null;
}
