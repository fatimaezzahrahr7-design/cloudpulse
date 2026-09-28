// ==========================================================
// builder.js
// "Build Your Cloud" — reads the visitor's selections and
// renders a small generated diagram plus simulated indicators.
//
// Every number here is a made-up, illustrative estimate based
// on simple point values per option — never a real benchmark.
// This file only draws; it has no dependency on the simulation
// engine used elsewhere on the page.
// ==========================================================

// Point values per option, on a rough 1–5 scale. These are
// deliberately simple and are only meant to demonstrate that
// choices carry trade-offs — not to model anything real.
const SCORES = {
  compute: {
    serverless: { scalability: 5, complexity: 2, latency: 60 },
    container: { scalability: 4, complexity: 3, latency: 45 },
    vm: { scalability: 2, complexity: 4, latency: 80 },
  },
  database: {
    sql: { scalability: 3, complexity: 3, latency: 20 },
    nosql: { scalability: 5, complexity: 2, latency: 12 },
  },
  storage: {
    object: { scalability: 5, complexity: 1, latency: 15 },
    block: { scalability: 3, complexity: 2, latency: 8 },
  },
  security: {
    auth: { securityPoints: 1, complexity: 1 },
    rateLimiting: { securityPoints: 1, complexity: 1 },
    encryption: { securityPoints: 2, complexity: 1 },
    monitoring: { securityPoints: 1, complexity: 1 },
  },
};

const LABELS = {
  compute: { serverless: "Serverless", container: "Container", vm: "Virtual machine" },
  database: { sql: "SQL database", nosql: "NoSQL database" },
  storage: { object: "Object storage", block: "Block storage" },
  security: {
    auth: "Authentication",
    rateLimiting: "Rate limiting",
    encryption: "Encryption",
    monitoring: "Monitoring",
  },
};

/**
 * Reads the current form state and returns the selected values.
 */
function readSelection(formEl) {
  const formData = new FormData(formEl);
  return {
    compute: formData.get("compute"),
    database: formData.get("database"),
    storage: formData.get("storage"),
    security: formData.getAll("security"), // checkboxes -> array
  };
}

/**
 * Turns a selection into the simulated indicator numbers.
 */
function computeIndicators(selection) {
  const compute = SCORES.compute[selection.compute];
  const database = SCORES.database[selection.database];
  const storage = SCORES.storage[selection.storage];
  const security = selection.security.map((key) => SCORES.security[key]);

  const scalability = Math.round((compute.scalability + database.scalability + storage.scalability) / 3);

  const securityLayers = security.reduce((sum, s) => sum + s.securityPoints, 0);

  const complexity =
    compute.complexity +
    database.complexity +
    storage.complexity +
    security.reduce((sum, s) => sum + s.complexity, 0);

  const estimatedLatency = compute.latency + database.latency + storage.latency;

  return {
    scalability: clamp(scalability, 1, 5),
    securityLayers,
    complexity: clamp(complexity, 1, 10),
    estimatedLatency,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Renders a horizontal bar for a 1–N scale indicator.
 */
function renderBar(label, value, max) {
  const percent = Math.round((value / max) * 100);
  return `
    <div class="builder-indicator">
      <div class="builder-indicator__label">
        <span>${label}</span>
        <span>${value}/${max}</span>
      </div>
      <div class="builder-indicator__track">
        <div class="builder-indicator__fill" style="width: ${percent}%"></div>
      </div>
    </div>
  `;
}

function renderDiagram(selection) {
  const securityLabels = selection.security.map((key) => LABELS.security[key]);

  return `
    <div class="builder-diagram">
      <div class="builder-diagram__layer">User</div>
      <div class="builder-diagram__arrow">↓</div>
      <div class="builder-diagram__layer">${LABELS.compute[selection.compute]}</div>
      <div class="builder-diagram__arrow">↓</div>
      <div class="builder-diagram__layer">${LABELS.database[selection.database]}</div>
      <div class="builder-diagram__arrow">↓</div>
      <div class="builder-diagram__layer">${LABELS.storage[selection.storage]}</div>
      ${
        securityLabels.length
          ? `<div class="builder-diagram__security">${securityLabels.join(" · ")}</div>`
          : `<div class="builder-diagram__security builder-diagram__security--none">No security controls selected</div>`
      }
    </div>
  `;
}

function renderOutput(outputEl, selection) {
  const indicators = computeIndicators(selection);

  outputEl.innerHTML = `
    ${renderDiagram(selection)}
    <div class="builder-indicators">
      ${renderBar("Scalability", indicators.scalability, 5)}
      ${renderBar("Security layers", indicators.securityLayers, 5)}
      ${renderBar("Complexity", indicators.complexity, 10)}
      <div class="builder-indicator">
        <div class="builder-indicator__label">
          <span>Estimated latency</span>
          <span>${indicators.estimatedLatency} ms</span>
        </div>
      </div>
    </div>
    <p class="builder-output__note">Simulated / educational estimates — not production benchmarks.</p>
  `;
}

/**
 * Wires up the builder form: renders once immediately, then
 * re-renders on every change.
 */
export function renderBuilder(formEl, outputEl) {
  const update = () => renderOutput(outputEl, readSelection(formEl));

  formEl.addEventListener("change", update);
  update(); // initial render with the default selections
}