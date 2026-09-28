# CloudPulse

**Visualizing the pulse of the cloud.**

An interactive simulation exploring cloud infrastructure, distributed systems, and security — built by [Fatimaezzahra Hrimech](https://github.com/fatimaezzahrahr7-design) as a hands-on way to understand how cloud systems work, respond to incidents, and recover.

🔗 **Live demo:**    https://fatimaezzahrahr7-design.github.io/cloudpulse/

---

## What this is

CloudPulse simulates how traffic moves through distributed cloud infrastructure, and how systems detect, respond to, and recover from:

- normal traffic
- traffic spikes
- suspicious activity
- outages

It includes:

- **Command Center** — live simulated metrics (requests/sec, latency, threats, availability)
- **Global Traffic** — an animated network view of traffic between 8 regions, with click-to-inspect region details
- **Event Stream** — a live feed of simulated system/security events
- **Simulation Controls** — start, pause, reset, and trigger specific incidents on demand
- **Cloud Architecture** — a clickable diagram of a typical request path (User → Edge/CDN → API → Compute → Database → Storage), explaining what each layer does, why it exists, and what happens if it fails
- **Build Your Cloud** — pick compute, database, storage, and security options and see a generated architecture with simulated scalability/security/complexity/latency indicators

**All data in this project is synthetic.** CloudPulse does not connect to any real infrastructure, company systems, or live data of any kind — it's an educational simulation, not a monitoring tool.

## Why I built it

I'm a student exploring cloud computing, cybersecurity, and distributed systems. Reading about these concepts only goes so far — building a working simulation of them forced me to actually think through how requests flow, where things can fail, and where security controls belong. CloudPulse is that exploration made visible.

## Tech stack

Plain HTML, CSS, and JavaScript (ES modules) — no frameworks, no build step. Kept intentionally simple so the code stays easy to read and extend.

## Project structure

- index.html
- css/style.css
- js/app.js — wires everything together
- js/data.js — generates simulated metrics/events
- js/simulation.js — the start/pause/reset/incident engine
- js/map.js — global traffic visualization
- js/architecture.js — clickable architecture diagram
- js/builder.js — "Build Your Cloud" section
- assets/
- README.md

## Running locally

This project uses ES modules, which most browsers block from running over a plain `file://` path. Serve it with a local server instead — e.g. the Live Server extension in VS Code, then open `index.html` through it.

## What I'm exploring

Cloud architecture · Cybersecurity · Distributed systems · Serverless computing · Infrastructure monitoring · Resilience · Secure digital infrastructure

## Built by

**Fatimaezzahra Hrimech**
Moroccan student exploring cloud computing, cybersecurity, and secure digital infrastructure.

[GitHub](https://github.com/fatimaezzahrahr7-design) · [LinkedIn](https://www.linkedin.com/in/fatimaezzahra-hrimech-7b2518422/)

---

*Synthetic data. Educational simulation.*