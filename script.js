/* Settings (name, lock, candles, …) live in config.js */

/* =========================================================
   Name
   ========================================================= */
document.querySelectorAll("[data-name]").forEach(el => { el.textContent = CONFIG.name; });
document.title = `Gefeliciteerd, ${CONFIG.name}! 🎉`;

/* =========================================================
   Photos: drop files into /images with the names shown in the
   placeholders. jpg, jpeg, png, webp and gif all work.
   ========================================================= */
const EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "gif"];
document.querySelectorAll("[data-photo]").forEach(box => {
  const base = "images/" + box.dataset.photo;
  const img = new Image();
  let i = 0;
  img.alt = box.closest(".polaroid, .ev-photo")?.querySelector("figcaption, .ev-caption")?.textContent || "";
  img.decoding = "async";
  img.onload = () => { box.prepend(img); box.classList.add("has-img"); };
  img.onerror = () => { if (++i < EXTS.length) img.src = `${base}.${EXTS[i]}`; };
  img.src = `${base}.${EXTS[0]}`;
});

/* =========================================================
   ✨ Confetti & sparkle engine
   ========================================================= */
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
const parts = [];
const MAX_PARTS = 900;
let W = 0, H = 0, DPR = 1, running = false, last = 0;

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const PALETTE = ["#FF4D8D", "#FFC93C", "#3DB9FF", "#2ED5A2", "#8B5CF6", "#FF7A45"];
const THEMES = {
  party:  { emoji: ["🎉", "✨", "🎈", "🥳", "⭐", "💖"],  colors: PALETTE },
  ski:    { emoji: ["❄️", "⛷️", "🏔️", "❄️", "✨"],       colors: ["#3DB9FF", "#1E88E5", "#7FD6FF", "#FFFFFF", "#FFC93C"] },
  bounce: { emoji: ["🤸‍♀️", "💥", "⭐", "🦘", "✨"],      colors: ["#FF4D8D", "#FF7A45", "#FFC93C", "#8B5CF6"] },
  cake:   { emoji: ["🎂", "🕯️", "✨", "🍰", "🎁"],       colors: PALETTE },
  maybe:  { emoji: ["❓", "🐈‍⬛", "📦", "🤷‍♀️", "✨"],     colors: ["#8B5CF6", "#1E1B4B", "#FFC93C", "#3DB9FF"] },
};

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  emojiCache.clear();
}

// Emoji are pre-rendered once per size, which keeps phones smooth.
const emojiCache = new Map();
function emojiSprite(ch, size) {
  const s = Math.max(12, Math.round(size / 4) * 4);
  const key = ch + s;
  let c = emojiCache.get(key);
  if (!c) {
    c = document.createElement("canvas");
    c.width = c.height = Math.ceil(s * 1.5 * DPR);
    const x = c.getContext("2d");
    x.scale(DPR, DPR);
    x.font = `${s}px ${EMOJI_FONT}`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(ch, s * .75, s * .8);
    emojiCache.set(key, c);
  }
  return { c, s };
}

function start() {
  if (parts.length > MAX_PARTS) parts.splice(0, parts.length - MAX_PARTS);
  if (!running) { running = true; last = 0; requestAnimationFrame(tick); }
}

function particle(type, x, y, vx, vy, theme, extra) {
  return Object.assign({
    type, x, y, vx, vy,
    g: type === "sparkle" ? .07 : type === "emoji" ? .2 : .15,
    drag: type === "confetti" || type === "streamer" ? .962 : .975,
    size: type === "emoji" ? rand(18, 32) : type === "sparkle" ? rand(6, 12) : rand(6, 11),
    color: pick(theme.colors),
    emoji: pick(theme.emoji),
    rot: rand(0, Math.PI * 2), vr: rand(-.25, .25),
    tilt: rand(0, Math.PI * 2), vt: rand(.08, .25),
    wob: 0,
    life: 1, decay: rand(.009, .016),
  }, extra);
}

function randomType() {
  const r = Math.random();
  return r < .12 ? "emoji" : r < .38 ? "sparkle" : r < .52 ? "circle" : r < .6 ? "streamer" : "confetti";
}

