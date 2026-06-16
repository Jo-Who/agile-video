/* ============================================================
   DIE AKTE AGILE — cinematische Engine
   Drehbuch & Besetzung stehen in story.js
   ============================================================ */
const CFG = {
  typeMin: 18,        // ms pro Zeichen (Untergrenze)
  gapAfter: 850,      // Pause nach einer Zeile vor dem Weiterschalten (ms)
  speechRate: 1.0,
  musicVol: 0.17
};

const { CHARACTERS, SCRIPT } = window.STORY;

/* ---- Beats aus dem Drehbuch ableiten (Zustand "vererbt" sich) ---- */
const beats = [];
(function () {
  let act = "", title = "", label = "", rec = true;
  let theme = { bg1: "#0a0e16", bg2: "#141b26", accent: "#e7c987" };
  let stage = { chars: [], props: [], place: "" };
  SCRIPT.forEach((b, i) => {
    if (b.act !== undefined) act = b.act;
    const showTitle = b.title !== undefined && b.title !== "";
    if (b.title !== undefined) title = b.title;
    if (b.label !== undefined) label = b.label;
    if (b.rec !== undefined) rec = b.rec;
    if (b.theme) theme = b.theme;
    if (b.stage) stage = b.stage;
    beats.push({
      i, who: b.who, text: b.text,
      act, title: showTitle ? title : "", label, rec, theme, stage
    });
  });
})();

/* ============================================================
   DOM aufbauen
   ============================================================ */
const root = document.getElementById("app");
root.innerHTML = `
  <div class="bar top"></div>
  <div class="bar bottom"></div>

  <div id="screen">
    <div class="scanlines"></div>
    <div class="grain"></div>
    <div class="vignette"></div>

    <div class="chrome">
      <div class="rec"><span class="recdot"></span>REC</div>
      <div class="channel"></div>
    </div>
    <div class="place"></div>
    <div class="timecode">00:00:00:00</div>

    <div class="props"></div>
    <div class="cast"></div>
    <div class="bubble-layer"></div>

    <div class="title-card"><div class="tc-kicker"></div><div class="tc-title"></div></div>
  </div>

  <div class="lower">
    <div class="narr-channel"></div>
    <div class="narr"></div>
    <button id="weiter">Weiter <span>▸</span></button>
  </div>
`;

const elScreen   = root.querySelector("#screen");
const elChannel  = root.querySelector(".channel");
const elPlace    = root.querySelector(".place");
const elRec      = root.querySelector(".rec");
const elTC       = root.querySelector(".timecode");
const elProps    = root.querySelector(".props");
const elCast     = root.querySelector(".cast");
const elBubble   = root.querySelector(".bubble-layer");
const elTitle    = root.querySelector(".title-card");
const elTCKick   = root.querySelector(".tc-kicker");
const elTCTitle  = root.querySelector(".tc-title");
const elNarr     = root.querySelector(".narr");
const elNarrCh   = root.querySelector(".narr-channel");
const elWeiter   = root.querySelector("#weiter");

const POS = {
  0: [], 1: [[50, 62]], 2: [[30, 62], [70, 62]], 3: [[22, 62], [50, 60], [78, 62]],
  4: [[17, 58], [39, 66], [61, 66], [83, 58]],
  5: [[13, 58], [32, 66], [50, 54], [68, 66], [87, 58]]
};
const PROP_POS = [[20, 26], [78, 22], [62, 40], [33, 44], [50, 18], [86, 50]];

/* ============================================================
   Rendering
   ============================================================ */
let lastCastKey = "", lastPropKey = "", lastTheme = "";

function setTheme(t) {
  const key = t.bg1 + t.bg2 + t.accent;
  if (key === lastTheme) return;
  lastTheme = key;
  document.body.style.setProperty("--bg1", t.bg1);
  document.body.style.setProperty("--bg2", t.bg2);
  document.body.style.setProperty("--accent", t.accent);
}

function renderStage(stage, speaker) {
  const castKey = stage.chars.join(",");
  if (castKey !== lastCastKey) {
    lastCastKey = castKey;
    const pos = POS[stage.chars.length] || POS[5];
    elCast.innerHTML = stage.chars.map((id, k) => {
      const c = CHARACTERS[id];
      const [x, y] = pos[k] || [50, 60];
      return `<div class="actor" data-id="${id}" style="left:${x}%;top:${y}%;--c:${c.color}">
                <div class="emoji">${c.emoji}</div>
                <div class="nametag">${c.name}</div>
              </div>`;
    }).join("");
  }
  // highlight speaker
  elCast.querySelectorAll(".actor").forEach(a =>
    a.classList.toggle("speaking", a.dataset.id === speaker));

  const propKey = JSON.stringify(stage.props || []);
  if (propKey !== lastPropKey) {
    lastPropKey = propKey;
    elProps.innerHTML = (stage.props || []).map((p, k) => {
      const [x, y] = PROP_POS[k] || [50, 30];
      return `<div class="prop" style="left:${x}%;top:${y}%;animation-delay:${k * 0.7}s">${p.e}</div>`;
    }).join("");
  }
}

