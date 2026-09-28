// ==========================================================
// map.js
// Renders the global traffic visualization: region nodes,
// animated traffic lines between them, and a click-to-inspect
// info panel.
//
// This file only knows how to draw. It receives simulation
// updates from app.js the same way the event stream does —
// it doesn't create or control the simulation itself.
// ==========================================================

import { REGIONS, generateTrafficState } from "./data.js";

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 70;
const NODE_RADIUS = 2.2;

const STATE_COLOR_VAR = {
  normal: "var(--color-signal)",
  suspicious: "var(--color-caution)",
  blocked: "var(--color-alert)",
};

/**
 * Renders the map into `mountEl` and wires it up to `simulation`.
 * Returns nothing — this is a "fire and forget" setup call,
 * matching how app.js already uses simulation.onUpdate().
 */
export function renderMap(mountEl, simulation) {
  mountEl.innerHTML = ""; // clear the "coming soon" placeholder text

  const svg = createSvg();
  mountEl.appendChild(svg);

  const linesGroup = svg.querySelector("[data-lines-group]");
  const nodesGroup = svg.querySelector("[data-nodes-group]");

  const infoPanel = createInfoPanel();
  mountEl.appendChild(infoPanel);

  // Per-region stats shown in the info panel. Starts as plausible
  // baseline numbers; updates each time that region's state changes.
  const regionInfo = Object.fromEntries(
    REGIONS.map((region) => [
      region.id,
      { status: "normal", requests: 120, latency: 40, securityEvents: 0 },
    ])
  );

  let selectedRegionId = null;

  for (const region of REGIONS) {
    const node = createNode(region);
    node.addEventListener("click", () => {
      selectedRegionId = region.id;
      updateInfoPanel(infoPanel, region, regionInfo[region.id]);
    });
    nodesGroup.appendChild(node);
  }

  // Periodically animate a traffic line between two random regions,
  // colored by a freshly rolled traffic state.
  const lineTimer = setInterval(() => {
    animateRandomLine(linesGroup);
  }, 1200);

  simulation.onUpdate((update) => {
    if (update.kind === "region") {
      const region = REGIONS.find((r) => r.id === update.regionId);
      if (!region) return;

      const nodeEl = nodesGroup.querySelector(`[data-region-id="${region.id}"]`);
      if (nodeEl) {
        nodeEl.style.setProperty("--node-color", STATE_COLOR_VAR[update.state] ?? STATE_COLOR_VAR.normal);
      }

      regionInfo[region.id] = {
        status: update.state,
        requests: Math.round(80 + Math.random() * 400),
        latency: Math.round(30 + Math.random() * 150),
        securityEvents: update.state === "normal" ? 0 : Math.round(1 + Math.random() * 4),
      };

      if (selectedRegionId === region.id) {
        updateInfoPanel(infoPanel, region, regionInfo[region.id]);
      }
    }

    if (update.kind === "reset") {
      clearInterval(lineTimer);
    }
  });
}

// ----------------------------------------------------------
// SVG construction helpers
// ----------------------------------------------------------

function createSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "map-svg");
  svg.innerHTML = `
    <g data-lines-group class="map-lines"></g>
    <g data-nodes-group class="map-nodes"></g>
  `;
  return svg;
}

function createNode(region) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("class", "map-node");
  group.setAttribute("data-region-id", region.id);
  group.style.setProperty("--node-color", STATE_COLOR_VAR.normal);
  group.setAttribute("tabindex", "0");
  group.setAttribute("role", "button");
  group.setAttribute("aria-label", `${region.name} region`);

  group.innerHTML = `
    <circle cx="${region.x}" cy="${region.y}" r="${NODE_RADIUS}" class="map-node__dot"></circle>
    <title>${region.name}</title>
  `;

  // Keyboard support to match the click behavior.
  group.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") group.dispatchEvent(new Event("click"));
  });

  return group;
}

function animateRandomLine(linesGroup) {
  const [from, to] = pickTwoRegions();
  const state = generateTrafficState();

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", from.x);
  line.setAttribute("y1", from.y);
  line.setAttribute("x2", to.x);
  line.setAttribute("y2", to.y);
  line.setAttribute("class", `map-line map-line--${state}`);

  linesGroup.appendChild(line);

  // Matches the CSS animation duration — remove once it's done
  // so the DOM doesn't accumulate old lines forever.
  setTimeout(() => line.remove(), 1400);
}

function pickTwoRegions() {
  const first = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  let second = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  while (second.id === first.id) {
    second = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  }
  return [first, second];
}

// ----------------------------------------------------------
// Info panel (shown when a region is clicked)
// ----------------------------------------------------------

function createInfoPanel() {
  const panel = document.createElement("div");
  panel.className = "map-info";
  panel.setAttribute("data-region-info", "");
  panel.hidden = true;
  return panel;
}

function updateInfoPanel(panel, region, info) {
  panel.hidden = false;
  panel.innerHTML = `
    <h3 class="map-info__name">${region.name}</h3>
    <dl class="map-info__stats">
      <div><dt>Status</dt><dd class="map-info__status map-info__status--${info.status}">${info.status}</dd></div>
      <div><dt>Requests</dt><dd>${info.requests}/s</dd></div>
      <div><dt>Latency</dt><dd>${info.latency} ms</dd></div>
      <div><dt>Security events</dt><dd>${info.securityEvents}</dd></div>
    </dl>
  `;
}