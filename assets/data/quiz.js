/*
 * CKT 1 (Block 1) question bank for the ZAE Aero Center En Route Non-Radar trainer.
 * All items are original questions grounded in the Academy course study guides
 * (Course 50148001, V.2025-02) and FAA JO 7110.65. Exposed as window.QUIZ_BANK.
 *
 * Item shape:
 *   { id, block, cat, q, choices: [..4..], answer: <index>, explain, ref }
 * block is the course block the item belongs to (1 = Block I / CKT 1).
 * cat is one of the keys in QUIZ_CATS.
 */
(function (root) {
  "use strict";

  const QUIZ_CATS = {
    vert: "Vertical Separation",
    long: "Longitudinal Separation",
    lat: "Lateral & Holding",
    alt: "Altimeter & Altitudes",
    phrase: "Phraseology & Interphone",
    strip: "Strip Marking",
    proc: "Procedures & Control",
    fwd: "Forwarding & Coordination",
    clear: "Clearances & Routes",
    dep: "Departures & Initial Separation",
    arr: "Arrivals & Approaches"
  };

  const QUIZ_BANK = [
    // ---------- Vertical separation ----------
    {
      id: "vert1", block: 1, cat: "vert",
      q: "What is the minimum vertical separation between IFR aircraft at or below FL410?",
      choices: ["500 feet", "1,000 feet", "2,000 feet", "3,000 feet"],
      answer: 1,
      explain: "Separate IFR aircraft by assigning different altitudes with a minimum of 1,000 feet up to and including FL410.",
      ref: "LP16 Vertical Separation / 7110.65 4-5-1"
    },
    {
      id: "vert2", block: 1, cat: "vert",
      q: "What is the minimum vertical separation between IFR aircraft above FL410?",
      choices: ["1,000 feet", "1,500 feet", "2,000 feet", "2,500 feet"],
      answer: 2,
      explain: "Above FL410 the vertical minimum increases to 2,000 feet.",
      ref: "LP16 Vertical Separation / 7110.65 4-5-1"
    },
    {
      id: "vert3", block: 1, cat: "vert",
      q: "Between a non-RVSM aircraft and all other aircraft at or above FL290, the vertical minimum is:",
      choices: ["1,000 feet", "2,000 feet", "500 feet", "No change — still 1,000 feet"],
      answer: 1,
      explain: "RVSM permits 1,000 ft between FL290 and FL410, but a non-RVSM aircraft requires 2,000 feet from all other aircraft at or above FL290.",
      ref: "LP16 Vertical Separation / 7110.65 4-5-1"
    },
    {
      id: "vert4", block: 1, cat: "vert",
      q: "You may assign an altitude to an aircraft after the aircraft previously at that altitude:",
      choices: [
        "Has been cleared to a new altitude and is observed leaving (valid Mode C) or reports leaving it",
        "Has been handed off to the next sector",
        "Is within 5 miles of the boundary",
        "Has acknowledged the frequency change"
      ],
      answer: 0,
      explain: "Assign the altitude once the previous aircraft has been issued a climb/descent clearance AND is observed leaving (valid Mode C) or reports leaving that altitude.",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7"
    },
    {
      id: "vert5", block: 1, cat: "vert",
      q: "When an aircraft is climbing/descending at pilot's discretion, you may assign its altitude to another aircraft only after the first aircraft:",
      choices: [
        "Starts its climb or descent",
        "Reports at or passing through another altitude separated by the appropriate minima",
        "Acknowledges the pilot's discretion clearance",
        "Is 10 miles from the fix"
      ],
      answer: 1,
      explain: "With pilot's discretion (also severe turbulence, aerial refueling, cruise), the pilot may return toward a vacated altitude until they have reported at/passing another altitude separated by minima. Only then is the altitude free.",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7, 6-6-2"
    },
    {
      id: "vert6", block: 1, cat: "vert",
      q: "Separation from active Special Use Airspace / ATCAA at FL290 and below requires at least:",
      choices: ["500 feet above/below the airspace limits", "1,000 feet above/below", "1,500 feet above/below", "2,000 feet above/below"],
      answer: 0,
      explain: "At FL290 and below, keep nonparticipating aircraft at least 500 feet above/below the airspace limits (1,000 feet above FL290). Altitudes are assigned in 1,000-foot increments.",
      ref: "LP16 Vertical Separation / 7110.65 9-3-2"
    },
    {
      id: "vert7", block: 1, cat: "vert",
      q: "After a pilot reports leaving an altitude under a cruise or pilot's-discretion clearance, the pilot:",
      choices: [
        "May return to that altitude if traffic permits",
        "May not return to the vacated altitude",
        "Must climb to the next even altitude",
        "Must request a new clearance to descend further"
      ],
      answer: 1,
      explain: "Once the pilot reports leaving an altitude, they cannot return to it. This is what lets you free the altitude for other traffic.",
      ref: "LP16 Vertical Separation / Pilot-Controller Glossary"
    },

    // ---------- Longitudinal separation ----------
    {
      id: "long1", block: 1, cat: "long",
      q: "On same, converging, or crossing courses, the standard longitudinal minimum between DME-equipped aircraft (at the same altitude) is:",
      choices: ["10 miles", "15 miles", "20 miles", "30 miles"],
      answer: 2,
      explain: "Use 20 miles between DME-equipped aircraft (or DME and ATD-equipped, with conditions). Mileage-based minima require both aircraft to provide DME/position reports.",
      ref: "LP17 Longitudinal Separation / 7110.65 6-4-x"
    },
    {
      id: "long2", block: 1, cat: "long",
      q: "On same, converging, or crossing courses, the longitudinal minimum between aircraft NOT using DME/ATD mileage is:",
      choices: ["5 minutes", "8 minutes", "10 minutes", "15 minutes"],
      answer: 2,
      explain: "Use 10 minutes between all other (non-mileage) aircraft. Coordinate with the next facility/sector if you have less than 10 minutes.",
      ref: "LP17 Longitudinal Separation / 7110.65 6-4-x"
    },
    {
      id: "long3", block: 1, cat: "long",
      q: "When the lead aircraft is at least 44 knots faster, the minimum between non-DME aircraft on the same course may be reduced to:",
      choices: ["3 minutes", "5 minutes", "8 minutes", "It cannot be reduced"],
      answer: 0,
      explain: "With the lead aircraft at least 44 knots faster, non-DME aircraft may use 3 minutes; DME/ATD aircraft may use 5 miles.",
      ref: "LP17 Longitudinal Separation / 7110.65 6-4-x"
    },
    {
      id: "long4", block: 1, cat: "long",
      q: "To apply mileage-based longitudinal separation you must:",
      choices: [
        "Solicit a DME (or VORTAC/fix) report from the aircraft",
        "Wait for the next radar update",
        "Assume standard 120-knot groundspeed",
        "Only use it above FL180"
      ],
      answer: 0,
      explain: "You must solicit a DME report or VORTAC/fix report to establish the mileage. Using \"Say DME\" ensures all aircraft report the same slant-range reference.",
      ref: "LP17 Longitudinal Separation / 7110.65 6-4-x"
    },
    {
      id: "long5", block: 1, cat: "long",
      q: "Using the Quick Estimate Method, an aircraft's miles-per-minute (MPM) is found by:",
      choices: [
        "Dividing the first two digits of its speed by 6",
        "Dividing its speed by 10",
        "Multiplying its speed by 6",
        "Dividing its speed by 60"
      ],
      answer: 0,
      explain: "MPM = first two digits of speed ÷ 6 (e.g. 300 kt → 30 ÷ 6 = 5 MPM). Then Distance = MPM × time, and Time over a fix = distance ÷ MPM.",
      ref: "H00 Quick Reference Guide"
    },

    // ---------- Lateral & holding ----------
    {
      id: "lat1", block: 1, cat: "lat",
      q: "Along an established airway/route (FL600 and below), protected airspace extends how far each side of centerline out to 51 miles from the NAVAID?",
      choices: ["4 miles", "8 miles", "10 miles", "15 miles"],
      answer: 0,
      explain: "4 miles each side of the route to 51 miles from the NAVAID, then widening on a 4.5-degree angle to 10 miles each side at 130 miles from the NAVAID.",
      ref: "LP18 Lateral Separation / 7110.65 6-6-x"
    },
    {
      id: "lat2", block: 1, cat: "lat",
      q: "In a STANDARD holding pattern, turns are made in which direction?",
      choices: ["Left turns", "Right turns", "Either, controller's choice", "Alternating turns"],
      answer: 1,
      explain: "Standard holding pattern = right turns. A nonstandard pattern uses left turns and must be stated in the clearance (\"LEFT TURNS\").",
      ref: "LP14 Holding Procedures"
    },
    {
      id: "lat3", block: 1, cat: "lat",
      q: "\"Expect Further Clearance (EFC)\" time tells the pilot:",
      choices: [
        "The time to leave the holding fix if two-way radio communication is lost",
        "The time the aircraft entered holding",
        "The estimated approach clearance time only",
        "The current altimeter time of observation"
      ],
      answer: 0,
      explain: "EFC is the time a pilot can expect to receive further clearance (and the time to depart the fix in the event of lost communications).",
      ref: "LP14 Holding Procedures / 7110.65 4-6-x"
    },
    {
      id: "lat4", block: 1, cat: "lat",
      q: "When a delay is anticipated, holding instructions should be issued at least how far in advance of the aircraft's estimate to the clearance limit?",
      choices: ["1 minute", "3 minutes", "5 minutes", "10 minutes"],
      answer: 2,
      explain: "Issue holding instructions at least 5 minutes before the aircraft's estimate to reach the clearance limit, giving the pilot time to slow down.",
      ref: "LP14 Holding Procedures / 7110.65 4-6-1"
    },
    {
      id: "lat5", block: 1, cat: "lat",
      q: "Above 14,000 feet MSL, the standard inbound holding leg time is:",
      choices: ["1 minute", "1 1/2 minutes", "2 minutes", "3 minutes"],
      answer: 1,
      explain: "The inbound leg is 1 minute at or below 14,000 ft MSL and 1 1/2 minutes above 14,000 ft MSL.",
      ref: "LP14 Holding Procedures"
    },
    {
      id: "lat6", block: 1, cat: "lat",
      q: "At Aero Center, the SQS holding pattern is notable because it:",
      choices: [
        "Overlaps Sector 67 airspace and requires coordination",
        "Is the only left-turn pattern in the facility",
        "May not be used below 10,000 feet",
        "Requires no EFC"
      ],
      answer: 0,
      explain: "The SQS holding pattern overlaps Sector 67 airspace on the missed approach and requires coordination; crossings within 10 miles NE of SQS must include \"established on\" the airway.",
      ref: "LP18 Lateral Separation"
    },
    {
      id: "lat7", block: 1, cat: "lat",
      q: "How much airspace is protected for a holding aircraft is determined mainly by its altitude, speed, and:",
      choices: [
        "Distance of the holding fix from the NAVAID",
        "Time of day",
        "Aircraft color",
        "Number of aircraft in the sector"
      ],
      answer: 0,
      explain: "Protected holding airspace grows with altitude, speed, and the distance of the holding fix from the NAVAID. Aero Center uses holding pattern templates to depict it.",
      ref: "LP14 Holding Procedures"
    },

    // ---------- Altimeter & altitudes ----------
    {
      id: "alt1", block: 1, cat: "alt",
      q: "You must issue the current altimeter setting to all en route aircraft operating below FL180:",
      choices: ["At least one time", "Every 5 minutes", "Only on request", "Only during descent"],
      answer: 0,
      explain: "Issue the current altimeter setting at least once to all en route aircraft operating below FL180, and to aircraft cleared to descend below the lowest usable flight level.",
      ref: "LP13 Altimeter Setting"
    },
    {
      id: "alt2", block: 1, cat: "alt",
      q: "With an altimeter setting of 29.92 or higher, the lowest usable flight level is:",
      choices: ["FL180", "FL190", "FL200", "FL170"],
      answer: 0,
      explain: "29.92 or higher → FL180. From 29.91 to 28.92 → FL190. From 28.91 to 27.92 → FL200. Lower pressure raises the lowest usable FL.",
      ref: "LP13 Altimeter Setting"
    },
    {
      id: "alt3", block: 1, cat: "alt",
      q: "The standard altimeter setting used at and above the lowest usable flight level is:",
      choices: ["29.92", "30.00", "Field elevation setting", "The nearest station setting"],
      answer: 0,
      explain: "At or above the lowest usable flight level, aircraft set the standard altimeter setting of 29.92.",
      ref: "LP13 Altimeter Setting"
    },
    {
      id: "alt4", block: 1, cat: "alt",
      q: "When issuing an altimeter setting that is more than one hour old, you must:",
      choices: [
        "State that it is more than one hour old",
        "Round it to the nearest tenth",
        "Withhold it entirely",
        "Convert it to hectopascals"
      ],
      answer: 0,
      explain: "Identify the source and state if the report is more than one hour old, e.g. \"The Vicksburg altimeter two niner eight niner, more than one hour old.\"",
      ref: "LP13 Altimeter Setting"
    },
    {
      id: "alt5", block: 1, cat: "alt",
      q: "To ask a pilot known to be operating at or above the lowest usable flight level for their altitude, use:",
      choices: ["\"SAY ALTITUDE\"", "\"SAY FLIGHT LEVEL\"", "\"SAY ALTITUDE OR FLIGHT LEVEL\"", "\"REPORT ALTIMETER\""],
      answer: 1,
      explain: "Use \"SAY FLIGHT LEVEL\" at/above the lowest usable FL, \"SAY ALTITUDE\" below it, and \"SAY ALTITUDE OR FLIGHT LEVEL\" if position relative to the lowest usable FL is unknown.",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7"
    },

    // ---------- Phraseology & interphone ----------
    {
      id: "phr1", block: 1, cat: "phrase",
      q: "Per the interphone format, ALL interphone calls must be ended with:",
      choices: ["Your operating initials", "The word \"out\"", "The time in Zulu", "A frequency readback"],
      answer: 0,
      explain: "End all interphone calls with your operating initials. When initiating: say who you're calling, who you are, why. When answering: where to look, who/what to look for, what's happening.",
      ref: "H00 Quick Reference Guide"
    },
    {
      id: "phr2", block: 1, cat: "phrase",
      q: "Which of these is spoken in group form?",
      choices: [
        "Airline call signs (e.g. AAL552 = \"American Five Fifty Two\")",
        "Altimeter settings",
        "Radio frequencies",
        "Runway headings"
      ],
      answer: 0,
      explain: "Group form is allowed for airline call signs, aircraft types (\"C One Thirty slant alpha\"), and airways (\"Victor Four Seventeen\").",
      ref: "H00 Quick Reference Guide"
    },
    {
      id: "phr3", block: 1, cat: "phrase",
      q: "The arrival clearance format \"FRAHE\" stands for Fix, Route, Altitude, Holding, and:",
      choices: ["Everything else (altimeter, frequency, EFC, etc.)", "Emergency", "Estimate", "Equipment"],
      answer: 0,
      explain: "FRAHE = Fix (cleared to), Route (via), Altitude (cross/maintain), Holding (instructions or \"as published\"), Everything else (altimeter, frequency, EFC, etc.).",
      ref: "H00 Quick Reference Guide"
    },
    {
      id: "phr4", block: 1, cat: "phrase",
      q: "The standard phraseology to assign a climb is:",
      choices: [
        "\"CLIMB AND MAINTAIN (altitude)\"",
        "\"YOU ARE CLEARED TO CLIMB\"",
        "\"INCREASE ALTITUDE TO (altitude)\"",
        "\"CLIMB WHEN ABLE\""
      ],
      answer: 0,
      explain: "Use \"CLIMB AND MAINTAIN (altitude)\" / \"DESCEND AND MAINTAIN (altitude)\" / \"MAINTAIN/CRUISE (altitude).\"",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7"
    },
    {
      id: "phr5", block: 1, cat: "phrase",
      q: "A clearance void time is issued to a departure as:",
      choices: [
        "\"CLEARANCE VOID IF NOT OFF BY (time)...\"",
        "\"CLEARED FOR IMMEDIATE DEPARTURE\"",
        "\"DEPART AT PILOT'S DISCRETION\"",
        "\"HOLD FOR RELEASE\""
      ],
      answer: 0,
      explain: "\"CLEARANCE VOID IF NOT OFF BY (clearance void time); IF NOT OFF BY (time), ADVISE AERO CENTER NOT LATER THAN (time) OF INTENTIONS.\"",
      ref: "H00 Quick Reference Guide / LP12 Departure Procedures"
    },

    // ---------- Strip marking (Appendix B) ----------
    {
      id: "str1", block: 1, cat: "strip",
      q: "On the flight progress strip, space 3 contains:",
      choices: ["Aircraft Identification (AID)", "Filed true airspeed", "Strip number", "Previous fix"],
      answer: 0,
      explain: "Space 3 = Aircraft Identification (AID). Space 4 = number/heavy/type/equipment suffix, space 5 = filed true airspeed.",
      ref: "LP05 Flight Progress Strips, Appendix B / 7110.65 2-3-2"
    },
    {
      id: "str2", block: 1, cat: "strip",
      q: "Space 5 on the flight progress strip is:",
      choices: ["Filed true airspeed", "Estimated ground speed", "Computer ID number", "Sector number"],
      answer: 0,
      explain: "Space 5 = filed true airspeed. Space 8 = estimated ground speed, space 6 = sector number, space 7 = computer ID (CID).",
      ref: "LP05 Flight Progress Strips, Appendix B / 7110.65 2-3-2"
    },
    {
      id: "str3", block: 1, cat: "strip",
      q: "Space 15 (the large center time) represents:",
      choices: [
        "Center-estimated time over the fix (or clearance info for departures)",
        "The pilot-estimated time over the fix",
        "The actual time over the previous fix",
        "The strip number"
      ],
      answer: 0,
      explain: "Space 15 = center-estimated time over fix in hours and minutes (or clearance information for departing aircraft). Space 17 is the pilot-estimated time over the fix.",
      ref: "LP05 Flight Progress Strips, Appendix B / 7110.65 2-3-2"
    },
    {
      id: "str4", block: 1, cat: "strip",
      q: "Space 16 on the strip is used for:",
      choices: [
        "Arrows showing departing (up) or arriving (down)",
        "The requested altitude",
        "The route of flight",
        "Remarks"
      ],
      answer: 0,
      explain: "Space 16 holds the arrow indicating whether the aircraft is departing (up arrow) or arriving (down arrow).",
      ref: "LP05 Flight Progress Strips, Appendix B / 7110.65 2-3-2"
    },
    {
      id: "str5", block: 1, cat: "strip",
      q: "Space 14 records:",
      choices: [
        "Actual time over the previous fix (or actual departure time on the first posting)",
        "The filed true airspeed",
        "The requested altitude",
        "The verification symbol"
      ],
      answer: 0,
      explain: "Space 14 = actual time over the previous fix, or the actual departure time entered on the first fix posting after departure. Space 14a is the plus time in minutes to the posted fix.",
      ref: "LP05 Flight Progress Strips, Appendix B / 7110.65 2-3-2"
    },

    // ---------- Procedures & control ----------
    {
      id: "proc1", block: 1, cat: "proc",
      q: "Most altitude changes in nonradar scenarios at Aero Center will be:",
      choices: ["Pilot's discretion", "Hard altitude assignments", "Cruise clearances only", "Block altitudes"],
      answer: 0,
      explain: "The course notes that most altitude changes in nonradar scenarios at Aero Center will be pilot's discretion, which requires you to protect the additional altitudes.",
      ref: "LP16 Vertical Separation"
    },
    {
      id: "proc2", block: 1, cat: "proc",
      q: "Which is a disadvantage of a pilot's-discretion climb/descent for the controller?",
      choices: [
        "The controller must protect more altitudes, complicating sequencing",
        "It always burns more fuel",
        "The pilot cannot level off",
        "It requires radar"
      ],
      answer: 0,
      explain: "Pilot's discretion lets the pilot choose when to move and to level off en route, but the controller must protect more altitudes, which can interfere with sequencing and separation.",
      ref: "LP16 Vertical Separation"
    },
    {
      id: "proc3", block: 1, cat: "proc",
      q: "When inbound information is relayed to an approach control, the format includes call sign, type, equipment suffix, estimate over the fix, altitude, and:",
      choices: [
        "Destination if other than the primary airports (JAN/MLU)",
        "The pilot's name",
        "The filed fuel on board",
        "The tail number of the next arrival"
      ],
      answer: 0,
      explain: "To approach control: call sign, type, equipment suffix, estimate over fix, altitude (with restrictions), destination if other than JAN/MLU, and TCP (transfer of control point).",
      ref: "H00 Quick Reference Guide"
    },
    {
      id: "proc4", block: 1, cat: "proc",
      q: "\"Cross one seven miles northwest of Jackson VORTAC, at and maintain six thousand\" is an example of:",
      choices: [
        "A crossing restriction with an altitude at a specified fix",
        "A cruise clearance",
        "A holding clearance",
        "A visual approach clearance"
      ],
      answer: 0,
      explain: "This is a crossing restriction: a specified altitude over a specified point. ATC may issue a specified altitude over a fix for the portion of a descent where pilot's discretion is permissible.",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7"
    },
    {
      id: "proc5", block: 1, cat: "proc",
      q: "Separation of aircraft and issuing safety alerts is described in the course as:",
      choices: [
        "Your highest priority as an air traffic controller",
        "A secondary duty after sequencing",
        "Required only in radar environments",
        "The pilot's responsibility"
      ],
      answer: 0,
      explain: "Separation of aircraft and issuing safety alerts is your highest priority as an air traffic controller.",
      ref: "LP16 Vertical Separation"
    },

    // ---------- Radio & interphone (CKT 1 review) ----------
    {
      id: "phr6", block: 1, cat: "phrase",
      q: "Radios and interphones must be:",
      choices: ["Monitored continuously", "Monitored every 15 minutes", "Monitored only when traffic is present", "Turned down between calls"],
      answer: 0,
      explain: "Monitor interphones and assigned radio frequencies continuously.",
      ref: "LP04 Radio & Interphone / 7110.65 2-4-1"
    },
    {
      id: "phr7", block: 1, cat: "phrase",
      q: "To establish initial radio contact or check readability, the transmission includes the aircraft call sign, your facility, and:",
      choices: ["\"HOW DO YOU READ\"", "\"GO AHEAD\"", "\"RADIO CHECK COMPLETE\"", "\"STAND BY\""],
      answer: 0,
      explain: "A readability check is: \"(call sign), (facility), HOW DO YOU READ.\" At Aero Center the facility is \"AERO CENTER.\"",
      ref: "LP04 Radio & Interphone / CKT 1 review"
    },
    {
      id: "phr8", block: 1, cat: "phrase",
      q: "The two priority words used to interrupt an interphone conversation are:",
      choices: ["\"EMERGENCY\" and \"CONTROL\"", "\"BREAK\" and \"OVER\"", "\"URGENT\" and \"PRIORITY\"", "\"STAND BY\" and \"GO AHEAD\""],
      answer: 0,
      explain: "Interrupt an interphone call only for an emergency or a control action, e.g. \"BREAK FOR EMERGENCY\" or \"BREAK FOR CONTROL.\"",
      ref: "LP04 Radio & Interphone / 7110.65 2-4-x"
    },
    {
      id: "phr9", block: 1, cat: "phrase",
      q: "Controllers should transmit only those messages which are:",
      choices: ["Necessary for air traffic control", "Requested by the pilot", "Shorter than ten seconds", "Approved by the supervisor"],
      answer: 0,
      explain: "Transmit only messages necessary for air traffic control; keep frequencies clear of non-essential traffic.",
      ref: "LP04 Radio & Interphone / 7110.65 2-4-2"
    },
    {
      id: "phr10", block: 1, cat: "phrase",
      q: "Which is the correct order of message priority, highest first?",
      choices: [
        "Emergency; clearance and control; movement and control; VFR movement",
        "Clearance and control; emergency; VFR movement; movement and control",
        "Movement and control; emergency; clearance and control; VFR movement",
        "VFR movement; movement and control; clearance and control; emergency"
      ],
      answer: 0,
      explain: "Priority order: (1) emergency messages, (2) clearances and control instructions, (3) movement and control messages, (4) VFR movement messages.",
      ref: "LP04 Radio & Interphone / 7110.65 2-4-x"
    },
    {
      id: "phr11", block: 1, cat: "phrase",
      q: "When relaying a message from another source, you must state:",
      choices: ["The source of the message", "The time you received it", "Your operating initials", "The aircraft's altitude"],
      answer: 0,
      explain: "Give the source of any message you relay so the recipient knows where it originated.",
      ref: "LP04 Radio & Interphone / CKT 1 review"
    },
    {
      id: "phr12", block: 1, cat: "phrase",
      q: "When relaying an ATC clearance through a non-ATC facility (e.g. FSS or base ops), the clearance is prefaced with:",
      choices: ["\"ATC CLEARS\"", "\"CLEARED VIA\"", "\"AERO CENTER ADVISES\"", "\"RELAY FROM CENTER\""],
      answer: 0,
      explain: "Clearances relayed through a non-ATC facility begin with \"ATC CLEARS\" so the pilot knows the clearance originates with ATC.",
      ref: "LP06 Recording Clearances / 7110.65 4-2-x"
    },

    // ---------- General control & priorities ----------
    {
      id: "proc6", block: 1, cat: "proc",
      q: "Which operations receive the highest priority?",
      choices: ["Aircraft in distress", "Scheduled air carriers", "Military training flights", "Flight check aircraft"],
      answer: 0,
      explain: "After separating aircraft and issuing safety alerts, give first priority to aircraft in distress.",
      ref: "LP09 General Control / 7110.65 2-1-4"
    },
    {
      id: "proc7", block: 1, cat: "proc",
      q: "Search and rescue (SAR) aircraft receive maximum assistance when:",
      choices: ["They are conducting a SAR mission", "They are returning to base", "They request it on initial contact", "Weather is below minimums"],
      answer: 0,
      explain: "Provide maximum assistance to SAR aircraft while they are actually engaged in a search and rescue mission.",
      ref: "LP09 General Control / 7110.65 2-1-4"
    },
    {
      id: "proc8", block: 1, cat: "proc",
      q: "Air ambulance flights receive priority handling when:",
      choices: ["They use the MEDEVAC call sign or identifier", "They file an IFR flight plan", "They are above FL180", "The pilot declares minimum fuel"],
      answer: 0,
      explain: "Provide priority handling to air ambulance flights that identify with the MEDEVAC call sign / aircraft ID.",
      ref: "LP09 General Control / 7110.65 2-1-4"
    },
    {
      id: "proc9", block: 1, cat: "proc",
      q: "Use the word \"IMMEDIATELY\" only when:",
      choices: [
        "Expeditious compliance is required to avoid an imminent situation",
        "The pilot has not acknowledged a prior transmission",
        "Issuing any altitude change",
        "Traffic is within 10 miles"
      ],
      answer: 0,
      explain: "\"IMMEDIATELY\" is reserved for situations where expeditious compliance is required to avoid an imminent situation.",
      ref: "LP09 General Control / 7110.65 2-1-x"
    },
    {
      id: "proc10", block: 1, cat: "proc",
      q: "Information about NAS problems or conditions adversely affecting flight should be reported:",
      choices: ["As soon as possible", "At the end of the shift", "Only if a pilot asks", "Within 24 hours"],
      answer: 0,
      explain: "Report NAS issues or conditions that adversely affect flight as soon as possible.",
      ref: "LP09 General Control / CKT 1 review"
    },
    {
      id: "proc11", block: 1, cat: "proc",
      q: "Flight check (flight inspection) aircraft are given priority:",
      choices: ["When required", "Always, over all other traffic", "Only in IMC", "Never"],
      answer: 0,
      explain: "Give flight check aircraft priority handling when required to accomplish the inspection.",
      ref: "LP09 General Control / 7110.65 2-1-4"
    },
    {
      id: "proc12", block: 1, cat: "proc",
      q: "A formation flight is controlled as a single aircraft until:",
      choices: ["The aircraft establish separation from each other", "They cross the sector boundary", "The lead aircraft descends", "They reach the destination"],
      answer: 0,
      explain: "Treat a formation as one flight; individual control begins only once the aircraft have established separation between themselves.",
      ref: "LP09 General Control / 7110.65 2-1-13"
    },
    {
      id: "proc13", block: 1, cat: "proc",
      q: "An aircraft in uncontrolled airspace makes an airfile request. You process it when:",
      choices: [
        "The aircraft is in your jurisdiction, unless otherwise coordinated",
        "The aircraft is above FL180",
        "FSS has already approved it",
        "The pilot has a filed VFR plan"
      ],
      answer: 0,
      explain: "Process an airfile from an aircraft within your area of jurisdiction unless coordination directs otherwise.",
      ref: "LP09 General Control / CKT 1 review"
    },
    {
      id: "proc14", block: 1, cat: "proc",
      q: "Class G airspace is best described as:",
      choices: ["Uncontrolled", "Controlled", "Positive control", "Terminal"],
      answer: 0,
      explain: "Class G is uncontrolled airspace. Classes A through E are controlled airspace (Class C, for example, is controlled).",
      ref: "M12 Airspace / CKT 1 review"
    },
    {
      id: "proc15", block: 1, cat: "proc",
      q: "Class C airspace is best described as:",
      choices: ["Controlled", "Uncontrolled", "Special use", "Restricted"],
      answer: 0,
      explain: "Class C is controlled airspace surrounding busier airports with an operating control tower and radar approach control.",
      ref: "M12 Airspace / CKT 1 review"
    },

    // ---------- Strip marking (CKT 1 review) ----------
    {
      id: "str6", block: 1, cat: "strip",
      q: "An \"X\" is used on the strip to:",
      choices: ["Delete unwanted altitude information in space 20 or 24", "Mark a missed estimate", "Show a frequency change", "Indicate a holding fix"],
      answer: 0,
      explain: "Draw an X through unwanted altitude information in space 20 or 24 to delete it.",
      ref: "M31 Stripmarking / 7110.65 2-3-x"
    },
    {
      id: "str7", block: 1, cat: "strip",
      q: "In space 28, the symbol for a clearance to depart from a fix is:",
      choices: ["D", "F", "H", "A"],
      answer: 0,
      explain: "Space 28 clearance symbols: D = depart (from a fix); F = cleared to a fix.",
      ref: "M31 Stripmarking / 7110.65 2-3-x"
    },
    {
      id: "str8", block: 1, cat: "strip",
      q: "In space 28, the symbol indicating the aircraft is cleared to a fix is:",
      choices: ["F", "D", "X", "W"],
      answer: 0,
      explain: "F in space 28 = cleared to a fix. D = depart from a fix.",
      ref: "M31 Stripmarking / 7110.65 2-3-x"
    },
    {
      id: "str9", block: 1, cat: "strip",
      q: "An altitude circled in black on the strip means:",
      choices: [
        "The aircraft reported on frequency at other than its assigned altitude",
        "The altitude is inappropriate for direction of flight",
        "The altitude has been deleted",
        "The aircraft is in holding"
      ],
      answer: 0,
      explain: "A circled altitude flags that the aircraft checked on frequency at an altitude other than the one assigned.",
      ref: "M31 Stripmarking / CKT 1 review"
    },
    {
      id: "str10", block: 1, cat: "strip",
      q: "An altitude underlined in red on the strip means:",
      choices: [
        "The altitude is inappropriate for direction of flight (IAFDOF)",
        "The altitude has been deleted",
        "The aircraft reported at the wrong altitude",
        "The altitude is a block altitude"
      ],
      answer: 0,
      explain: "A red underline marks an altitude inappropriate for direction of flight (IAFDOF).",
      ref: "M31 Stripmarking / CKT 1 review"
    },
    {
      id: "str11", block: 1, cat: "strip",
      q: "A red \"W\" on the strip indicates:",
      choices: ["An MEA or MOCA violation", "A weather deviation", "A wrong-way altitude", "A wake turbulence advisory"],
      answer: 0,
      explain: "Red W flags that the assigned altitude violates the MEA or MOCA.",
      ref: "M31 Stripmarking / CKT 1 review"
    },
    {
      id: "str12", block: 1, cat: "strip",
      q: "Red directional arrows may be used in space 23 to:",
      choices: ["Help indicate direction of flight", "Show a climb or descent", "Mark a frequency change", "Note a holding pattern"],
      answer: 0,
      explain: "Space 23 may carry red directional arrows as a direction-of-flight aid.",
      ref: "M31 Stripmarking / CKT 1 review"
    },
    {
      id: "str13", block: 1, cat: "strip",
      q: "Strips that are no longer needed for control purposes should be:",
      choices: ["Removed from the sector", "Filed in space 30", "Left on the board for reference", "Marked with an X"],
      answer: 0,
      explain: "Remove strips from the sector once they are no longer required for control.",
      ref: "LP10 Board Management / CKT 1 review"
    },
    {
      id: "str14", block: 1, cat: "strip",
      q: "The first item in an ATC clearance is:",
      choices: ["Aircraft identification (call sign)", "Clearance limit", "Route of flight", "Altitude"],
      answer: 0,
      explain: "Clearance items are issued in order: aircraft identification, clearance limit, route, altitude, then other instructions.",
      ref: "LP06 Recording Clearances / 7110.65 4-2-x"
    },

    // ---------- Forwarding & coordination ----------
    {
      id: "fwd1", block: 1, cat: "fwd",
      q: "Flight plan information is forwarded to military base ops, FSS, or:",
      choices: ["The appropriate ATC facility", "The airline dispatcher", "The National Weather Service", "The pilot's home base"],
      answer: 0,
      explain: "Forward flight plan information to military base operations, flight service, or the ATC facility concerned.",
      ref: "LP07 Forwarding Flight Plan & Control Info"
    },
    {
      id: "fwd2", block: 1, cat: "fwd",
      q: "The remarks section of a strip must NOT be used in lieu of voice coordination to pass:",
      choices: ["Control information", "Aircraft type", "Equipment suffix", "Filed airspeed"],
      answer: 0,
      explain: "Control information must be coordinated by voice; do not rely on remarks to pass it.",
      ref: "LP07 Forwarding Flight Plan & Control Info"
    },
    {
      id: "fwd3", block: 1, cat: "fwd",
      q: "Inbound coordination to a VFR tower includes call sign, aircraft type, airport estimate, and:",
      choices: ["Type of approach", "Equipment suffix", "Filed true airspeed", "Requested altitude"],
      answer: 0,
      explain: "To a VFR tower: call sign, type, estimate over the airport, and type of approach. (Approach control additionally gets equipment suffix, altitude, and destination if other than JAN/MLU.)",
      ref: "LP07 / H00 Quick Reference Guide"
    },
    {
      id: "fwd4", block: 1, cat: "fwd",
      q: "Forward a revised time estimate to the next controller when it differs from the previous estimate by:",
      choices: ["More than 3 minutes", "More than 1 minute", "More than 5 minutes", "Any amount"],
      answer: 0,
      explain: "Revised estimates are forwarded when they differ from the previously forwarded estimate by more than 3 minutes.",
      ref: "LP07 Forwarding Flight Plan & Control Info"
    },
    {
      id: "fwd5", block: 1, cat: "fwd",
      q: "For airborne military aircraft, what is forwarded to FSS?",
      choices: [
        "IFR flight plans, VFR-to-IFR changes, and changes to an IFR flight plan",
        "Only VFR flight plans",
        "Only cancellations",
        "Nothing; military aircraft are handled by base ops"
      ],
      answer: 0,
      explain: "Forward IFR flight plans, changes from VFR to IFR, and changes to an existing IFR flight plan on airborne military aircraft.",
      ref: "LP07 Forwarding Flight Plan & Control Info"
    },
    {
      id: "fwd6", block: 1, cat: "fwd",
      q: "Do NOT forward an aircraft's ETA at its destination airport except for:",
      choices: ["Military or scheduled air carrier aircraft", "General aviation aircraft", "Aircraft below 10,000 feet", "Foreign-registered aircraft"],
      answer: 0,
      explain: "Destination ETAs are forwarded only for military and scheduled air carrier aircraft.",
      ref: "LP07 Forwarding Flight Plan & Control Info"
    },
    {
      id: "fwd7", block: 1, cat: "fwd",
      q: "Coordinate the clearance limit with the approach control facility when the clearance limit is:",
      choices: ["Other than the destination airport", "The destination airport", "Above 10,000 feet", "Within 30 miles of the field"],
      answer: 0,
      explain: "If the clearance limit is anything other than the destination airport, coordinate it with approach control.",
      ref: "LP15 Arrival & Approach Procedures"
    },
    {
      id: "fwd8", block: 1, cat: "fwd",
      q: "Arrival information must be given to a non-approach-control tower before issuing a clearance that allows flight into:",
      choices: ["Class D airspace", "Class A airspace", "A MOA", "The center's airspace"],
      answer: 0,
      explain: "Pass arrival information to the tower before clearing an aircraft into its Class D airspace.",
      ref: "LP15 Arrival & Approach Procedures"
    },

    // ---------- Clearances & routes ----------
    {
      id: "clr1", block: 1, cat: "clear",
      q: "A Q route is:",
      choices: ["An area navigation (RNAV) route published for use in the U.S.", "A low-altitude victor airway", "A military training route", "A preferential departure route"],
      answer: 0,
      explain: "Q routes are published high-altitude RNAV routes.",
      ref: "LP11 Route Assignment / M19 En Route IFR Charts"
    },
    {
      id: "clr2", block: 1, cat: "clear",
      q: "The jet route altitude stratum extends from:",
      choices: ["FL180 to FL450", "FL180 to FL600", "10,000 feet to FL180", "FL290 to FL410"],
      answer: 0,
      explain: "Jet routes (J-routes) occupy FL180 up to and including FL450.",
      ref: "LP11 Route Assignment / M19 En Route IFR Charts"
    },
    {
      id: "clr3", block: 1, cat: "clear",
      q: "A PDAR is:",
      choices: ["A preferential route between two terminals", "A pilot-defined arrival route", "A published departure altitude restriction", "A primary DME arc"],
      answer: 0,
      explain: "A Preferential Departure and Arrival Route (PDAR) is a preferential route between two terminal areas.",
      ref: "LP11 Route Assignment"
    },
    {
      id: "clr4", block: 1, cat: "clear",
      q: "Restate all applicable altitude restrictions when:",
      choices: ["Amending an assigned altitude", "Issuing a frequency change", "Assigning a heading", "Issuing a holding clearance"],
      answer: 0,
      explain: "When you amend an altitude, restate any altitude restrictions that still apply so the pilot does not assume they were cancelled.",
      ref: "LP13 Altitude Assignments / 7110.65 4-5-7"
    },
    {
      id: "clr5", block: 1, cat: "clear",
      q: "Specify the departure airport in a departure clearance when:",
      choices: [
        "It is issued to a non-control facility for relay to the aircraft",
        "The aircraft is a heavy",
        "The flight is above FL180",
        "The pilot requests it"
      ],
      answer: 0,
      explain: "Include the departure airport when the clearance goes through a non-control facility (e.g. FSS) for relay to the pilot.",
      ref: "LP12 Departure Procedures / 7110.65 4-3-x"
    },
    {
      id: "clr6", block: 1, cat: "clear",
      q: "If a pilot cannot comply with a clearance, the pilot's responsibility is to:",
      choices: ["Advise ATC", "Comply anyway and report later", "Squawk 7600", "Cancel IFR"],
      answer: 0,
      explain: "A pilot who cannot comply with a clearance must advise ATC so an alternative can be issued.",
      ref: "LP09 General Control / CKT 1 review"
    },
    {
      id: "clr7", block: 1, cat: "clear",
      q: "The advantage of an abbreviated departure clearance is:",
      choices: ["Reduced verbiage", "Higher priority", "It requires no readback", "It can be issued to VFR aircraft"],
      answer: 0,
      explain: "An abbreviated clearance (\"cleared as filed\") cuts down transmission length.",
      ref: "LP12 Departure Procedures / 7110.65 4-3-x"
    },
    {
      id: "clr8", block: 1, cat: "clear",
      q: "An abbreviated departure clearance may NOT be issued when:",
      choices: ["\"FRC\" (full route clearance) is in the remarks", "The aircraft is a jet", "The destination is outside the center", "The flight is VFR-on-top"],
      answer: 0,
      explain: "FRC in remarks means a full route clearance is required, so the abbreviated form cannot be used.",
      ref: "LP12 Departure Procedures / 7110.65 4-3-x"
    },
    {
      id: "clr9", block: 1, cat: "clear",
      q: "\"HOLD FOR RELEASE\" (HFR) is used to:",
      choices: [
        "Inform the pilot the clearance is not valid until additional instructions are given",
        "Assign a holding pattern at the departure fix",
        "Cancel a previously issued clearance",
        "Delay a VFR departure"
      ],
      answer: 0,
      explain: "HFR tells the pilot that the departure clearance is not valid for takeoff until a release is issued.",
      ref: "LP12 Departure Procedures / 7110.65 4-3-x"
    },
    {
      id: "clr10", block: 1, cat: "clear",
      q: "An EDCT is:",
      choices: ["A runway release time assigned in a traffic management (TMU) program", "An expected descent clearance time", "An estimated departure control tower", "An en route delay code"],
      answer: 0,
      explain: "Expect Departure Clearance Time (EDCT) is a runway release time assigned under a traffic management program.",
      ref: "LP12 Departure Procedures / CKT 1 review"
    },
    {
      id: "clr11", block: 1, cat: "clear",
      q: "A SID not in the filed flight plan may be assigned:",
      choices: ["With pilot concurrence", "Without informing the pilot", "Only to air carriers", "Only above FL180"],
      answer: 0,
      explain: "Assign a SID that was not filed only with the pilot's concurrence.",
      ref: "LP12 Departure Procedures / M20 SIDs and STARs"
    },

    // ---------- Altimeter & altitudes (CKT 1 review) ----------
    {
      id: "alt6", block: 1, cat: "alt",
      q: "With an altimeter setting of 30.28, the lowest usable flight level is:",
      choices: ["FL180", "FL190", "FL200", "FL170"],
      answer: 0,
      explain: "30.28 is 29.92 or higher, so the lowest usable flight level is FL180.",
      ref: "LP13 Altimeter Setting"
    },
    {
      id: "alt7", block: 1, cat: "alt",
      q: "If no approach control facility serves the destination airport, issue the destination altimeter when the aircraft is approximately:",
      choices: ["50 miles from the destination airport", "10 miles from the destination airport", "100 miles from the destination airport", "Crossing the center boundary"],
      answer: 0,
      explain: "Issue the destination altimeter about 50 miles out when no approach control serves the airport.",
      ref: "LP13 Altimeter Setting"
    },
    {
      id: "alt8", block: 1, cat: "alt",
      q: "Below FL290, an IFR aircraft on a magnetic course of 090 (eastbound) is normally assigned:",
      choices: ["An odd thousand-foot altitude, e.g. 7,000", "An even thousand-foot altitude, e.g. 8,000", "Any altitude the pilot requests", "A flight level"],
      answer: 0,
      explain: "Direction-of-flight altitudes: courses 000-179 use odd thousands; 180-359 use even thousands.",
      ref: "LP13 Altitude Assignments / 7110.65 4-5-x"
    },
    {
      id: "alt9", block: 1, cat: "alt",
      q: "You may assign an altitude inappropriate for direction of flight (IAFDOF) after considering:",
      choices: [
        "Traffic conditions, meteorological conditions, and aircraft characteristics",
        "Only the pilot's request",
        "Only the sector's traffic count",
        "The time of day"
      ],
      answer: 0,
      explain: "IAFDOF assignments are permitted when traffic, weather, and aircraft characteristics warrant them.",
      ref: "LP13 Altitude Assignments / 7110.65 4-5-x"
    },
    {
      id: "alt10", block: 1, cat: "alt",
      q: "An aircraft at 13,000 feet is to descend to 11,000. The correct phraseology is:",
      choices: [
        "\"(call sign), DESCEND AND MAINTAIN ONE ONE THOUSAND\"",
        "\"(call sign), GO DOWN TO ONE ONE THOUSAND\"",
        "\"(call sign), DESCEND TO ONE ONE ZERO\"",
        "\"(call sign), REDUCE ALTITUDE ONE ONE THOUSAND\""
      ],
      answer: 0,
      explain: "Use \"DESCEND AND MAINTAIN (altitude).\" Altitudes below FL180 are spoken in thousands, e.g. \"one one thousand.\"",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7"
    },
    {
      id: "alt11", block: 1, cat: "alt",
      q: "To cancel a pilot's-discretion climb or descent, issue:",
      choices: ["\"AMEND ALTITUDE\" with a new clearance", "\"CANCEL DISCRETION\"", "\"EXPEDITE\"", "\"RESUME NORMAL DESCENT\""],
      answer: 0,
      explain: "Remove pilot's discretion by issuing a new clearance prefaced with \"AMEND ALTITUDE.\"",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7"
    },
    {
      id: "alt12", block: 1, cat: "alt",
      q: "The correct phraseology for a pilot's-discretion descent is:",
      choices: [
        "\"(call sign), DESCEND AT PILOT'S DISCRETION, MAINTAIN (altitude)\"",
        "\"(call sign), DESCEND WHEN READY\"",
        "\"(call sign), DESCEND AS DESIRED TO (altitude)\"",
        "\"(call sign), YOUR DISCRETION, (altitude)\""
      ],
      answer: 0,
      explain: "Use \"CLIMB/DESCEND AT PILOT'S DISCRETION, MAINTAIN (altitude).\"",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7"
    },

    // ---------- Vertical separation (CKT 1 review) ----------
    {
      id: "vert8", block: 1, cat: "vert",
      q: "Above FL290, the minimum vertical separation from active Special Use Airspace is:",
      choices: ["1,000 feet", "500 feet", "2,000 feet", "1,500 feet"],
      answer: 0,
      explain: "Keep nonparticipating aircraft at least 1,000 feet above/below SUA limits above FL290 (500 feet at FL290 and below).",
      ref: "LP16 Vertical Separation / 7110.65 9-3-2"
    },
    {
      id: "vert9", block: 1, cat: "vert",
      q: "When applying vertical separation minima, you must consider:",
      choices: ["Known aircraft performance characteristics", "The pilot's home base", "The aircraft's color scheme", "The time since departure"],
      answer: 0,
      explain: "Consider known performance characteristics and any information that climb/descent rates differ from AIM recommendations.",
      ref: "LP16 Vertical Separation / 7110.65 4-5-x"
    },
    {
      id: "vert10", block: 1, cat: "vert",
      q: "Which clearances allow a pilot to descend at pilot's discretion?",
      choices: ["Crossing restrictions and approach clearances", "Holding clearances only", "Cruise clearances only", "Frequency changes"],
      answer: 0,
      explain: "A crossing restriction and an approach clearance both permit the pilot to descend at their discretion (subject to the restriction or approach plate).",
      ref: "LP16 Vertical Separation / 7110.65 4-5-7"
    },

    // ---------- Longitudinal separation (CKT 1 review) ----------
    {
      id: "long6", block: 1, cat: "long",
      q: "ATD stands for:",
      choices: ["Along-track distance", "Actual time of departure", "Air traffic distance", "Automated tracking data"],
      answer: 0,
      explain: "ATD (along-track distance) is the RNAV-derived distance used with mileage-based longitudinal minima.",
      ref: "LP17 Longitudinal Separation"
    },
    {
      id: "long7", block: 1, cat: "long",
      q: "The 44-knot rule may be applied when:",
      choices: [
        "An en route aircraft follows another en route aircraft reported over the same fix",
        "Two aircraft depart adjacent airports",
        "Aircraft are on opposite courses",
        "One aircraft is holding"
      ],
      answer: 0,
      explain: "The 44-knot reduced minimum applies to an en route aircraft following another en route aircraft over the same fix (the faster one leading).",
      ref: "LP17 Longitudinal Separation / 7110.65 6-4-x"
    },
    {
      id: "long8", block: 1, cat: "long",
      q: "The 22-knot rule may be applied when:",
      choices: [
        "A departing aircraft follows another aircraft departing the same or an adjacent airport",
        "Two en route aircraft cross at the same fix",
        "Aircraft are on diverging radials",
        "One aircraft is in holding"
      ],
      answer: 0,
      explain: "The 22-knot reduced minimum applies between departures from the same or adjacent airports when the lead is at least 22 knots faster.",
      ref: "LP17 Longitudinal Separation / 7110.65 6-4-x"
    },
    {
      id: "long9", block: 1, cat: "long",
      q: "Direct pilot-controller communication is required when:",
      choices: [
        "Mileage-based (DME or ATD) procedures and minima are being used",
        "Applying any vertical separation",
        "Issuing an altimeter setting",
        "Forwarding an estimate"
      ],
      answer: 0,
      explain: "Mileage-based longitudinal minima require direct pilot-controller communications so position/DME reports can be solicited.",
      ref: "LP17 Longitudinal Separation / 7110.65 6-4-x"
    },

    // ---------- Lateral & holding (CKT 1 review) ----------
    {
      id: "lat8", block: 1, cat: "lat",
      q: "Separation exists between aircraft established on radials of the same NAVAID when the radials diverge by at least:",
      choices: ["15 degrees and one aircraft is clear of the other's protected airspace", "10 degrees", "30 degrees", "45 degrees"],
      answer: 0,
      explain: "Radials of the same NAVAID diverging by 15 degrees or more provide lateral separation once one aircraft is clear of the other's protected airspace.",
      ref: "LP18 Lateral Separation / 7110.65 6-5-x"
    },
    {
      id: "lat9", block: 1, cat: "lat",
      q: "Two aircraft on airways that diverge by 15 degrees are laterally separated at:",
      choices: ["17 miles", "10 miles", "25 miles", "51 miles"],
      answer: 0,
      explain: "From the DME divergence table, a 15-degree divergence requires 17 miles from the NAVAID. Students must memorize this table.",
      ref: "LP18 Lateral Separation (DME Application Table)"
    },
    {
      id: "lat10", block: 1, cat: "lat",
      q: "If two holding patterns overlap, you must NOT:",
      choices: ["Hold aircraft in them at the same altitude", "Use them at night", "Issue an EFC", "Assign left turns"],
      answer: 0,
      explain: "Overlapping holding patterns require different altitudes for the aircraft holding in them.",
      ref: "LP18 Lateral Separation / 7110.65 6-5-x"
    },
    {
      id: "lat11", block: 1, cat: "lat",
      q: "The holding fix may be omitted from holding instructions when:",
      choices: [
        "It was issued as the clearance limit in the same transmission",
        "The pattern is published",
        "The aircraft is DME-equipped",
        "The delay is under 10 minutes"
      ],
      answer: 0,
      explain: "If the fix has already been stated as the clearance limit in the transmission, it need not be repeated in the holding instructions.",
      ref: "LP14 Holding Procedures / 7110.65 4-6-x"
    },
    {
      id: "lat12", block: 1, cat: "lat",
      q: "When an arrival delay is expected to reach 30 minutes or more, issue total delay information as soon as possible after the aircraft:",
      choices: ["Enters the center's area", "Reaches the holding fix", "Contacts approach control", "Reports the EFC"],
      answer: 0,
      explain: "For delays of 30 minutes or more, tell the pilot the total expected delay as soon as practical after entering the center's airspace.",
      ref: "LP14 Holding Procedures / 7110.65 4-6-x"
    },
    {
      id: "lat13", block: 1, cat: "lat",
      q: "If holding is other than standard, the clearance must include:",
      choices: ["Detailed holding information (direction, fix, radial, leg length, turns, EFC)", "Only the EFC", "Only the direction of turns", "Nothing additional"],
      answer: 0,
      explain: "Nonstandard holding requires the full holding instruction rather than \"as published.\"",
      ref: "LP14 Holding Procedures / 7110.65 4-6-x"
    },

    // ---------- Departures & initial separation ----------
    {
      id: "dep1", block: 1, cat: "dep",
      q: "An appropriate instruction for an aircraft departing an airport in uncontrolled airspace is:",
      choices: [
        "\"WHEN ENTERING CONTROLLED AIRSPACE, FLY HEADING 360\"",
        "\"FLY HEADING 360 IMMEDIATELY AFTER TAKEOFF\"",
        "\"TURN LEFT HEADING 360 BEFORE DEPARTURE\"",
        "\"MAINTAIN RUNWAY HEADING UNTIL FL180\""
      ],
      answer: 0,
      explain: "ATC instructions apply once the aircraft enters controlled airspace, so the heading is tied to entering controlled airspace.",
      ref: "LP12 Departure Procedures / LP19 Initial Separation"
    },
    {
      id: "dep2", block: 1, cat: "dep",
      q: "A heading to be flown after departure does NOT require pilot concurrence:",
      choices: ["At airports with air traffic control services", "At uncontrolled airports", "Above FL180", "For VFR departures"],
      answer: 0,
      explain: "At airports with ATC services, a departure heading may be assigned without pilot concurrence; elsewhere it needs concurrence.",
      ref: "LP12 Departure Procedures / 7110.65 4-3-x"
    },
    {
      id: "dep3", block: 1, cat: "dep",
      q: "To use the one-minute departure rule, initial courses must diverge by at least:",
      choices: ["45 degrees immediately after departure", "15 degrees", "30 degrees", "90 degrees within 5 minutes"],
      answer: 0,
      explain: "One minute between departures is permitted when courses diverge by 45 degrees or more immediately after takeoff.",
      ref: "LP19 Initial Separation / 7110.65 6-3-x"
    },
    {
      id: "dep4", block: 1, cat: "dep",
      q: "The first aircraft departs at 1410 and initial courses diverge by 90 degrees immediately after takeoff. The second aircraft may depart at:",
      choices: ["1411", "1412", "1413", "1415"],
      answer: 0,
      explain: "Divergence of 45 degrees or more immediately after takeoff allows one minute, so 1410 + 1 = 1411.",
      ref: "LP19 Initial Separation / 7110.65 6-3-x"
    },
    {
      id: "dep5", block: 1, cat: "dep",
      q: "Aircraft that will fly courses diverging by at least 45 degrees within 5 minutes after departure must be separated by a minimum of:",
      choices: ["2 minutes until the courses diverge", "1 minute", "3 minutes", "5 minutes"],
      answer: 0,
      explain: "When the 45-degree divergence occurs within 5 minutes (not immediately), apply 2 minutes until the courses diverge.",
      ref: "LP19 Initial Separation / 7110.65 6-3-x"
    },
    {
      id: "dep6", block: 1, cat: "dep",
      q: "A one-minute minimum may be used between departures from adjacent airports when courses diverge immediately after takeoff by:",
      choices: ["45 degrees or more", "15 degrees or more", "30 degrees or more", "Any amount"],
      answer: 0,
      explain: "Adjacent-airport departures may use one minute when initial courses diverge by 45 degrees or more.",
      ref: "LP19 Initial Separation / 7110.65 6-3-x"
    },

    // ---------- Arrivals & approaches ----------
    {
      id: "arr1", block: 1, cat: "arr",
      q: "To transfer communications for an airport not served by a tower or flight service, use:",
      choices: ["\"CHANGE TO ADVISORY FREQUENCY APPROVED\"", "\"CONTACT TOWER\"", "\"FREQUENCY CHANGE APPROVED, GOOD DAY\"", "\"MONITOR GUARD\""],
      answer: 0,
      explain: "At uncontrolled fields, release the aircraft with \"CHANGE TO ADVISORY FREQUENCY APPROVED.\"",
      ref: "LP15 Arrival & Approach / H00 Quick Reference Guide"
    },
    {
      id: "arr2", block: 1, cat: "arr",
      q: "An approach clearance is defined as:",
      choices: [
        "Authorization by ATC for a pilot to conduct an instrument approach",
        "Permission to enter the traffic pattern",
        "A clearance to descend below the MEA",
        "A landing clearance"
      ],
      answer: 0,
      explain: "An approach clearance authorizes the pilot to fly an instrument approach procedure.",
      ref: "LP15 Arrival & Approach / Pilot-Controller Glossary"
    },
    {
      id: "arr3", block: 1, cat: "arr",
      q: "When clearing an aircraft for an ILS approach at an airport with only one ILS, the approach:",
      choices: ["Need not be identified by runway number", "Must always include the runway number", "Must include the localizer frequency", "Must be issued by the tower"],
      answer: 0,
      explain: "If the airport has just one ILS, \"CLEARED ILS APPROACH\" is sufficient without the runway number.",
      ref: "LP15 Arrival & Approach / 7110.65 4-8-x"
    },
    {
      id: "arr4", block: 1, cat: "arr",
      q: "The destination airport name must be specified in the approach clearance when:",
      choices: ["The airport has no air traffic control services", "The airport has a control tower", "The aircraft is a jet", "The approach is an ILS"],
      answer: 0,
      explain: "Include the airport name in the approach clearance at airports without ATC services, e.g. \"CLEARED APPROACH KVKS AIRPORT.\"",
      ref: "LP15 Arrival & Approach / 7110.65 4-8-x"
    },
    {
      id: "arr5", block: 1, cat: "arr",
      q: "An instrument approach chart portrays:",
      choices: ["The aeronautical data required to execute an instrument approach to an airport", "Only the airport diagram", "Only en route airways", "Weather minimums for VFR"],
      answer: 0,
      explain: "Approach charts contain the data needed to fly the instrument approach procedure.",
      ref: "M21 Approaches / LP15"
    },
    {
      id: "arr6", block: 1, cat: "arr",
      q: "A missed approach is:",
      choices: [
        "The maneuver conducted when an approach cannot be completed to a landing",
        "A go-around in the VFR pattern",
        "A holding pattern at the final approach fix",
        "A rejected takeoff"
      ],
      answer: 0,
      explain: "If the approach cannot be completed to a landing, the pilot executes the published missed approach procedure.",
      ref: "M21 Approaches / Pilot-Controller Glossary"
    },
    {
      id: "arr7", block: 1, cat: "arr",
      q: "For an inbound aircraft on an unpublished route, what must be assigned until it is established on a published segment?",
      choices: ["An altitude", "A heading", "A speed", "A squawk"],
      answer: 0,
      explain: "Assign an altitude to maintain until the aircraft is established on a published route or approach segment.",
      ref: "LP15 Arrival & Approach / 7110.65 4-8-x"
    }
  ];

  root.QUIZ_CATS = QUIZ_CATS;
  root.QUIZ_BANK = QUIZ_BANK;
})(typeof window !== "undefined" ? window : this);
