/* =========================================================
   ✏️  SETTINGS: the only file you need to edit
   ========================================================= */
const CONFIG = {
  // 🔒 While this is true, the whole site only says "gaat later vandaag open".
  //    Tonight: change true into false and commit. GitHub needs 1–2 minutes;
  //    a page she already has open unlocks itself within about a minute.
  //    Want to peek at the real site while it's still locked? Add ?stiekem
  //    to the address. Don't send her that link!
  locked: true,

  // Her name: shown in the big title, on the cake, the footer and the browser tab.
  name: "Jette",

  // Number of candles on the cake (she has to tap every single one).
  candles: 24,

  // Optional: your phone number in international format, digits only
  // (e.g. "31612345678"). If filled in, the "Stuur mijn antwoord" button opens
  // WhatsApp straight to you. Leave empty to let her pick who to send it to.
  whatsappNumber: "",

  // Tiny sparkles that follow the mouse on desktop (true / false).
  mouseTrail: true,
};

// Apply the lock before the page draws, so nothing flashes on screen.
const PEEK = /[?&]stiekem\b/.test(location.search);
document.documentElement.classList.toggle("site-locked", CONFIG.locked && !PEEK);
