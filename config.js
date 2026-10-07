/* =========================================================
   ✏️  SETTINGS: the only file you need to edit
   ========================================================= */
const CONFIG = {
  // ⏰ The site shows a blurred lock screen with a countdown until this moment,
  //    then opens by itself (with confetti). "+02:00" = Dutch/Austrian summer
  //    time, which applies until 25 October.
  unlockAt: "2026-10-07T18:35:00+02:00",

  // 🔒 Emergency switch: change true into false to open the site right now,
  //    whatever the timer says (a page that's already open follows within a minute).
  //    Want to peek at the real site while it's still locked? Add ?stiekem
  //    to the address. Don't send her that link!
  locked: true,

  // Her name: shown in the big title, on the cake, the footer and the browser tab.
  name: "Jette",

  // Number of candles on the cake (she has to tap every single one).
  candles: 23,

  // Optional: your phone number in international format, digits only
  // (e.g. "31612345678"). If filled in, the "Stuur mijn antwoord" button opens
  // WhatsApp straight to you. Leave empty to let her pick who to send it to.
  whatsappNumber: "",

  // Tiny sparkles that follow the mouse on desktop (true / false).
  mouseTrail: true,
};

// Apply the lock before the page draws, so nothing flashes on screen.
// (script.js double-checks the time against GitHub's clock afterwards.)
const PEEK = /[?&]stiekem\b/.test(location.search);
const UNLOCK_TIME = Date.parse(CONFIG.unlockAt); // NaN = no timer, stay locked
document.documentElement.classList.toggle("site-locked",
  CONFIG.locked && !PEEK && !(Date.now() >= UNLOCK_TIME));
