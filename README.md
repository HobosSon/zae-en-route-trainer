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
  Arrivals: KJAN/KJVW hold at MHZ (`H- NW`, no EFC, "no delay expected", TCP
  at the JAN boundary; several holders stack 60/70/80 and the stack moves
  down 1,000 when the bottom aircraft is tower jurisdiction, so the pattern
  always owns 60), KGWO (VOR approach, block with D67), KMLU from any airway into MHZ except from the Monroe side, then V18
  HEDUD DINKY STUEE, whose printed strip posts STUEE: the controller writes DINKY beside it, takes the STUEE
  estimate minus 3 as the DINKY estimate and clears the aircraft to hold at
  DINKY on V18 (`H- NE V18 EFC`, EFC = DINKY estimate + 5, 7,000, `C 49 NE
  MLU`, inbound to MLU Approach, your control DINKY), and KVKS via V417/DORTS
  (approach clearance before the DORTS estimate with 6,000 until 20 SW MHZ,
  or `H- VKS SW 195 LT EFC` when holding; FSS reports landed 5 minutes after
  the VKS estimate). The DINKY pattern also covers V427 (X 45 NE MLU) and the
  VKS pattern covers V417 between 37 SW MHZ and DORTS.
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
  in space 26 (IC time based on when the aircraft enters Sector 66, RC (clearance
  request) 5 minutes before the P-time, ON FREQUENCY for aircraft already checked on,
  altitude requests (`RQ 130 1215`), KVKS weather, DEPARTURE #n for same-time requests), the
  card's miles per minute in red in space 9, and the red call reminders in
  space 27 in time order (IC, RC, RQ, PR at the center estimate, Z two minutes
  after a JAN/MLU arrival's fix, LD for KGWO/KVKS arrivals). Blank IC/PR/LD
  times are underlined and filled in during the problem; RP is added from
  the rail; clicking a reminder lines it through. Typing the actual
  departure time in space 18 of a departure strip recomputes the flight's
  estimates from the plus times and fills its IC and PR times. Shared
  remarks (FRC, ...) stay in space 26 on both views; the Remote-only data is
  kept separately so a scenario only has to supply it, never the reminders.

- **Practice Scenarios / scenario builder** (`scenarios.html`) — hand-built
  scenarios (27 static level slots baked from `assets/data/scenarios.js`;
  NR-11 and NR-13 through NR-27 are authored, the other 11 slots are still
  empty; plus Community scenarios saved in the browser) are built from the Remote's
  strips: each strip is the printed strip (every space, with the shared
  remarks such as FRC in 26) plus a Remote-data panel — initial contact time
  or ON FREQUENCY, request clearance time (defaults to P−5) and DEPARTURE #,
  altitude request, KVKS weather, and a scenario-level current ATIS letter
  (KGWO arrivals not yet on frequency check on “with <letter>”: their Remote
  strip shows `IC 0532 W/ TANGO` and `ATIS TANGO` (space 26 full times, space 27 minutes only); a KVKS arrival without the
  weather shows `REQ VKS WX` under its IC line, one that has it `HAS KVKS
  WX`). A departure flight's plus
  time may be typed in space 23 as printed on the Remote's strip; the
  Controller's strip carries it in 14a of the next strip. The Remote's space-27
  reminders and space-26 lines are derived (`ZAERemote.decorateAuthored`),
  never typed. To bake a level: Author static levels → Save to slot N →
  Export static JSON → paste into `assets/data/scenarios.js` and commit. The player
  posts the strips on the bay board (`assets/js/scenario-board.js`, shared
  with the generator) with the Controller / Remote toggle and stripmarking;
  authored scenarios have no conflict-engine answer key.

Planned modules (stubbed as "Coming soon" on the menu): Facility Reference,
Study Guides (CKT 1 Study Guide + CKT 1 Quiz).

## Planned

- KMLU departures (V18 MHZ only for now): the departure strip is posted at
  STUEE with KMLU and the P-time in 11/12, the plus time to STUEE in 14a with
  the EDC directly above it in 14, MHZ next; no split box — the assumed
  departure time goes in red directly under the P-time and the actual
  departure time in black directly under that; space 18 is for the STUEE
  progression time. Departure rules (2-minute, 22/44-knot) are written in 26
  rather than at the bottom of 15. A KMLU arrival always holds at DINKY, so
  the departure crosses 48 NE MLU (the northeast edge of the pattern
  airspace) at or below 6,000; if the arrival has not progressed DINKY when
  the clearance is issued (P-time − 5) the controller asks it for its DME
  southwest of MHZ and uses that mileage as the crossing point. Other
  departures split space 18 when the EDC is issued (assumed time in red left
  of the slash, actual in black right of it); a single-strip departure's
  assumed time is circled in red as the coordinated time, a multi-strip
  departure's last-fix estimate has its minutes circled. Recoordinate when a
  departure time or pilot estimate is 4 or more minutes off what was
  coordinated. Still to do: other KMLU departure routes.
- Plus times: the Remote's strips print, in space 23, the plus time from the
  posted fix to the next fix; the controller writes it in 14a of the
  following strip. The builder accepts 23 as printed and copies it forward.
- KVKS departures may leave on the HEZ026 radial (`KVKS HEZ ...` or `KVKS
  KHEZ`, the radial coordinated with POE LO, "cleared via the HEZ zero two
  six radial" for KHEZ). A KVKS departure under a holding KVKS arrival stays
  below the holder until its miss point (37 SW MHZ, 54 SE MLU or 25 NE HEZ)
  and reports passing it; the arrival is held until that report.
- Departures from 0M8 or KVKS never land at KMLU (Sector 66 works KMLU
  arrivals through DINKY; a departure inside the sector does not fit that
  process). A Byerley departure may land at a JAN field: its departure strip
  and its MHZ arrival strip both sit in suspense, and the MHZ strip carries
  the JAN hold and TCP.
- KVKS arrival vs. KVKS departure: the arrival has priority when its DORTS
  estimate is not later than the departure's P-time — the departure clearance
  waits for Flight Data's landed report (VKS estimate + 5, or the approach
  clearance + 5 if later), the request gets an EDC for that time and the
  assumed departure time becomes the report + 2 (the P-time stays as filed).
  Otherwise the arrival holds at VKS, the departure reports past the pattern
  (25 NE HEZ, 37 SW MHZ or 54 SE MLU) with a crossing restriction 1,000 below
  the holder, and the approach clearance follows that report — with the MLU
  Approach airspace restriction (31 SE MLU at or above 7,000) when an arrival
  from the Monroe side has not progressed DORTS by then. The course words the
  priority test on the VKS estimate in space 22 (Lab Procedures II.1.C); the
  trainer uses the DORTS estimate as instructed. Lab Procedures III-52 (the
  45 SE MLU report for an arrival on the approach) is not modelled.
- MOA preplanning: a flight filed through Columbus 3 (V11 to HLI, 8,000 and
  up) or Meridian 1 West (V245 to ZAMMA, the card's "AOB 090" check; the
  charted floor is 8,000, so the trainer flags 8,000–9,000) gets a red W
  right of its altitude (space 20 en route, 24 in suspense), lined through
  when resolved: an altitude change under the floor coordinated with the next
  sector, or for V11 traffic a reroute via V535 at the filed altitude.
- Holding altitude: the answer key holds at the lowest ARTCC altitude
  available; any higher altitude that keeps the aircraft clear of traffic is
  also acceptable (JAN, MLU and VKS patterns alike). Stacks at fixes other
  than MHZ work the same way (lowest + 1,000 each).
- KGWO departure vs. KGWO arrival (tower visual separation, approach
  airspace reports), KGWO holding stacks.
- Grading the controller's actions against the answer key.
- KVKS arrivals from the Monroe side hold at 7,000 (MLU Approach airspace
  ends 31 SE MLU); from the MHZ side at 6,000. The course's "most arrivals
  hold at 70" may mean 7,000 is the VKS floor everywhere — to be confirmed.

- Builder: departure strips can be flagged FRC (written first in space 26 on
  both views), space 10 is fixed at 66, the KVKS weather choice is `REQ KVKS
  WX` / `HAS KVKS WX`. Community scenarios live in the browser's localStorage
  only; sharing them means exporting the JSON (Author → Export) or baking
  them into `assets/data/scenarios.js`.
- Remote strips: a strip whose fix is already progressed (a time in 18) shows
  only `ON FREQUENCY` in 26 and no reminders; once every reminder in 27 is
  lined through (or there was none) a black X goes through 27-30, and an RP
  line typed in 26 brings the strip back until that RP is crossed out. An
  adjacent facility's `APREQ IAFDOF HHMM` (builder field on an en route
  flight's first strip; the generator adds it for aircraft entering IAFDOF,
  3-6 minutes before the initial contact, and keeps such aircraft rare)
  shows in 26 with `RQ mm` in 27.
- Landline names: we are `D66` to Flight Data and other ZAE sectors (D65,
  D12, D15, D67), `JAN LO` to another center's sector (MLU LO, PCU LO, POE
  LO) and `Jackson Low` to the approach controls and towers. IAFDOF is
  coordinated as an APREQ exchange ("D65, D66, APREQ" / "D65" / "AT MEI,
  N1234 descending to seven thousand" / "N1234 approved as requested,
  [initials]" / "[initials]"); an aircraft never leaves the sector IAFDOF.
- Builder: a KMLU arrival is recognised from a route ending at KMLU (the last
  strip posts STUEE with MLU next); strips in suspense get a `+` placeholder
  in 23 and, after the departure strip, in 14a too (a KMLU departure strip has one in 14a as well).
- Remote strips: a report the controller asks for is written in black in 26
  with the expected time (`RP 30 SW MHZ/1231`; a DME as `25 NW MHZ/1231`);
  an `RP …/HHMM` line adds the RP reminder with its minutes in 27.
- Stripmarking editor: the printed cells 12, 14, 17, 18, 19, 20, 24 and the
  route are written in directly in the pen colour (typed zeros are slashed);
  boxes for restrictions under 20 (a black bar appears above them), the
  coordinated altitude left of 24 and the landing time under 22; Split 18
  (assumed / actual departure time), EDC with its time (14a, or above a plus
  time), VR and APCH with a time under them, a large C in 26, an X through
  highlighted text, and Amend as a toggle at the cursor in the route. The
  Remote's recomputed fix estimates go in 17.
- To revisit later: space 20 (altitude changes and strikes need more), box
  15, the Community scenario page (rework); remove "Prototype build" from the home page; the map and
  study-guide pages; rework the difficulty tiers; the answer key (only
  control actions, coordination and phraseology are shown now); the
  stripmarking rail; remove the static level numbers once every level is
  saved.

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
