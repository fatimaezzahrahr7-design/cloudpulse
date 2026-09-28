// ==========================================================
// data.js
// Pure data generation for CloudPulse.
//
// Nothing in this file touches the DOM. It only produces
// fake-but-plausible numbers and events. That separation
// matters: simulation.js decides *when* to call these
// functions, and map.js / architecture.js decide *how* to
// draw the results. This file just decides *what* the data is.
// ==========================================================

// The eight regions shown on the global map. Coordinates are
// rough percentages of the map canvas (0–100), not real geo
// coordinates — map.js will use these to place nodes.
export const REGIONS = [
  { id: "morocco",      name: "Morocco",        x: 47, y: 46 },
  { id: "europe",       name: "Europe",         x: 51, y: 30 },
  { id: "north-america",name: "North America",  x: 20, y: 32 },
  { id: "south-america",name: "South America",  x: 28, y: 62 },
  { id: "middle-east",  name: "Middle East",    x: 58, y: 42 },
  { id: "east-asia",    name: "East Asia",      x: 80, y: 38 },
  { id: "south-asia",   name: "South Asia",     x: 70, y: 46 },
  { id: "africa",       name: "Africa",         x: 52, y: 60 },
];

// Possible states for a region or a traffic line.
// "normal" = green, "suspicious" = amber, "blocked" = red.
export const TRAFFIC_STATES = ["normal", "suspicious", "blocked"];

// Templates for the live event stream. {from} and {to} get
// filled in with region names when relevant.
const EVENT_TEMPLATES = [
  { type: "request", detail: "{from} → {to} edge" },
  { type: "request", detail: "{from} → {to} edge" },
  { type: "system",  detail: "Database response normal" },
  { type: "system",  detail: "Cache hit ratio stable" },
  { type: "anomaly", detail: "Unusual request pattern detected" },
  { type: "security",detail: "Rate limit triggered" },
  { type: "blocked", detail: "Suspicious request blocked" },
];

// Picks a random item from an array.
function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Formats a Date as HH:MM:SS, matching the mockup's event log style.
function formatTime(date) {
  return date.toTimeString().slice(0, 8);
}

/**
 * Generates one plausible metrics snapshot.
 * `intensity` (0–1+) lets simulation.js push numbers up during
 * a traffic spike or down during an outage. 1 = normal baseline.
 */
export function generateMetrics(intensity = 1) {
  const baseRequests = 1200;
  const baseLatency = 140;

  return {
    requests: Math.round(baseRequests * intensity + (Math.random() * 100 - 50)),
    regions: REGIONS.length,
    latency: Math.round(baseLatency * intensity + (Math.random() * 20 - 10)),
    threats: Math.round(2 + Math.random() * intensity * 3),
    availability: (99.9 + Math.random() * 0.09).toFixed(2),
  };
}

/**
 * Generates one random event for the live stream.
 * Picks two different regions for "request"-type events so
 * traffic always looks like it's going somewhere real.
 */
export function generateEvent() {
  const template = randomFrom(EVENT_TEMPLATES);
  const [from, to] = pickTwoRegions();

  return {
    time: formatTime(new Date()),
    type: template.type,
    detail: template.detail
      .replace("{from}", from.name)
      .replace("{to}", to.name),
  };
}

// Picks two distinct regions, used for "from → to" style events.
function pickTwoRegions() {
  const first = randomFrom(REGIONS);
  let second = randomFrom(REGIONS);
  while (second.id === first.id) {
    second = randomFrom(REGIONS);
  }
  return [first, second];
}

/**
 * Generates a random traffic state, weighted so "normal" is
 * far more common than "suspicious" or "blocked" — matches
 * how real traffic looks (mostly fine, occasionally not).
 */
export function generateTrafficState() {
  const roll = Math.random();
  if (roll > 0.95) return "blocked";
  if (roll > 0.85) return "suspicious";
  return "normal";
}