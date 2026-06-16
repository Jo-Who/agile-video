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
      i, who: b.who, text: b.text, statement: b.statement, quiz: b.quiz,
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
    <div class="sweep"></div>
    <div class="flash"></div>

    <div class="chrome">
      <div class="rec"><span class="recdot"></span>REC</div>
      <div class="channel"></div>
    </div>
    <div class="place"></div>
    <div class="timecode">00:00:00:00</div>

    <div class="props"></div>
    <div class="cast"></div>
    <div class="bubble-layer"></div>
    <div class="statement"></div>
    <div class="quiz"></div>

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
const elFlash    = root.querySelector(".flash");
const elStatement= root.querySelector(".statement");
const elQuiz     = root.querySelector(".quiz");
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
function typeText(el, text, durationMs, onChar) {
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
    if (onChar && /\S/.test(chars[n - 1] || "")) onChar();
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
   WebAudio — prozeduraler Score + Soundeffekte (kein Copyright)
   ============================================================ */
const Sfx = (() => {
  let ctx = null, master = null, ambGain = null, padNodes = [], lastTick = 0;
  let delay = null, genToken = 0, scale = [];
  // Tonleitern pro Stimmung (Hz) — generativ, nicht statisch
  const MOODS = {
    neutral: [146.83, 220.00, 246.94, 293.66, 329.63],
    tense:   [110.00, 130.81, 164.81, 196.00, 220.00],   // a-moll, gespannt
    dark:    [98.00, 116.54, 146.83, 174.61, 196.00],
    hope:    [130.81, 164.81, 196.00, 261.63, 329.63],    // C-Dur, hoffnungsvoll
    bright:  [146.83, 185.00, 220.00, 293.66, 369.99],    // D-Dur, hell
    warm:    [130.81, 164.81, 196.00, 246.94, 329.63]
  };
  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      ambGain = ctx.createGain(); ambGain.gain.value = 0.9; ambGain.connect(master);
      // "Raum": Feedback-Delay für Hall-Andeutung
      delay = ctx.createDelay(1.0); delay.delayTime.value = 0.32;
      const fb = ctx.createGain(); fb.gain.value = 0.34;
      const wet = ctx.createGain(); wet.gain.value = 0.45;
      delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
    } catch (e) { ctx = null; }
  }
  function resume() { if (ctx && ctx.state === "suspended") ctx.resume(); }
  function stopPad() {
    padNodes.forEach(n => { try { n.g.gain.setTargetAtTime(0, ctx.currentTime, 0.7); n.o.stop(ctx.currentTime + 2); n.lfo.stop(ctx.currentTime + 2); } catch (e) {} });
    padNodes = [];
  }
  function startPad(freqs) {
    stopPad();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 480; lp.connect(ambGain);
    [freqs[0] * 0.5, freqs[0]].forEach((f, i) => {  // sehr leiser Sub + Grundton
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; o.detune.value = Math.random() * 6 - 3;
      const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(i ? 0.03 : 0.05, ctx.currentTime, 1.6);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.04 + Math.random() * 0.04;
      const lg = ctx.createGain(); lg.gain.value = 0.018; lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(lp); o.start(); lfo.start();
      padNodes.push({ o, g, lfo });
    });
  }
  function pluck(freq) {
    if (!ctx) return; const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = Math.random() < 0.5 ? "sine" : "triangle"; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.09); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    o.connect(g); g.connect(master); if (delay) g.connect(delay);
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.random() * 1.2 - 0.6; g.disconnect(); g.connect(p); p.connect(master); if (delay) p.connect(delay); }
    o.start(t); o.stop(t + 2.6);
  }
  function genLoop(my) {
    if (!ctx || my !== genToken) return;
    if (Math.random() < 0.82) pluck(scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.28 ? 2 : 1));
    setTimeout(() => genLoop(my), 2000 + Math.random() * 2800);
  }
  function ambient(mood) {
    if (!ctx) return;
    scale = MOODS[mood] || MOODS.neutral;
    startPad(scale);
    genToken++; const my = genToken;
    setTimeout(() => genLoop(my), 700);
    ambGain.gain.setTargetAtTime(0.9, ctx.currentTime, 1.0);
  }
  function tone(freq, start, dur, vol, type) {
    const o = ctx.createOscillator(); o.type = type || "sine"; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start); g.gain.exponentialRampToValueAtTime(vol, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(master); o.start(start); o.stop(start + dur + 0.05);
  }
  function whoosh() {
    if (!ctx) return; const t = ctx.currentTime;
    const n = ctx.createBufferSource(), buf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.7;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.10, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.62);
  }
  function impact() {
    if (!ctx) return; const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.5);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.45, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.62);
  }
  function tick() {
    if (!ctx) return; const t = ctx.currentTime; if (t - lastTick < 0.03) return; lastTick = t;
    const o = ctx.createOscillator(); o.type = "square"; o.frequency.value = 1700 + Math.random() * 400;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.008, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.04);
  }
  function correct() { if (!ctx) return; const t = ctx.currentTime;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, 0.25, 0.16, "triangle")); }
  function wrong() { if (!ctx) return; const t = ctx.currentTime; tone(165, t, 0.35, 0.18, "sawtooth"); tone(155, t + 0.02, 0.35, 0.12, "square"); }
  function beep() { if (!ctx) return; const t = ctx.currentTime; tone(880, t, 0.08, 0.07, "square"); tone(1320, t + 0.12, 0.08, 0.07, "square"); }
  function duckAmb(on) { if (ambGain && ctx) ambGain.gain.setTargetAtTime(on ? 0.5 : 0.9, ctx.currentTime, 0.3); }
  function fade() { genToken++; if (ctx) { stopPad(); ambGain.gain.setTargetAtTime(0, ctx.currentTime, 1.4); } }
  function reset() { if (ambGain && ctx) ambGain.gain.setTargetAtTime(0.9, ctx.currentTime, 0.5); }
  return { init, resume, ambient, whoosh, impact, tick, correct, wrong, beep, duckAmb, fade, reset, get ok() { return !!ctx; } };
})();

