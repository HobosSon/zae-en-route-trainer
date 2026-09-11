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
    proc: "Procedures & Control"
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
    }
  ];

  root.QUIZ_CATS = QUIZ_CATS;
  root.QUIZ_BANK = QUIZ_BANK;
})(typeof window !== "undefined" ? window : this);
