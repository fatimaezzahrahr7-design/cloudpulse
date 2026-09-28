// ==========================================================
// architecture.js
// Renders the cloud architecture diagram: a vertical chain of
// layers a request passes through, plus the security controls
// that sit alongside them. Clicking a layer or control shows
// an explanation panel.
//
// Like map.js, this file only draws — it doesn't know about
// the simulation engine. The content below is static reference
// information, not something that needs to react to live data.
// ==========================================================

const LAYERS = [
  {
    id: "user",
    name: "User",
    description: "A person or device sending a request — opening a page, calling an API, uploading a file.",
    onFailure: "Nothing to fail here — this is where the request originates.",
    security: [],
  },
  {
    id: "edge",
    name: "Edge / CDN",
    description: "The closest server to the user, geographically. Caches content and can block obviously bad requests before they reach anything more expensive.",
    onFailure: "Requests fall back to a further-away edge node or the origin server directly — usually higher latency, not full downtime.",
    security: ["Rate limiting", "Basic request filtering"],
  },
  {
    id: "api",
    name: "API",
    description: "The entry point for structured requests. Decides what the request is asking for and which backend service should handle it.",
    onFailure: "Clients get errors instead of data — this is usually the layer where an outage becomes visible to users.",
    security: ["Authentication", "Rate limiting"],
  },
  {
    id: "compute",
    name: "Serverless compute",
    description: "Where the actual logic runs — processing the request, applying business rules, calling other services as needed.",
    onFailure: "That specific function stops responding; well-designed systems isolate the failure so other functions keep working.",
    security: ["Monitoring", "Logging"],
  },
  {
    id: "database",
    name: "Database",
    description: "Stores structured data — user records, application state, anything that needs to be queried and updated reliably.",
    onFailure: "Reads/writes fail or slow down dramatically; often the most serious kind of outage since data operations back up everywhere.",
    security: ["Authentication", "Monitoring"],
  },
  {
    id: "storage",
    name: "Storage",
    description: "Holds large unstructured data — files, images, backups — separate from the database's structured records.",
    onFailure: "Uploads/downloads fail, but usually doesn't take down the rest of the system since it's decoupled from compute and the database.",
    security: ["Logging"],
  },
];

/**
 * Renders the architecture diagram into `mountEl`.
 * No simulation dependency — this is static educational content.
 */
export function renderArchitecture(mountEl) {
  mountEl.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "architecture-diagram";

  const chain = document.createElement("div");
  chain.className = "architecture-diagram__chain";

  const infoPanel = createInfoPanel();

  LAYERS.forEach((layer, index) => {
    chain.appendChild(createLayerButton(layer, infoPanel));

    if (index < LAYERS.length - 1) {
      chain.appendChild(createConnector());
    }
  });

  wrapper.appendChild(chain);
  wrapper.appendChild(infoPanel);
  mountEl.appendChild(wrapper);

  // Show the first layer with real content by default so the
  // panel isn't empty before anyone clicks anything.
  updateInfoPanel(infoPanel, LAYERS[1]);
}

// ----------------------------------------------------------
// Element builders
// ----------------------------------------------------------

function createLayerButton(layer, infoPanel) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "layer";
  button.dataset.layerId = layer.id;

  button.innerHTML = `
    <span class="layer__name">${layer.name}</span>
    ${
      layer.security.length
        ? `<span class="layer__security">${layer.security.join(" · ")}</span>`
        : ""
    }
  `;

  button.addEventListener("click", () => {
    document
      .querySelectorAll(".layer--active")
      .forEach((el) => el.classList.remove("layer--active"));
    button.classList.add("layer--active");
    updateInfoPanel(infoPanel, layer);
  });

  return button;
}

function createConnector() {
  const connector = document.createElement("div");
  connector.className = "architecture-diagram__connector";
  connector.setAttribute("aria-hidden", "true");
  connector.textContent = "↓";
  return connector;
}

function createInfoPanel() {
  const panel = document.createElement("div");
  panel.className = "architecture-info";
  return panel;
}

function updateInfoPanel(panel, layer) {
  panel.innerHTML = `
    <h3 class="architecture-info__name">${layer.name}</h3>
    <p class="architecture-info__description">${layer.description}</p>
    <p class="architecture-info__failure"><strong>If it fails:</strong> ${layer.onFailure}</p>
    ${
      layer.security.length
        ? `<p class="architecture-info__security"><strong>Security:</strong> ${layer.security.join(", ")}</p>`
        : ""
    }
  `;
}