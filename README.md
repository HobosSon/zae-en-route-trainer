# Aero Center (ZAE) En Route Non-Radar Trainer

A browser-based study resource for **Air Traffic Control Academy Initial En Route
Qualification** students, built around the fictional **Aero Center (ZAE)** facility
and its **Sector 66 "Jackson Low"** non-radar environment.

> Training use only. Not for use in live air traffic operations. All facility data
> is fictional, from FAA Academy Course 50148001 training materials.

## Status

- **Menu screen** (`index.html`) — hub for the study modules (expandable).
- **Flight Strip Generator** (`strips.html`) — generates a nonradar traffic
  scenario (departures in suspense, en route, arrivals) on the VKS/MHZ/SQS bay
  board at three difficulty tiers. Every scenario is run through the conflict
  engine (`assets/js/conflicts.js`) before it is shown, so it can be worked
  without a separation error under the course rules: level en route aircraft
  are never moved (unless IAFDOF), departures/arrivals get crossing
  restrictions or an altitude within 2,000 ft of the request, successive
  departures use the 2-minute rule (never 1 minute) or the 44/22-knot rules,
  10 min / 20 DME longitudinal, JAN/MLU approach airspace, the always-active
  Columbus 3 and Meridian 1 West MOAs, and the MHZ/SQS holding pattern
  airspace (protected from 10 minutes before an arrival's estimate until it is
  tower jurisdiction or landed, with the Color Card Stock Map clear distances).
  The answer key shows the completed strip (restriction bar, red W's,
  report-passing reminders, departure instructions, void times, coordination
  circles), the restrictions, reports to solicit, coordination and phraseology.
- **Stripmarking** — a selected board strip stays enlarged (two enlarged
  strips push each other apart) and is marked up from the rail on the left:
  red or black pen; circles (both colours can stack), black strikes and
  underlines on highlighted text; a ^ in the route with an amendment under
  it; a revised estimate beside the center estimate; RLS / SYD / V< as red
  preplan reminders outside box 15 or black entries inside it; C (comm
  change) and 67 (block) entries plus free text in space 26; D-A, H-, VR,
  APCH, Z, V and free text in spaces 27-30, with the holding instructions
  typed beside the H- (Space or Enter starts a new line) and Z / V written
  over them. Picking the same mark in the same colour again removes it.
- **Scenario codes** — every board has a code such as `D3A-K7Q2MX` (tier,
  aircraft count, type, seed). Load a code (or open `strips.html#D3A-K7Q2MX`)
  to get the identical scenario later or on another machine, e.g. one person
  as the Remote and one as the Controller.
- **Remote strips** — the scenario bar switches the board between the
  Controller's strips and the Remote's (`assets/js/remote.js`, or open
  `strips.html#D3A-K7Q2MX/remote`). Remote strips add the typed scenario data
  in space 26 (IC time based on when the aircraft enters Sector 66, REQ CLNC
  5 minutes before the P-time, ON FREQUENCY for aircraft already checked on,
  altitude requests, KVKS weather, DEPARTURE #n for same-time requests), the
  card's miles per minute in red in space 9, and the red call reminders in
  space 27 in time order (IC, RQ, PR at the center estimate, Z two minutes
  after a JAN/MLU arrival's fix, LD for KGWO/KVKS arrivals). Blank IC/PR/LD
  times are underlined and filled in during the problem; RP is added from
  the rail; clicking a reminder lines it through. Typing the actual
  departure time in space 18 of a departure strip recomputes the flight's
  estimates from the plus times and fills its IC and PR times. Shared
  remarks (FRC, ...) stay in space 26 on both views; the Remote-only data is
  kept separately so a scenario only has to supply it, never the reminders.

- **Practice Scenarios / scenario builder** (`scenarios.html`) — hand-built
  scenarios (27 static level slots baked from `assets/data/scenarios.js`,
  plus Community scenarios saved in the browser) are built from the Remote's
  strips: each strip is the printed strip (every space, with the shared
  remarks such as FRC in 26) plus a Remote-data panel — initial contact time
  or ON FREQUENCY, request clearance time (defaults to P−5) and DEPARTURE #,
  altitude request, KVKS weather, and a scenario-level current ATIS letter
  (KGWO arrivals not yet on frequency check on “with <letter>”: their Remote
  strip shows `IC 32 WITH TANGO` and `ATIS TANGO`; a KVKS arrival without the
  weather shows `REQ VKS WX` under its IC line). A departure flight's plus
  time may be typed in space 23 as printed on the Remote's strip; the
  Controller's strip carries it under space 14. The Remote's space-27
  reminders and space-26 lines are derived (`ZAERemote.decorateAuthored`),
  never typed. To bake a level: Author static levels → Save to slot N →
  Export static JSON → paste into `assets/data/scenarios.js` and commit. The player
  posts the strips on the bay board (`assets/js/scenario-board.js`, shared
  with the generator) with the Controller / Remote toggle and stripmarking;
  authored scenarios have no conflict-engine answer key.

Planned modules (stubbed as "Coming soon" on the menu): Facility Reference,
Study Guides (CKT 1 Study Guide + CKT 1 Quiz).

## Planned

- KVKS and MLU (DINKY) arrivals: routes, approach/holding clearances, the
  VKS and DINKY holding pattern miss points (37 SW MHZ, 25 NE HEZ, 48 NE
  MLU, 45 NE MLU), FSS/MLU Approach coordination and remote reports.
- KGWO departure vs. KGWO arrival (tower visual separation, approach
  airspace reports), KGWO holding stacks.
- Grading the controller's actions against the answer key.
- Remote strip wording for a KVKS arrival that already has the Vicksburg
  weather (currently `HAS VKS WX`; to be confirmed).

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
  js/generator.js       Seeded flight/strip generation + scenario assembly
  js/conflicts.js       Nonradar conflict detection, resolution, answer-key marks
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