/* typewriter — returns a function to finish instantly */
function typeText(el, text, durationMs) {
  el.innerHTML = "";
  const span = document.createElement("span");
  const caret = document.createElement("i");
  caret.className = "caret";
  el.appendChild(span); el.appendChild(caret);
  const chars = [...text];
  const step = Math.max(CFG.typeMin, durationMs / Math.max(1, chars.length));
  let n = 0, timer = null;
  function tick() {
    n++;
    span.textContent = text.slice(0, n);
    if (n < chars.length) timer = setTimeout(tick, step);
    else caret.classList.add("done");
  }
  timer = setTimeout(tick, step);
  return function finish() {
    if (timer) clearTimeout(timer);
    span.textContent = text;
    caret.classList.add("done");
  };
}

/* ============================================================
   Audio (3 Stufen: Datei → Browserstimme → still)
   ============================================================ */
let voiceMode = "speech";     // wird beim Start gesetzt: 'file' | 'speech' | 'silent'
let fileIds = new Set();
let voiceFormat = "m4a";      // aus manifest.json (z.B. "mp3" bei ElevenLabs)
const synth = window.speechSynthesis;
let synthVoices = [];
function loadVoices() { synthVoices = synth ? synth.getVoices() : []; }
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

function pickSpeechVoice(c) {
  const de = synthVoices.filter(v => /^de/i.test(v.lang));
  if (!de.length) return null;
  if (c.voice) {
    const base = c.voice.replace(/\s*\(.*$/, "").trim();
    const hit = de.find(v => v.name.toLowerCase().includes(base.toLowerCase()));
    if (hit) return hit;
  }
  return de.find(v => /google/i.test(v.name)) || de[0];
}

async function detectVoiceFiles() {
  try {
    const r = await fetch("assets/voice/manifest.json", { cache: "no-store" });
    if (!r.ok) return false;
    const m = await r.json();
    fileIds = new Set(m.ids || []);
    voiceFormat = m.format || "m4a";
    return fileIds.size > 0;
  } catch (e) { return false; }
}

/* current playback handle */
let curAudio = null;

function estimate(text) {
  return Math.max(1900, (text.length / 14) * 1000 + 500);
}

/* ============================================================
   Engine / Transport
   ============================================================ */
let idx = -1, paused = false, started = false, token = 0, gapTimer = null;
const elProgressActs = [];

function clearGap() { if (gapTimer) { clearTimeout(gapTimer); gapTimer = null; } }
function stopAudio() {
  clearGap();
  if (curAudio) { try { curAudio.onended = null; curAudio.pause(); } catch (e) {} curAudio = null; }
  try { synth && synth.cancel(); } catch (e) {}
}

function showTitleCard(beat) {
  elTCKick.textContent = beat.act;
  elTCTitle.textContent = beat.title;
  elTitle.classList.add("show");
  setTimeout(() => elTitle.classList.remove("show"), 2600);
}

function playBeat(i) {
  stopAudio();
  if (i >= beats.length) return finish();
  if (i < 0) i = 0;
  idx = i;
  const beat = beats[i];
  const c = CHARACTERS[beat.who] || CHARACTERS.narrator;
  const isNarr = c.kind === "narrator" || c.kind === "system";

  setTheme(beat.theme);
  elChannel.textContent = beat.act;
  elNarrCh.textContent = beat.act;
  elPlace.textContent = beat.stage.place || "";
  elRec.style.display = beat.rec ? "" : "none";
  if (beat.title) showTitleCard(beat);

  renderStage(beat.stage, isNarr ? null : beat.who);
  setProgress();

  const myToken = ++token;
  const advance = () => {
    if (myToken !== token || paused) return;
    clearGap();
    gapTimer = setTimeout(() => { if (myToken === token && !paused && started) playBeat(idx + 1); }, CFG.gapAfter);
  };

  // ---- render text (bubble vs. narrator lower-third) ----
  let typeTarget, finishType;
  if (isNarr) {
    elBubble.innerHTML = "";
    elNarr.className = "narr show" + (c.kind === "system" ? " credits" : "");
    elNarr.innerHTML = (c.kind === "system")
      ? beat.text.split("\n").map((l, k) => `<div class="cl cl${k}">${l}</div>`).join("")
      : "";
    typeTarget = elNarr;
  } else {
    elNarr.className = "narr";
    elNarr.innerHTML = "";
    const x = bubbleXFor(beat);
    elBubble.innerHTML = `<div class="bubble" style="left:${x}%;--c:${c.color}">
        <div class="who">${c.name}</div><div class="say"></div></div>`;
    typeTarget = elBubble.querySelector(".say");
  }

  // ---- audio ----
  const useFile = (voiceMode === "file") && fileIds.has(i) && !isSystem(beat);
  const useSpeech = (voiceMode === "speech") && !isSystem(beat) && synth;

  if (c.kind === "system") {
    // credits: no typewriter, just fade in
    if (typeTarget === elNarr) {/* already set */}
    finishType = () => {};
    duck(false);
    gapTimerStartFor(estimate(beat.text) * 1.4, myToken, advance);
    return;
  }

  if (useFile) {
    const a = new Audio(`assets/voice/${i}.${voiceFormat}`);
    curAudio = a;
    duck(true);
    let typed = false;
    const startType = (durMs) => { if (typed) return; typed = true; finishType = typeText(typeTarget, beat.text, durMs); };
    a.addEventListener("loadedmetadata", () => {
      const d = (a.duration && isFinite(a.duration)) ? a.duration * 1000 : estimate(beat.text);
      startType(Math.max(900, d * 0.82));
    });
    a.addEventListener("ended", () => { duck(false); advance(); });
    a.addEventListener("error", () => { startType(estimate(beat.text)); gapTimerStartFor(estimate(beat.text), myToken, advance); });
    a.play().catch(() => { startType(estimate(beat.text)); gapTimerStartFor(estimate(beat.text), myToken, advance); });
    // safety: if metadata slow, start typing anyway
    setTimeout(() => startType(estimate(beat.text)), 350);
  } else if (useSpeech) {
    finishType = typeText(typeTarget, beat.text, estimate(beat.text));
    const u = new SpeechSynthesisUtterance(beat.text);
    const v = pickSpeechVoice(c); if (v) u.voice = v;
    u.lang = "de-DE"; u.rate = (c.rate || 1) * CFG.speechRate; u.pitch = c.pitch || 1;
    u.onend = advance;
    u.onerror = () => gapTimerStartFor(estimate(beat.text), myToken, advance);
    try { synth.cancel(); synth.speak(u); } catch (e) { gapTimerStartFor(estimate(beat.text), myToken, advance); }
  } else {
    finishType = typeText(typeTarget, beat.text, estimate(beat.text));
    gapTimerStartFor(estimate(beat.text), myToken, advance);
  }

  // expose finisher for manual skip
  playBeat._finish = () => finishType && finishType();
}

function isSystem(beat) { return (CHARACTERS[beat.who] || {}).kind === "system"; }

function gapTimerStartFor(ms, myToken, advance) {
  clearGap();
  gapTimer = setTimeout(() => { if (myToken === token && !paused) advance(); }, ms);
}

function bubbleXFor(beat) {
  // place bubble horizontally over the speaker, clamped
  const pos = POS[beat.stage.chars.length] || POS[5];
  const k = beat.stage.chars.indexOf(beat.who);
  let x = (pos[k] && pos[k][0]) || 50;
  return Math.max(26, Math.min(74, x));
}

/* music ducking */
const music = document.getElementById("music");
let musicOK = false;
function duck(on) {
  if (!musicOK) return;
  const target = on ? CFG.musicVol * 0.55 : CFG.musicVol;
  try { music.volume = target; } catch (e) {}
}

function finish() {
  stopAudio();
  setProgress(true);
  elRec.classList.add("stopped");
  if (musicOK) fadeMusic(0, 1500);
  document.getElementById("end").hidden = false;
}

function next() { stopAudio(); paused = false; document.body.classList.remove("paused"); playBeat(idx + 1); }
function prev() { stopAudio(); paused = false; document.body.classList.remove("paused"); playBeat(Math.max(0, idx - 1)); }

function togglePause() {
  if (!started) return;
  paused = !paused;
  document.body.classList.toggle("paused", paused);
  document.getElementById("btnPause").textContent = paused ? "▶" : "⏸";
  if (paused) {
    clearGap();
    if (curAudio) { try { curAudio.pause(); } catch (e) {} }
    try { synth && synth.paused === false && synth.pause(); } catch (e) {}
    stopTimecode();
  } else {
    if (curAudio) { curAudio.play().catch(() => {}); }
    else if (synth && synth.paused) { try { synth.resume(); } catch (e) {} }
    else playBeat(idx);   // restart timer-based beat
    startTimecode();
  }
}

/* ============================================================
   Progress dots (per act)
   ============================================================ */
const elProg = document.getElementById("progress");
(function buildProgress() {
  let acts = [], cur = null;
  beats.forEach(b => { if (b.act !== cur) { cur = b.act; acts.push(b.act); } });
  // we only have one channel string; use act labels instead
})();
function setProgress(done) {
  const pct = done ? 100 : (idx + 1) / beats.length * 100;
  elProg.style.width = pct + "%";
}

/* ============================================================
   Timecode
   ============================================================ */
let tcBase = 14 * 60 + 22, tcStart = 0, tcRAF = null, tcPausedAcc = 0, tcPauseT = 0;
function fmtTC(sec) {
  const f = Math.floor((sec % 1) * 25);
  const s = Math.floor(sec) % 60, m = Math.floor(sec / 60) % 60, h = Math.floor(sec / 3600);
  const p = n => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}:${p(f)}`;
}
function tickTC() {
  const t = tcBase + (performance.now() - tcStart - tcPausedAcc) / 1000;
  elTC.textContent = fmtTC(t);
  tcRAF = requestAnimationFrame(tickTC);
}
function startTimecode() {
  if (tcPauseT) { tcPausedAcc += performance.now() - tcPauseT; tcPauseT = 0; }
  if (!tcStart) tcStart = performance.now();
  if (!tcRAF) tcRAF = requestAnimationFrame(tickTC);
}
function stopTimecode() { if (tcRAF) { cancelAnimationFrame(tcRAF); tcRAF = null; } tcPauseT = performance.now(); }

/* ============================================================
   Music helpers
   ============================================================ */
function fadeMusic(to, ms) {
  const from = music.volume, steps = Math.max(1, Math.round(ms / 40)); let n = 0;
  const iv = setInterval(() => {
    n++; music.volume = Math.max(0, Math.min(1, from + (to - from) * (n / steps)));
    if (n >= steps) clearInterval(iv);
  }, 40);
}

/* ============================================================
   Start / controls
   ============================================================ */
async function start() {
  document.getElementById("intro").style.display = "none";
  document.getElementById("end").hidden = true;
  document.getElementById("controls").hidden = false;
  started = true; paused = false;

  // voice mode
  if (window._forceSilent) voiceMode = "silent";
  else voiceMode = (await detectVoiceFiles()) ? "file" : (synth ? "speech" : "silent");
  updateVoiceBtn();

  // music: fire-and-forget (darf den Start nie blockieren)
  try {
    music.volume = 0;
    music.play().then(() => { musicOK = true; fadeMusic(CFG.musicVol, 1200); }).catch(() => { musicOK = false; });
  } catch (e) { musicOK = false; }
  // unlock speech on iOS within gesture
  if (voiceMode === "speech") { try { synth.cancel(); } catch (e) {} }

  startTimecode();
  playBeat(0);
}

function updateVoiceBtn() {
  const b = document.getElementById("btnVoice");
  if (!b) return;
  b.textContent = voiceMode === "silent" ? "🔇" : (voiceMode === "file" ? "🎙️" : "🗣️");
  b.title = voiceMode === "silent" ? "Stimmen aus (Untertitel + Musik)" :
            voiceMode === "file" ? "Studio-Stimmen (gerendert)" : "Browserstimmen";
}
function cycleVoice() {
  const order = ["file", "speech", "silent"];
  // only offer 'file' if available
  const avail = fileIds.size ? order : ["speech", "silent"];
  let k = avail.indexOf(voiceMode); k = (k + 1) % avail.length;
  voiceMode = avail[k];
  updateVoiceBtn();
  if (started && !paused) { stopAudio(); playBeat(idx); }
}

function toggleFs() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("replayBtn").addEventListener("click", () => { tcStart = 0; tcPausedAcc = 0; start(); });
elWeiter.addEventListener("click", () => {
  // first click finishes typing, else advances
  if (playBeat._finish && document.querySelector(".caret:not(.done)")) playBeat._finish();
  else next();
});
document.getElementById("btnNext").addEventListener("click", next);
document.getElementById("btnPrev").addEventListener("click", prev);
document.getElementById("btnPause").addEventListener("click", togglePause);
document.getElementById("btnVoice").addEventListener("click", cycleVoice);
document.getElementById("btnFs").addEventListener("click", toggleFs);

window.addEventListener("keydown", e => {
  if (!started) { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); start(); } return; }
  if (e.code === "Space") { e.preventDefault(); togglePause(); }
  else if (e.code === "ArrowRight" || e.code === "Enter") { e.preventDefault(); next(); }
  else if (e.code === "ArrowLeft") { e.preventDefault(); prev(); }
  else if (e.key.toLowerCase() === "f") toggleFs();
  else if (e.key.toLowerCase() === "v") cycleVoice();
  else if (e.key.toLowerCase() === "r") { tcStart = 0; tcPausedAcc = 0; start(); }
});
window.addEventListener("beforeunload", () => { try { synth && synth.cancel(); } catch (e) {} });

console.log(`Akte Agile · ${beats.length} Beats · grobe Laufzeit ≈ ` +
  Math.round(beats.reduce((s, b) => s + estimate(b.text) + CFG.gapAfter, 0) / 1000) + "s (Schätzung ohne Audio)");