/** A burst of party stuff at (x, y). */
function spawn(x, y, opts = {}) {
  const base = THEMES[opts.theme] || THEMES.party;
  const theme = { emoji: opts.emoji || base.emoji, colors: opts.colors || base.colors };
  const n = opts.count ?? 34;
  const power = opts.power ?? 1;
  const spread = opts.spread ?? Math.PI * 2;
  const dir = opts.angle ?? -Math.PI / 2;
  for (let i = 0; i < n; i++) {
    const a = dir + (Math.random() - .5) * spread;
    const v = rand(2.5, 9.5) * power;
    parts.push(particle(randomType(), x, y, Math.cos(a) * v, Math.sin(a) * v - 1.5, theme));
  }
  start();
}

/** Confetti raining down from the top of the screen. */
function rain(count = 120, theme = "party", onlyEmoji = false) {
  const t = THEMES[theme] || THEMES.party;
  for (let i = 0; i < count; i++) {
    const type = onlyEmoji ? (Math.random() < .55 ? "emoji" : "circle") : (Math.random() < .1 ? "emoji" : Math.random() < .3 ? "sparkle" : "confetti");
    parts.push(particle(type, rand(0, W), rand(-H * .5, -10), rand(-1.5, 1.5), rand(1, 4), t, {
      g: .03, drag: .99, decay: rand(.0035, .006), wob: rand(.4, 1.4),
    }));
  }
  start();
}

/** Two cannons from the bottom corners + a pop in the middle. */
function celebrate(theme = "party") {
  spawn(W * .08, H + 10, { theme, count: 70, power: 2, angle: -Math.PI / 2 + .45, spread: .7 });
  spawn(W * .92, H + 10, { theme, count: 70, power: 2, angle: -Math.PI / 2 - .45, spread: .7 });
  setTimeout(() => spawn(W * .5, H * .4, { theme, count: 80, power: 1.5 }), 280);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 16.667, 3) : 1;
  last = now;
  ctx.clearRect(0, 0, W, H);

  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    const d = Math.pow(p.drag, dt);
    p.vx *= d;
    p.vy = p.vy * d + p.g * dt;
    p.x += (p.vx + Math.sin(p.tilt) * p.wob) * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.tilt += p.vt * dt;
    p.life -= p.decay * dt;
    if (p.life <= 0 || p.y > H + 80) { parts.splice(i, 1); continue; }
    draw(p);
  }

  if (parts.length) requestAnimationFrame(tick);
  else { running = false; ctx.clearRect(0, 0, W, H); }
}

function draw(p) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, p.life * 1.8);
  ctx.translate(p.x, p.y);

  switch (p.type) {
    case "confetti":
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.tilt)); // the "flutter"
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      break;

    case "streamer":
      ctx.rotate(p.rot);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let k = 0; k <= 4; k++) {
        const sx = (k - 2) * p.size * .6;
        const sy = Math.sin(p.tilt + k * 1.3) * p.size * .35;
        k ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      }
      ctx.stroke();
      break;

    case "circle":
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "sparkle": {
      const r = p.size * (.7 + .4 * Math.abs(Math.sin(p.tilt * 1.5)));
      ctx.rotate(p.rot * .3);
      ctx.fillStyle = p.color === "#FFFFFF" ? "#FFC93C" : p.color;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * .14, -r * .14, r, 0);
      ctx.quadraticCurveTo(r * .14, r * .14, 0, r);
      ctx.quadraticCurveTo(-r * .14, r * .14, -r, 0);
      ctx.quadraticCurveTo(-r * .14, -r * .14, 0, -r);
      ctx.fill();
      break;
    }

    case "emoji": {
      const { c, s } = emojiSprite(p.emoji, p.size);
      ctx.rotate(p.rot * .4);
      ctx.drawImage(c, -s * .75, -s * .75, s * 1.5, s * 1.5);
      break;
    }
  }
  ctx.restore();
}

window.addEventListener("resize", resize);
resize();

/* ---------- click / tap anywhere ---------- */
const hint = document.getElementById("tapHint");
let hintGone = false;