function moodFor(b) {
  const l = b.label || "";
  if (/VORHER|KLASSISCH|B[ÜU]RO/i.test(l)) return "tense";
  if (/MODUL|WENDEPUNKT/i.test(l)) return "hope";
  if (/NACHHER|JOB|STUDIUM/i.test(l)) return "bright";
  if (/MITMACHEN/i.test(l)) return "hope";
  if (/ENDE/i.test(l)) return "warm";
  return "neutral";
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

let lastActKey = "";
function actChangeEffects(beat) {
  const key = (beat.act || "") + "|" + (beat.label || "");
  if (key === lastActKey) return;
  lastActKey = key;
  elFlash.classList.remove("go"); void elFlash.offsetWidth; elFlash.classList.add("go");
  elScreen.classList.remove("sweepgo"); void elScreen.offsetWidth; elScreen.classList.add("sweepgo");
  Sfx.whoosh(); Sfx.impact(); Sfx.ambient(moodFor(beat));
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
  actChangeEffects(beat);
  if (beat.title) { showTitleCard(beat); Sfx.impact(); }
  setProgress();

  // ---- interaktives Quiz ----
  if (beat.quiz) { renderQuiz(beat, i); playBeat._finish = () => {}; return; }

  renderStage(beat.stage, isNarr ? null : beat.who);

  const myToken = ++token;
  const advance = () => {
    if (myToken !== token || paused) return;
    clearGap();
    gapTimer = setTimeout(() => { if (myToken === token && !paused && started) playBeat(idx + 1); }, CFG.gapAfter);
  };

  // ---- Textziel: Statement / Erzähler / Sprechblase ----
  let typeTarget, finishType;
  elQuiz.className = "quiz"; elQuiz.innerHTML = "";
  if (beat.statement) {
    elBubble.innerHTML = ""; elNarr.className = "narr"; elNarr.innerHTML = "";
    elStatement.className = "statement show"; elStatement.innerHTML = "";
    typeTarget = elStatement;
  } else if (isNarr) {
    elBubble.innerHTML = ""; elStatement.className = "statement"; elStatement.innerHTML = "";
    elNarr.className = "narr show" + (c.kind === "system" ? " credits" : "");
    elNarr.innerHTML = (c.kind === "system")
      ? beat.text.split("\n").map((l, k) => `<div class="cl cl${k}">${l}</div>`).join("")
      : "";
    typeTarget = elNarr;
  } else {
    elNarr.className = "narr"; elNarr.innerHTML = "";
    elStatement.className = "statement"; elStatement.innerHTML = "";
    const x = bubbleXFor(beat.stage, beat.who);
    elBubble.innerHTML = `<div class="bubble" style="left:${x}%;--c:${c.color}">
        <div class="who">${c.name}</div><div class="say"></div></div>`;
    typeTarget = elBubble.querySelector(".say");
    placeTail(beat.stage, beat.who);
  }

  if (c.kind === "system") {
    finishType = () => {};
    duck(false);
    gapTimerStartFor(estimate(beat.text) * 1.4, myToken, advance);
    playBeat._finish = () => {};
    return;
  }

  const useFile = (voiceMode === "file") && fileIds.has(i);
  const useSpeech = (voiceMode === "speech") && synth;

  if (useFile) {
    const a = new Audio(`assets/voice/${i}.${voiceFormat}`);
    curAudio = a;
    duck(true);
    let typed = false;
    const startType = (durMs) => { if (typed) return; typed = true; finishType = typeText(typeTarget, beat.text, durMs, Sfx.tick); };
    a.addEventListener("loadedmetadata", () => {
      const d = (a.duration && isFinite(a.duration)) ? a.duration * 1000 : estimate(beat.text);
      startType(Math.max(900, d * 0.82));
    });
    a.addEventListener("ended", () => { duck(false); advance(); });
    a.addEventListener("error", () => { startType(estimate(beat.text)); gapTimerStartFor(estimate(beat.text), myToken, advance); });
    a.play().catch(() => { startType(estimate(beat.text)); gapTimerStartFor(estimate(beat.text), myToken, advance); });
    setTimeout(() => startType(estimate(beat.text)), 350);
  } else if (useSpeech) {
    finishType = typeText(typeTarget, beat.text, estimate(beat.text), Sfx.tick);
    const u = new SpeechSynthesisUtterance(beat.text);
    const v = pickSpeechVoice(c); if (v) u.voice = v;
    u.lang = "de-DE"; u.rate = (c.rate || 1) * CFG.speechRate; u.pitch = c.pitch || 1;
    u.onend = advance;
    u.onerror = () => gapTimerStartFor(estimate(beat.text), myToken, advance);
    try { synth.cancel(); synth.speak(u); } catch (e) { gapTimerStartFor(estimate(beat.text), myToken, advance); }
  } else {
    finishType = typeText(typeTarget, beat.text, estimate(beat.text), Sfx.tick);
    gapTimerStartFor(estimate(beat.text), myToken, advance);
  }

  playBeat._finish = () => finishType && finishType();
}

/* ---- ein einzelner gesprochener Clip (für Quiz-Feedback) ---- */
function playClip(c, text, fileName, onEnd) {
  stopAudio();
  const finishCb = () => { onEnd && onEnd(); };
  if (voiceMode === "file") {
    const a = new Audio(`assets/voice/${fileName}.${voiceFormat}`);
    curAudio = a;
    a.onended = () => { curAudio = null; finishCb(); };
    a.onerror = () => { curAudio = null; speakOrTimer(); };
    a.play().catch(() => { curAudio = null; speakOrTimer(); });
    return;
  }
  speakOrTimer();
  function speakOrTimer() {
    if (voiceMode !== "silent" && synth) {
      const u = new SpeechSynthesisUtterance(text);
      const v = pickSpeechVoice(c); if (v) u.voice = v;
      u.lang = "de-DE"; u.rate = c.rate || 1; u.pitch = c.pitch || 1;
      u.onend = finishCb; u.onerror = () => setTimeout(finishCb, estimate(text));
      try { synth.cancel(); synth.speak(u); } catch (e) { setTimeout(finishCb, estimate(text)); }
    } else setTimeout(finishCb, estimate(text));
  }
}

function showFeedbackBubble(stage, who, text) {
  const c = CHARACTERS[who];
  elCast.querySelectorAll(".actor").forEach(a => a.classList.toggle("speaking", a.dataset.id === who));
  const x = bubbleXFor(stage, who);
  elBubble.innerHTML = `<div class="bubble" style="left:${x}%;--c:${c.color}">
      <div class="who">${c.name}</div><div class="say">${text}</div></div>`;
  placeTail(stage, who);
}

function renderQuiz(beat, i) {
  const q = beat.quiz;
  renderStage(beat.stage, null);
  elStatement.className = "statement"; elStatement.innerHTML = "";
  elBubble.innerHTML = "";
  elNarr.className = "narr show"; elNarr.innerHTML = "";
  elQuiz.className = "quiz show";
  elQuiz.innerHTML = q.options.map((o, k) =>
    `<button class="qopt" data-k="${k}"><span class="ql">${String.fromCharCode(65 + k)}</span>${o}</button>`).join("");
  const opts = [...elQuiz.querySelectorAll(".qopt")];
  let enabled = false, answered = false;
  const enable = () => { enabled = true; elQuiz.classList.add("ready"); };
  playBeat._enableQuiz = enable;

  opts.forEach(btn => btn.addEventListener("click", () => {
    if (!enabled || answered) return;
    const k = +btn.dataset.k;
    if (k === q.correct) {
      answered = true;
      btn.classList.add("right");
      opts.forEach(b => b.classList.add("locked"));
      Sfx.correct();
      showFeedbackBubble(beat.stage, q.okWho, q.okText);
      playClip(CHARACTERS[q.okWho], q.okText, `${i}_ok`, () => { if (!paused) playBeat(i + 1); });
    } else {
      btn.classList.add("wrong");
      Sfx.wrong();
      showFeedbackBubble(beat.stage, q.noWho, q.noText);
      playClip(CHARACTERS[q.noWho], q.noText, `${i}_no`, () => {
        setTimeout(() => btn.classList.remove("wrong"), 400);
      });
    }
  }));

  // Frage vorlesen (Erzähler), dann Antworten freigeben
  const finishType = typeText(elNarr, beat.text, estimate(beat.text), Sfx.tick);
  playBeat._finish = () => finishType && finishType();
  if (voiceMode === "file" && fileIds.has(i)) {
    const a = new Audio(`assets/voice/${i}.${voiceFormat}`); curAudio = a; duck(true);
    a.addEventListener("ended", () => { duck(false); finishType && finishType(); enable(); });
    a.addEventListener("error", () => { finishType && finishType(); enable(); });
    a.play().catch(() => { finishType && finishType(); enable(); });
    setTimeout(enable, estimate(beat.text) * 2.5 + 4000); // Sicherheitsnetz
  } else if (voiceMode === "speech" && synth) {
    const u = new SpeechSynthesisUtterance(beat.text);
    const v = pickSpeechVoice(CHARACTERS.narrator); if (v) u.voice = v;
    u.lang = "de-DE"; u.rate = CFG.speechRate; u.pitch = 0.9;
    u.onend = enable; u.onerror = enable;
    try { synth.cancel(); synth.speak(u); } catch (e) { enable(); }
  } else setTimeout(enable, estimate(beat.text));
}

function isSystem(beat) { return (CHARACTERS[beat.who] || {}).kind === "system"; }

function gapTimerStartFor(ms, myToken, advance) {
  clearGap();
  gapTimer = setTimeout(() => { if (myToken === token && !paused) advance(); }, ms);
}

function bubbleXFor(stage, who) {
  // place bubble horizontally over the speaker, clamped so it stays on screen
  const pos = POS[stage.chars.length] || POS[5];
  const k = stage.chars.indexOf(who);
  let x = (pos[k] && pos[k][0]) || 50;
  return Math.max(26, Math.min(74, x));
}

// Schwänzchen der Sprechblase auf die sprechende Figur richten.
// Breitenunabhängig: relativ zur Blasenmitte + fixer Versatz für Randfiguren,
// damit es beim Tippen (wachsende Blase) NICHT mitwandert.
function placeTail(stage, who) {
  const bub = elBubble.querySelector(".bubble");
  if (!bub) return;
  const pos = POS[stage.chars.length] || POS[5];
  const k = stage.chars.indexOf(who);
  const spct = (pos[k] && pos[k][0]) || 50;       // echte Figurenposition
  const clamped = bubbleXFor(stage, who);          // Blasen-Mittelpunkt (geklammert)
  const sw = elScreen.getBoundingClientRect().width || 1;
  let delta = (spct - clamped) / 100 * sw;          // Abstand Figur ↔ Blasenmitte in px
  delta = Math.max(-150, Math.min(150, delta));
  bub.style.setProperty("--tailx", `calc(50% + ${delta}px)`);
}

/* Score-Ducking (prozeduraler WebAudio-Score; optionale MP3) */
const USE_MP3_MUSIC = false;   // true + assets/music.mp3 → eigene Musik statt Score
const music = document.getElementById("music");
let musicOK = false;
function duck(on) {
  Sfx.duckAmb(on);
  if (musicOK) { try { music.volume = on ? CFG.musicVol * 0.5 : CFG.musicVol; } catch (e) {} }
}

function finish() {
  stopAudio();
  setProgress(true);
  elRec.classList.add("stopped");
  Sfx.fade();
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
  lastActKey = "";
  elRec.classList.remove("stopped");
  document.getElementById("btnPause").textContent = "⏸";
  document.body.classList.remove("paused");

  // voice mode
  if (window._forceSilent) voiceMode = "silent";
  else voiceMode = (await detectVoiceFiles()) ? "file" : (synth ? "speech" : "silent");
  updateVoiceBtn();

  // prozeduraler Score + Soundeffekte (im User-Gesture initialisieren)
  Sfx.init(); Sfx.resume(); Sfx.reset(); Sfx.beep();

  // optionale MP3-Musik (Standard aus – wir nutzen den Score)
  if (USE_MP3_MUSIC) {
    try { music.volume = 0; music.play().then(() => { musicOK = true; fadeMusic(CFG.musicVol, 1200); }).catch(() => { musicOK = false; }); } catch (e) { musicOK = false; }
  }
  if (voiceMode === "speech") { try { synth.cancel(); } catch (e) {} }

  // Kino-Balken fahren rein, dann startet die Reportage
  document.body.classList.add("cinema");
  startTimecode();
  setTimeout(() => { if (started) playBeat(0); }, 700);
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
document.getElementById("btnRestart").addEventListener("click", () => { tcStart = 0; tcPausedAcc = 0; start(); });
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
