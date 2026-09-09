// Live Zulu (UTC) clock for the header — ATC runs on Zulu time.
(function () {
  "use strict";

  const clock = document.getElementById("zulu-clock");
  if (!clock) return;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const now = new Date();
    const t =
      pad(now.getUTCHours()) +
      ":" +
      pad(now.getUTCMinutes()) +
      ":" +
      pad(now.getUTCSeconds()) +
      "Z";
    clock.textContent = t;
  }

  tick();
  setInterval(tick, 1000);
})();