function burstAt(e) {
  if (!hintGone) { hintGone = true; hint.classList.add("gone"); }
  if (e.target.closest?.(".candle")) return;
  if (!tryPop(e)) {
    const zone = e.target.closest?.("[data-fx]");
    spawn(e.clientX, e.clientY, { theme: zone ? zone.dataset.fx : "party" });
  }
}

/* ---------- poppable balloons ---------- */
// The balloons float behind the page (so they never block buttons), which means
// clicks can't reach them directly. Instead we check by position whether a tap
// landed on a balloon that's actually visible, i.e. not behind a card or button.
const balloons = [...document.querySelectorAll(".balloon")];
const SOLID = "button, a, .option, .question-card, .polaroid, .stat, .compare, .result, .redeem, .fineprint, .footer, .lock-card, .site-lock-card, .ribbon, .evidence";

function balloonAt(x, y, pad) {
  return balloons.find(b => {
    if (b.classList.contains("popped")) return false;
    const r = b.getBoundingClientRect();
    return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;
  });
}

function tryPop(e) {
  if (e.target.closest?.(SOLID)) return false;
  const b = balloonAt(e.clientX, e.clientY, e.pointerType === "mouse" ? 4 : 14);
  if (!b) return false;

  const r = b.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const color = getComputedStyle(b).getPropertyValue("--c").trim() || "#FF4D8D";
  b.classList.add("popped");
  spawn(x, y, { colors: [color, color, "#FFFFFF", "#FFC93C"], emoji: ["🎈", "💥", "✨"], count: 45, power: 1.2 });

  const word = document.createElement("span");
  word.className = "pop-word";
  word.textContent = pick(["POP!", "PANG!", "KNAL!", "BAM!"]);
  word.style.left = x + "px";
  word.style.top = y + "px";
  document.body.appendChild(word);
  word.addEventListener("animationend", () => word.remove());

  // A fresh balloon floats up from the bottom a bit later.
  setTimeout(() => {
    b.classList.remove("popped");
    b.style.animation = "none";
    void b.offsetWidth;
    b.style.animation = "";
    b.style.animationDelay = "0s";
  }, 2500);
  return true;
}

// Desktop: show a pointer cursor when hovering a poppable balloon.
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let lastHover = 0;
  document.addEventListener("pointermove", e => {
    const now = performance.now();
    if (now - lastHover < 80) return;
    lastHover = now;
    const over = !e.target.closest?.(SOLID) && balloonAt(e.clientX, e.clientY, 4);
    document.body.classList.toggle("over-balloon", !!over);
  }, { passive: true });
}

// Mouse: burst right away. Touch: burst on a real tap, not when scrolling.
let down = null;
document.addEventListener("pointerdown", e => {
  if (e.pointerType === "mouse") { if (e.button === 0) burstAt(e); return; }
  down = { id: e.pointerId, x: e.clientX, y: e.clientY };
}, { passive: true });
document.addEventListener("pointerup", e => {
  if (!down || e.pointerId !== down.id) return;
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 14) burstAt(e);
  down = null;
}, { passive: true });
document.addEventListener("pointercancel", () => { down = null; }, { passive: true });

// Rapid confetti clicking shouldn't highlight text (double/triple-click select).
document.addEventListener("mousedown", e => { if (e.detail > 1) e.preventDefault(); });

// Gentle sparkle trail behind the mouse (desktop only).
if (CONFIG.mouseTrail && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let lastTrail = 0;
  document.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    const now = performance.now();
    if (now - lastTrail < 45) return;
    lastTrail = now;
    parts.push(particle("sparkle", e.clientX, e.clientY, rand(-.6, .6), rand(-.6, .4), THEMES.party, {
      g: .03, drag: .97, size: rand(3, 6), decay: .03,
    }));
    start();
  }, { passive: true });
}

/* =========================================================
   🎁 The present
   ========================================================= */
const gift = document.getElementById("gift");
const giftCta = document.getElementById("giftCta");
const giftReveal = document.getElementById("giftReveal");

document.body.classList.add("locked");

