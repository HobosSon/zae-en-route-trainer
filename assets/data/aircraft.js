/*
 * Aircraft Characteristics Study Guide (Course 50148001, V.2025-02).
 * One entry per column of the chart: the true airspeed at the top of the
 * column, the number of engines, the type (P prop, TP turboprop, J jet) and
 * the weight class (S small, L large, H heavy, J super). Aircraft are listed
 * from lowest to highest climb rate; `tas` on an aircraft is its true
 * airspeed when it differs from the column's.
 */
window.ZAE_AIRCRAFT = {
  source: "50148001 – Aircraft Characteristics Study Guide / V.2025-02",
  columns: [
    { tas: "160", eng: "1", type: "P", wt: "S", ac: [
      { d: "C172", m: "Cessna Skyhawk", climb: "600-800", tas: "120" },
      { d: "C182", m: "Cessna Skylane", climb: "800-1000", tas: "120" },
      { d: "C210", m: "Cessna Centurion", climb: "800-1000" },
      { d: "PA32", m: "Piper Cherokee", climb: "800-1000" },
      { d: "BE36", m: "Beech Bonanza", climb: "1000-1200" },
      { d: "PA24", m: "Piper Comanche", climb: "1000-1200", tas: "120" },
      { d: "SR22", m: "Cirrus SR-22", climb: "1000-1200" },
      { d: "PA46", m: "Piper Malibu", climb: "1100-1400" }
    ] },
    { tas: "160", eng: "2", type: "P", wt: "S", ac: [
      { d: "PA34", m: "Piper Seneca", climb: "1100-1400" },
      { d: "BE58", m: "Beech Baron", climb: "1400-1700" },
      { d: "C421", m: "Golden Eagle", climb: "1400-1700", tas: "200" },
      { d: "PA31", m: "Piper Navajo", climb: "1400-1700" }
    ] },
    { tas: "200", eng: "1", type: "TP", wt: "S", ac: [
      { d: "C208", m: "Cessna Caravan", climb: "1100-1400", tas: "160" },
      { d: "PC12", m: "Pilatus Eagle", climb: "1500-2000" }
    ] },
    { tas: "240", eng: "2", type: "TP", wt: "S", ac: [
      { d: "BE9T", m: "Beech King Air", climb: "1800-2400", tas: "200" },
      { d: "B190", m: "Beech 1900", climb: "1800-2400" },
      { d: "SW4", m: "Fairchild Metro", climb: "1800-2400" },
      { d: "B350", m: "Super King Air", climb: "2700-3000", tas: "270" },
      { d: "C441", m: "Cessna Conquest", climb: "2700-4200" }
    ] },
    { tas: "240", eng: "2", type: "TP", wt: "L", ac: [
      { d: "DH8", m: "Dehavilland-8", climb: "1400-1700" },
      { d: "SF34", m: "Saab 340", climb: "1800-2400" },
      { d: "DH8D", m: "Dehavilland-DASH8", climb: "2400-2600", tas: "270" }
    ] },
    { tas: "300", eng: "4", type: "TP", wt: "L", ac: [
      { d: "C130", m: "Lockheed Hercules", climb: "1400-1700" }
    ] },
    { tas: "460+", eng: "1", type: "J", wt: "L", ac: [
      { d: "F16", m: "Fighting Falcon", climb: "8000-10000" }
    ] },
    { tas: "320", eng: "2", type: "J", wt: "S", ac: [
      { d: "C510", m: "Citation Mustang", climb: "2000-3000" },
      { d: "EA50", m: "Eclipse 500", climb: "2000-3000" },
      { d: "T37", m: "Cessna T-37", climb: "3000-3500" },
      { d: "BE40", m: "Beech Jet", climb: "3000-3500", tas: "430" },
      { d: "C750", m: "Citation10", climb: "3500-4000", tas: "460+" },
      { d: "LJ55", m: "Learjet 55", climb: "4000-5000", tas: "430" },
      { d: "T38", m: "Talon AT-38", climb: "8000-10000", tas: "460+" }
    ] },
    { tas: "430", eng: "2", type: "J", wt: "L", ac: [
      { d: "B712", m: "Boeing 717-200", climb: "2000-3000" },
      { d: "B753", m: "Boeing 757-300", climb: "2000-3000", tas: "460+" },
      { d: "CRJ2", m: "Canadair Jet CRJ200", climb: "2000-2500", tas: "400" },
      { d: "CRJ9", m: "Canadair Jet CRJ900", climb: "2000-3000" },
      { d: "E145", m: "Embraer EMB-145", climb: "2000-3000" },
      { d: "E190", m: "Embraer EMB-190", climb: "2000-2500" },
      { d: "A320", m: "Airbus 320", climb: "3000-3500" },
      { d: "B738", m: "Boeing 737-800", climb: "3000-3500" },
      { d: "MD82", m: "McD Doug MD82", climb: "3000-3500" },
      { d: "GLF4", m: "Gulfstream", climb: "4000-5000", tas: "460+" }
    ] },
    { tas: "460+", eng: "2", type: "J", wt: "H", ac: [
      { d: "B772", m: "Boeing 777", climb: "2000-3000" },
      { d: "B763", m: "Boeing 767-300", climb: "3000-3500" }
    ] },
    { tas: "460+", eng: "4", type: "J", wt: "H", ac: [
      { d: "C5", m: "Lockheed C5 Galaxy", climb: "2000-3000" },
      { d: "C17", m: "C-17 GlobeMaster", climb: "2000-3000", tas: "430" },
      { d: "A343", m: "Airbus 340", climb: "3000-3500" },
      { d: "E3TF", m: "Boeing E-3A Sentry", climb: "3000-3500", tas: "430" },
      { d: "B1", m: "B1 Lancer", climb: "3000-3500" },
      { d: "B2", m: "B2 Spirit", climb: "3000-3500" },
      { d: "B742", m: "Boeing 747", climb: "3000-3500" },
      { d: "K35R", m: "KC135 Stratotanker", climb: "4000-4500", tas: "430" }
    ], then: { tas: "460+", eng: "4", type: "J", wt: "J", ac: [
      { d: "A388", m: "Airbus 380", climb: "3000-3500" }
    ] } },
    { tas: "460+", eng: "8", type: "J", wt: "H", ac: [
      { d: "B52", m: "StratoFortress", climb: "3000-3500" }
    ] }
  ],
  legend: {
    types: [["P", "PROP"], ["TP", "TURBOPROP"], ["J", "JET"]],
    weights: [["S", "Small"], ["L", "Large"], ["H", "Heavy"], ["J", "Super"]],
    notes: [
      "Aircraft are listed from lowest to highest climb rate in each column.",
      "True Airspeed is listed if not same as speed at top of column."
    ]
  }
};
