# Aero Center (ZAE) En Route Non-Radar Trainer

A browser-based study resource for **Air Traffic Control Academy Initial En Route
Qualification** students, built around the fictional **Aero Center (ZAE)** facility
and its **Sector 66 "Jackson Low"** non-radar environment.

> Training use only. Not for use in live air traffic operations. All facility data
> is fictional, from FAA Academy Course 50148001 training materials.

## Status

- **Menu screen** (`index.html`) — hub for the study modules (expandable).
- **Flight Strip Generator** (`strips.html`) — generates randomized nonradar flight
  progress strips (proposal / departure / en route / arrival) at three difficulty
  tiers, each with a reveal-able answer key (fix postings, MEA/altitude parity,
  plus-time and posted-fix estimate math via the Quick Estimate Method).

Planned modules (stubbed as "Coming soon" on the menu): Practice Scenarios,
Facility Reference, Knowledge Quiz.

## Running locally

No build step — it's plain static HTML/CSS/JS. Serve the folder with any static
server, e.g.:

```bash
python -m http.server 5173
```

Then open <http://localhost:5173/>. (Opening files directly via `file://` also works
in most browsers.)

## Deploying to GitHub Pages

Because everything is static and `index.html` is at the repository root, this deploys
to GitHub Pages as-is: push to a repo and enable Pages on the `main` branch, root.

## Project structure

```
index.html              Menu screen
strips.html             Flight Strip Generator
assets/
  css/main.css          Shared theme
  css/strips.css        Strip page + green FDIO strip styling
  js/main.js            Zulu clock
  data/zae.js           ZAE facility model (NAVAIDs, airways, fixes,
                        mileages, MEAs, airports, sectors, equipment,
                        aircraft) — the single source of truth
  js/generator.js       Strip generation + difficulty scaling
  js/strips.js          Flight strip page controller / rendering
```

## Data sources

All ZAE data is transcribed from the Academy lesson materials:

- **LP03 — Aero Center Airspace** (boundaries, NAVAIDs, airways/radials,
  intersections, DME fixes, mileages, MEAs, airports, approach controls)
- **LP05 — Flight Progress Strips** (nonradar strip format / Appendix B space map,
  equipment suffixes, fix posting areas, Quick Estimate Method)
- **Handout 00 — ZAE Non-Radar Map** (Sector 66 Jackson Low geography)

To extend the facility (more airways, high-altitude sectors, other sectors), edit
`assets/data/zae.js`; the generator reads everything from there.