gift.addEventListener("click", () => {
  if (gift.classList.contains("open")) return;
  gift.classList.add("open");
  gift.setAttribute("aria-label", "Het cadeau is open");
  const r = gift.getBoundingClientRect();
  spawn(r.left + r.width / 2, r.top + r.height * .35, { count: 140, power: 1.9, spread: Math.PI * 1.3 });
  setTimeout(() => celebrate(), 350);
  setTimeout(() => rain(90), 700);
  giftCta.hidden = true;
  giftReveal.hidden = false;
  document.body.classList.remove("locked");
});

/* =========================================================
   🤔 The big question
   ========================================================= */
const answerBtns = document.querySelectorAll(".answer");
const resultEls = document.querySelectorAll("[data-result]");
const optionsGrid = document.querySelector(".options");
const resultBox = document.getElementById("result");
const redeem = document.getElementById("redeem");
let currentAnswer = null;

const SHARE_TEXT = {
  yes: "Ik kom naar Oostenrijk! ⛷️🇦🇹 Ik kies de skidag in St. Anton, met lunch in een berghut en een biertje bij de MooserWirt.",
  no: "Ik kom deze winter niet naar Oostenrijk, dus het wordt Bounce Valley! 🤸‍♀️ Neem je antislipsokken mee.",
};

answerBtns.forEach(btn => btn.addEventListener("click", () => choose(btn.dataset.answer)));

function choose(answer) {
  currentAnswer = answer;
  answerBtns.forEach(b => b.classList.toggle("selected", b.dataset.answer === answer));
  resultEls.forEach(el => { el.hidden = el.dataset.result !== answer; });
  optionsGrid.classList.remove("chose-yes", "chose-no", "chose-maybe");
  void optionsGrid.offsetWidth; // restart the jiggle animation
  optionsGrid.classList.add("chose-" + answer);
  redeem.hidden = answer === "maybe";

  if (answer === "yes") {
    rain(110, "ski", true);
    celebrate("ski");
  } else if (answer === "no") {
    celebrate("bounce");
    setTimeout(() => celebrate("bounce"), 600);
  } else {
    spawn(W / 2, H / 2, { theme: "maybe", count: 60, power: 1.2 });
  }

  setTimeout(() => resultBox.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
}

document.getElementById("shareBtn").addEventListener("click", async () => {
  const text = SHARE_TEXT[currentAnswer];
  if (!text) return;
  if (!CONFIG.whatsappNumber && navigator.share) {
    try { await navigator.share({ text }); return; } catch (err) { if (err.name === "AbortError") return; }
  }
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
});

/* =========================================================
   🔢 Count-up numbers
   ========================================================= */
const counters = document.querySelectorAll("[data-count]");
const compare = document.getElementById("compare");
const countUp = el => {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const dur = 1600;
  const t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = prefix + Math.round(target * eased).toLocaleString("nl-NL") + suffix;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      if (en.target === compare) compare.classList.add("in-view");
      else countUp(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: .6 });
  counters.forEach(c => io.observe(c));
  io.observe(compare);
} else {
  counters.forEach(countUp);
  compare.classList.add("in-view");
}

/* =========================================================
   🔍 Jette op haar best: tap each envelope to reveal the photo
   ========================================================= */
const evidence = document.querySelectorAll(".evidence");
const caseStatus = document.getElementById("caseStatus");
let opened = 0;

evidence.forEach(card => card.addEventListener("click", () => {
  if (card.classList.contains("revealed")) return;
  card.classList.add("revealed");
  card.setAttribute("aria-label", card.querySelector(".ev-caption").textContent);
  opened++;
  const r = card.getBoundingClientRect();
  spawn(r.left + r.width / 2, r.top + r.height / 2, { count: 50, power: 1.3 });
  if (opened === evidence.length) {
    caseStatus.textContent = "Alle 6 bekeken! 🎉";
    caseStatus.classList.add("closed");
    setTimeout(() => celebrate(), 600);
  } else {
    caseStatus.textContent = `${opened} van ${evidence.length} foto's bekeken`;
  }
}));

