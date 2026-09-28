// ==========================================================
// simulation.js
// The simulation engine: owns the run loop, the current mode,
// and notifies listeners (app.js) whenever new data is ready.
//
// This file doesn't touch the DOM. It doesn't know that a map
// or an event list exists. It just ticks, generates data, and
// tells whoever is listening "here's what changed." That's what
// keeps map.js/architecture.js free to change independently of
// how the simulation itself works.
// ==========================================================

import { generateMetrics, generateEvent, generateTrafficState, REGIONS } from "./data.js";

// How often the simulation "ticks" (produces a new event / metric update).
const TICK_INTERVAL_MS = 1500;

// Simulation modes and the metric "intensity" multiplier each uses.
// simulation.js doesn't need to know *why* intensity is higher during
// a spike — data.js already knows how to scale with it.
const MODES = {
  normal: { intensity: 1, eventChance: 0.6 },
  spike: { intensity: 2.2, eventChance: 0.9 },
  suspicious: { intensity: 1.3, eventChance: 1.0 },
  outage: { intensity: 0.3, eventChance: 0.8 },
};

export function createSimulation() {
  let mode = "normal";
  let timerId = null;
  let isRunning = false;

  // Current state of each region, keyed by region id.
  // app.js/map.js read this to know how to color each node.
  const regionStates = Object.fromEntries(
    REGIONS.map((region) => [region.id, "normal"])
  );

  // Functions to call whenever the state changes. app.js will
  // register listeners here instead of this file knowing about
  // the DOM directly.
  const listeners = new Set();

  function onUpdate(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback); // unsubscribe helper
  }

  function emit(update) {
    for (const callback of listeners) {
      callback(update);
    }
  }

  function tick() {
    const { intensity, eventChance } = MODES[mode];

    const metrics = generateMetrics(intensity);
    emit({ kind: "metrics", metrics });

    // Occasionally update a region's traffic state so the map
    // has something to react to, not just the event list.
    if (Math.random() < 0.4) {
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const state = mode === "normal" ? generateTrafficState() : mode === "spike" ? "normal" : mode;
      regionStates[region.id] = state === "outage" ? "blocked" : state;
      emit({ kind: "region", regionId: region.id, state: regionStates[region.id] });
    }

    if (Math.random() < eventChance) {
      emit({ kind: "event", event: generateEvent() });
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    timerId = setInterval(tick, TICK_INTERVAL_MS);
    emit({ kind: "status", isRunning });
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerId);
    timerId = null;
    emit({ kind: "status", isRunning });
  }

  function reset() {
    pause();
    mode = "normal";
    for (const id in regionStates) {
      regionStates[id] = "normal";
    }
    emit({ kind: "reset" });
  }

  // Switches mode for a limited time, then returns to normal —
  // this is what the "Simulate traffic spike" etc. buttons will call.
  function triggerMode(nextMode, durationMs = 8000) {
    if (!MODES[nextMode]) return;
    mode = nextMode;
    emit({ kind: "mode", mode });

    setTimeout(() => {
      mode = "normal";
      emit({ kind: "mode", mode: "normal" });
    }, durationMs);
  }

  return {
    start,
    pause,
    reset,
    triggerMode,
    onUpdate,
    get isRunning() {
      return isRunning;
    },
    get regionStates() {
      return regionStates;
    },
  };
}