// ==========================================================
// app.js
// Connects the simulation engine and the visual renderers to
// the actual page: metrics, event stream, global map,
// architecture diagram, simulation controls, and the
// "Build Your Cloud" section.
// ==========================================================

import { createSimulation } from "./simulation.js";
import { renderMap } from "./map.js";
import { renderArchitecture } from "./architecture.js";
import { renderBuilder } from "./builder.js";

const MAX_EVENTS_SHOWN = 8;

const EVENT_STYLE = {
  request: "system",
  system: "system",
  anomaly: "anomaly",
  security: "anomaly",
  blocked: "blocked",
};

function formatMetrics(metrics) {
  return {
    requests: metrics.requests.toLocaleString("en-US"),
    regions: String(metrics.regions).padStart(2, "0"),
    latency: `${metrics.latency} ms`,
    threats: String(metrics.threats).padStart(2, "0"),
    availability: `${metrics.availability}%`,
  };
}

function updateMetricsDOM(metrics) {
  const formatted = formatMetrics(metrics);
  for (const [key, value] of Object.entries(formatted)) {
    const el = document.querySelector(`[data-metric="${key}"]`);
    if (el) el.textContent = value;
  }
}

function createEventRow(event) {
  const li = document.createElement("li");
  const styleModifier = EVENT_STYLE[event.type] ?? "system";
  li.className = `event event--${styleModifier}`;

  li.innerHTML = `
    <span class="event__time">${event.time}</span>
    <span class="event__type">${event.type}</span>
    <span class="event__detail">${event.detail}</span>
  `;
  return li;
}

function prependEvent(event, listEl) {
  listEl.prepend(createEventRow(event));

  while (listEl.children.length > MAX_EVENTS_SHOWN) {
    listEl.lastElementChild.remove();
  }
}

function init() {
  const eventListEl = document.querySelector("[data-event-mount]");
  const mapMountEl = document.querySelector("[data-map-mount]");
  const architectureMountEl = document.querySelector("[data-architecture-mount]");
  const statusTextEl = document.querySelector(".command-center__status span:nth-child(2)");
  const builderFormEl = document.querySelector("[data-builder-form]");
  const builderOutputEl = document.querySelector("[data-builder-output]");

  const simulation = createSimulation();

  simulation.onUpdate((update) => {
    if (update.kind === "metrics") {
      updateMetricsDOM(update.metrics);
    }

    if (update.kind === "event") {
      prependEvent(update.event, eventListEl);
    }

    if (update.kind === "status") {
      statusTextEl.textContent = update.isRunning ? "Simulation active" : "Simulation paused";
    }

    // "region" and "mode" updates are consumed by map.js itself
    // via its own simulation.onUpdate() subscription.
  });

  renderMap(mapMountEl, simulation);
  renderArchitecture(architectureMountEl);
  renderBuilder(builderFormEl, builderOutputEl);

  simulation.start();

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "start") simulation.start();
      if (action === "pause") simulation.pause();
      if (action === "reset") {
        simulation.reset();
        simulation.start();
      }
      if (action === "spike") simulation.triggerMode("spike");
      if (action === "suspicious") simulation.triggerMode("suspicious");
      if (action === "outage") simulation.triggerMode("outage");
    });
  });
}

document.addEventListener("DOMContentLoaded", init);