/* =========================================================
   🎂 Make a wish: blow out every single candle
   ========================================================= */
const cake = document.getElementById("cake");
const candleBox = document.getElementById("candles");
const wishMsg = document.getElementById("wishMsg");
const relightBtn = document.getElementById("relight");
const N = Math.max(1, CONFIG.candles | 0);
const candles = [];
let blownOut = 0;

document.querySelectorAll("[data-candles]").forEach(el => { el.textContent = N; });

// Candles stand in a row on the top tier (heights: see .candle in style.css).
candleBox.style.setProperty("--n", N);
for (let i = 0; i < N; i++) {
  const c = document.createElement("button");
  c.className = i % 2 ? "candle tall" : "candle";
  c.setAttribute("aria-label", `Kaarsje ${i + 1} uitblazen`);
  c.style.setProperty("--hd", 40 + ((i * 7) % 5) * 3 + "px");
  c.style.setProperty("--c", PALETTE[i % PALETTE.length]);
  c.style.setProperty("--d", (-Math.random() * .4).toFixed(2) + "s");
  c.innerHTML = '<span class="flame"></span><span class="stick"></span>';
  c.addEventListener("click", () => blowOut(c));
  candleBox.appendChild(c);
  candles.push(c);
}

function blowOut(c) {
  if (c.classList.contains("out")) return;
  c.classList.add("out");
  blownOut++;
  const r = c.getBoundingClientRect();
  spawn(r.left + r.width / 2, r.top + r.height * .2, { theme: "cake", count: 10, power: .55 });

  const left = N - blownOut;
  if (left === 0) {
    wishMsg.textContent = "Alles uit! Wens ontvangen ✓ Levertijd: ongeveer een jaar.";
    relightBtn.hidden = false;
    const cr = cake.getBoundingClientRect();
    spawn(cr.left + cr.width / 2, cr.top + cr.height * .3, { theme: "cake", count: 90, power: 1.5 });
    setTimeout(() => celebrate("cake"), 250);
    setTimeout(() => rain(120), 600);
  } else if (blownOut === 1) {
    wishMsg.textContent = `Eentje! Nog ${left} te gaan 💨`;
  } else if (left === 1) {
    wishMsg.textContent = "Nog één!";
  } else if (blownOut === Math.floor(N / 2)) {
    wishMsg.textContent = "Halverwege. Diep ademhalen!";
  } else {
    wishMsg.textContent = `${blownOut} van ${N} uit`;
  }
}

relightBtn.addEventListener("click", () => {
  relightBtn.hidden = true;
  blownOut = 0;
  wishMsg.textContent = "Weer aan! Je mag nog een wens doen.";
  candles.forEach((c, i) => setTimeout(() => c.classList.remove("out"), i * 40));
});

/* =========================================================
   🔒 "Gaat later vandaag open" (config.js → locked)
   ========================================================= */
// While locked, re-check config.js every minute (skipping the browser cache),
// so a page she already has open unlocks itself once you set locked: false.
if (document.documentElement.classList.contains("site-locked")) {
  // The blurred page behind the lock can't be tabbed into with the keyboard.
  const behind = [...document.body.children].filter(el => !el.matches(".site-lock, #fx, .balloons, script"));
  behind.forEach(el => { el.inert = true; });

  const checkLock = async () => {
    try {
      const res = await fetch(`config.js?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok && /^\s*locked\s*:\s*false/m.test(await res.text())) {
        behind.forEach(el => { el.inert = false; });
        document.documentElement.classList.remove("site-locked");
        window.scrollTo(0, 0);
        celebrate();
        setTimeout(() => rain(140), 300);
        return;
      }
    } catch (err) { /* offline or opened as a file: try again later */ }
    setTimeout(checkLock, 60000);
  };
  checkLock();
}

/* =========================================================
   🎊 Finale button + welcome confetti
   ========================================================= */
document.getElementById("finale").addEventListener("click", () => {
  celebrate();
  setTimeout(() => rain(140), 300);
  setTimeout(() => celebrate(), 900);
});

window.addEventListener("load", () => setTimeout(() => rain(110), 500));
