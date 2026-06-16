/* ============================================================
   Agile · animierte Story
   ------------------------------------------------------------
   Selbstständige Web-Story mit KI-Voiceover (Web Speech API).
   Keine persönlichen Aufnahmen, kein externer Dienst nötig.

   ► Inhalte anpassen:  unten in CONFIG und SCENES.
   ► Tempo der Stimme:  CONFIG.rate  (kleiner = langsamer/länger).
   ► Eigene Studio-Stimme statt Browser-TTS:  siehe README.md
   ============================================================ */

const CONFIG = {
  lang: "de-DE",
  rate: 0.92,      // Sprechtempo (0.9–1.0 wirkt natürlich; kleiner = längeres Video)
  pitch: 1.0,
  // Outro / Credits — hier eure Namen & euren Link eintragen:
  authors: "Gruppe D · David Egeler · Marianne Wiederkehr · Inas Kassem · Jonas Russi",
  course: "Agile Methoden",
  ctaText: null,   // z.B. "Mehr erfahren" — oder null = ausblenden
  ctaUrl: "#"
};

/* ------------------------------------------------------------
   SCENES — jede Szene hat: bg-Farben, kicker, headline, art (HTML)
   und lines[] (gesprochen + als Untertitel angezeigt).
   In art[]: Elemente mit data-step="N" erscheinen, sobald die
   N-te Zeile der Szene gesprochen wird (0-basiert).
   ------------------------------------------------------------ */
const SCENES = [
  {
    id: "intro",
    bg: ["#1a1148", "#2a1a6e"],
    kicker: CONFIG.course,
    headline: 'Ein Wort, das dein <em>Studium</em> und deinen <em>Job</em> verändert.',
    art: `<div class="hero pop">⚡</div>`,
    lines: [
      "Stell dir vor, ein einziges Wort macht dein Studium und deinen Job spürbar entspannter.",
      "Dieses Wort heisst: agil.",
      "Agilität klingt erst mal nach einem schicken Büro-Buzzword.",
      "Aber dahinter steckt eine richtig simple und mächtige Idee.",
      "In den nächsten Minuten zeigen wir dir, wo sie dir ganz konkret weiterhilft.",
      "Egal ob im Hörsaal, im Gruppenprojekt oder im Büro – das Prinzip bleibt gleich."
    ]
  },
  {
    id: "chaos",
    bg: ["#3a0d18", "#5b1224"],
    kicker: "Kommt dir das bekannt vor?",
    headline: "Alles auf den letzten Drücker.",
    art: `
      <div class="stage-person">
        <div class="me">😰</div>
        <div class="orbit reveal" data-step="3" style="top:4%;left:14%">📚</div>
        <div class="orbit reveal" data-step="3" style="top:10%;right:12%">☕</div>
        <div class="orbit reveal" data-step="3" style="bottom:14%;left:8%">🌙</div>
        <div class="orbit reveal" data-step="3" style="bottom:8%;right:14%">⏰</div>
        <div class="orbit reveal" data-step="5" style="top:42%;right:2%">💥</div>
        <div class="orbit reveal" data-step="4" style="top:46%;left:0%">❓</div>
      </div>`,
    lines: [
      "Das hier ist Lena. Sie studiert – und arbeitet nebenbei in einem Betrieb.",
      "Ihr grosses Semesterprojekt läuft so ab: Drei Monate lang passiert fast nichts.",
      "Und dann, kurz vor der Abgabe, soll plötzlich alles auf einmal fertig sein.",
      "Die Nacht davor: Chaos, kalter Kaffee und ganz viel Panik.",
      "Niemand im Team weiss so richtig, wer gerade was macht.",
      "Und das erste echte Feedback kommt erst ganz am Schluss – wenn es zu spät ist.",
      "Genau so fühlt sich starres, klassisches Planen oft an.",
      "Vielleicht kennst du dieses Gefühl ja aus deinem eigenen Studium."
    ]
  },
  {
    id: "shift",
    bg: ["#0b2545", "#13315c"],
    kicker: "Es geht auch anders",
    headline: 'Weniger Stress. <em>Mehr Überblick.</em>',
    art: `
      <div class="field">
        <span class="e">🌫️</span>
        <span class="e reveal" data-step="1" style="font-size:1.4em">➡️</span>
        <span class="e reveal" data-step="2" style="font-size:1.4em">💡</span>
      </div>`,
    lines: [
      "Aber geht das nicht auch anders? Ruhiger, klarer, mit weniger Stress?",
      "Doch. Und der Weg dahin hat einen Namen.",
      "Genau hier kommt Agilität ins Spiel."
    ]
  },
  {
    id: "what",
    bg: ["#13243f", "#1d3a66"],
    kicker: "Was heisst eigentlich agil?",
    headline: "Klein liefern statt gross scheitern.",
    art: `
      <div class="versus">
        <div class="vside bad">
          <div class="vt">❌ Klassisch</div>
          <div class="vrow">📦</div>
          <div class="vcap">Ein riesiges Paket — ganz am Ende.</div>
        </div>
        <div class="vside good reveal" data-step="1">
          <div class="vt">✅ Agil</div>
          <div class="vrow">📦📦📦</div>
          <div class="vcap">Viele kleine Ergebnisse — Schritt für Schritt.</div>
        </div>
      </div>`,
    lines: [
      "Agil zu arbeiten heisst: nicht alles auf einmal durchplanen.",
      "Sondern in kleinen, überschaubaren Schritten vorgehen.",
      "Statt einem riesigen Wurf ganz am Ende lieferst du regelmässig kleine Ergebnisse.",
      "Nach jedem Schritt holst du dir Feedback und passt deinen Plan an.",
      "Im Zentrum stehen Menschen, Zusammenarbeit und echte Resultate.",
      "Nicht dicke Konzepte, die in der Schublade verstauben.",
      "Kurz gesagt: lieber oft etwas Kleines fertig, als selten etwas Grosses."
    ]
  },
  {
    id: "loop",
    bg: ["#0e2a2a", "#10403c"],
    kicker: "Das Herzstück",
    headline: "Ein einfacher Kreislauf.",
    art: `
      <div class="loop">
        <div class="ring"></div>
        <div class="core">inspect<br>&amp; adapt</div>
        <div class="node n0 reveal" data-step="1"><span class="ni">📝</span><span class="nt">Planen</span></div>
        <div class="node n1 reveal" data-step="1"><span class="ni">🔨</span><span class="nt">Machen</span></div>
        <div class="node n2 reveal" data-step="1"><span class="ni">🔍</span><span class="nt">Prüfen</span></div>
        <div class="node n3 reveal" data-step="1"><span class="ni">🔄</span><span class="nt">Anpassen</span></div>
      </div>`,
    lines: [
      "Im Kern ist Agilität ein einfacher Kreislauf.",
      "Planen. Machen. Prüfen. Anpassen. Und wieder von vorn.",
      "Fachleute nennen das: inspect and adapt – beobachten und verbessern.",
      "So wird aus einem Fehler schnell eine kleine Lektion.",
      "Und keine grosse Katastrophe kurz vor der Deadline.",
      "Genau dieser Rhythmus nimmt enorm viel Druck raus."
    ]
  },
  {
    id: "studyboard",
    bg: ["#2a1d4e", "#3a2670"],
    kicker: "Agile im Studium · Teil 1",
    headline: "Das Gruppenprojekt als Board.",
    art: `
      <div class="kanban">
        <div class="col todo"><h4>To Do</h4>
          <div class="note reveal" data-step="1">Recherche</div>
          <div class="note reveal" data-step="1">Folien bauen</div>
          <div class="note reveal" data-step="2">Bericht schreiben</div>
        </div>
        <div class="col doing"><h4>In Arbeit</h4>
          <div class="note reveal" data-step="3">Konzept</div>
          <div class="note reveal" data-step="4">Prototyp</div>
        </div>
        <div class="col done"><h4>Fertig ✅</h4>
          <div class="note green reveal" data-step="3">Thema gewählt</div>
          <div class="note green reveal" data-step="4">Aufgaben verteilt</div>
        </div>
      </div>`,
    lines: [
      "Schauen wir, wie Lena das jetzt in ihrem Gruppenprojekt nutzt.",
      "Zuerst sammelt das Team alle Aufgaben an einem Ort – das nennt man Backlog.",
      "Dann teilt es die Arbeit in kurze Etappen auf: sogenannte Sprints, meist ein bis zwei Wochen.",
      "Auf einem Board wandert jede Aufgabe von „To Do“ über „In Arbeit“ zu „Fertig“.",
      "Mit einem Blick sieht jeder: Wer macht was – und wie weit sind wir wirklich?",
      "Kein Versteckspiel mehr und keine bösen Überraschungen.",
      "Plötzlich fühlt sich das Projekt nicht mehr nach einem Berg an, sondern nach machbaren Päckchen."
    ]
  },
  {
    id: "studyretro",
    bg: ["#1d2d50", "#264079"],
    kicker: "Agile im Studium · Teil 2",
    headline: "Kurz reden. Kurz lernen. Besser werden.",
    art: `
      <div class="field">
        <span class="e">🗣️</span>
        <span class="e reveal" data-step="2">👍</span>
        <span class="e reveal" data-step="2">👎</span>
        <span class="e reveal" data-step="2">💡</span>
        <span class="e reveal" data-step="3">⏱️</span>
      </div>`,
    lines: [
      "Einmal pro Woche trifft sich das Team für ein kurzes Standup.",
      "Drei Fragen: Was lief gut? Wo hakt es? Was kommt als Nächstes?",
      "Und am Ende jeder Etappe gibt es eine kurze Retrospektive: Was behalten wir, was verbessern wir?",
      "Übrigens funktioniert das auch beim Lernen: feste Lern-Sprints mit Pausen schlagen jede durchgemachte Nacht.",
      "So lernst du nicht nur den Stoff, sondern auch, wie ihr als Team besser werdet."
    ]
  },
  {
    id: "jobteam",
    bg: ["#102a3c", "#15405c"],
    kicker: "Agile im Job · Teil 1",
    headline: "Im Beruf — dieselbe Idee, nur grösser.",
    art: `
      <div class="field">
        <span class="e">👩‍💻</span>
        <span class="e">👨‍💻</span>
        <span class="e reveal" data-step="2" style="font-size:1.3em">🚀</span>
        <span class="e reveal" data-step="3">🙋</span>
        <span class="e reveal" data-step="3">💬</span>
      </div>`,
    lines: [
      "Und im Job? Dort ist es genau dieselbe Idee – nur eine Nummer grösser.",
      "Ein Team startet jeden Morgen mit einem kurzen Daily Standup.",
      "Alle paar Wochen wird etwas Fertiges ausgeliefert und den Kunden gezeigt.",
      "Statt einem riesigen Knall ganz am Ende gibt es früh ehrliches Feedback.",
      "So merkt das Team schnell, ob es das Richtige baut – und entwickelt nicht am Bedarf vorbei.",
      "Genau deshalb arbeiten heute unzählige Firmen mit Scrum oder Kanban."
    ]
  },
  {
    id: "jobbeyond",
    bg: ["#27143f", "#3d1f63"],
    kicker: "Agile im Job · Teil 2",
    headline: "Längst nicht mehr nur für die IT.",
    art: `
      <div class="chips">
        <span class="chip">📣 Marketing</span>
        <span class="chip reveal" data-step="2">🎪 Events</span>
        <span class="chip reveal" data-step="2">🔬 Forschung</span>
        <span class="chip reveal" data-step="2">🏠 Alltag</span>
        <span class="chip tool reveal" data-step="4">Trello</span>
        <span class="chip tool reveal" data-step="4">Jira</span>
        <span class="chip tool reveal" data-step="4">Notion</span>
      </div>`,
    lines: [
      "Das Beste: Agilität ist längst nicht mehr nur etwas für die IT.",
      "Marketing-Teams planen ihre Kampagnen heute in Sprints.",
      "Eventplanung, Forschung und sogar dein eigener Alltag lassen sich agil organisieren.",
      "Mit einem persönlichen Kanban-Board behältst du deine To-Dos im Griff.",
      "Tools wie Trello, Jira oder Notion machen die Arbeit für alle sichtbar.",
      "Agilität ist also keine Software – es ist eine Art zu denken.",
      "Und wer einmal so arbeitet, will selten wieder zurück zum alten Chaos."
    ]
  },
  {
    id: "recap",
    bg: ["#0d2030", "#123a4a"],
    kicker: "Konkret für dich",
    headline: "Das kannst du ab morgen ausprobieren.",
    art: `
      <div class="checklist">
        <div class="check reveal" data-step="1"><span class="box"></span><span><span class="num">1.</span> Grosse Aufgaben in kleine Schritte zerlegen</span></div>
        <div class="check reveal" data-step="2"><span class="box"></span><span><span class="num">2.</span> Ein Board nutzen, um den Überblick zu behalten</span></div>
        <div class="check reveal" data-step="3"><span class="box"></span><span><span class="num">3.</span> In festen Etappen statt auf den letzten Drücker arbeiten</span></div>
        <div class="check reveal" data-step="4"><span class="box"></span><span><span class="num">4.</span> Früh und regelmässig Feedback holen</span></div>
        <div class="check reveal" data-step="5"><span class="box"></span><span><span class="num">5.</span> Kurz zurückschauen und stetig besser werden</span></div>
      </div>`,
    lines: [
      "Fassen wir zusammen, was du ab morgen ausprobieren kannst.",
      "Erstens: Zerlege grosse Aufgaben in kleine, machbare Schritte.",
      "Zweitens: Nutze ein Board, um jederzeit den Überblick zu behalten.",
      "Drittens: Arbeite in festen Etappen statt auf den letzten Drücker.",
      "Viertens: Hol dir früh und regelmässig Feedback.",
      "Und fünftens: Schau kurz zurück und werde mit jedem Mal ein bisschen besser."
    ]
  },
  {
    id: "outro",
    bg: ["#1a1148", "#2a1a6e"],
    kicker: "Zum Schluss",
    headline: 'Agil ist kein Werkzeug. <em>Agil ist eine Haltung.</em>',
    art: `<div class="hero">⚡</div>
      <div class="credits reveal" data-step="2" id="credits"></div>`,
    lines: [
      "Agil ist kein Werkzeug. Agil ist eine Haltung.",
      "Du musst nicht dein ganzes Leben auf einmal umkrempeln.",
      "Fang einfach klein an – beim nächsten Projekt, im Studium oder im Job.",
      "Und vielleicht wird deine nächste Deadline ja richtig entspannt.",
      "Danke fürs Zuschauen."
    ]
  }
];

/* ============================================================
   Build scene DOM
   ============================================================ */
const stage = document.getElementById("stage");
const steps = []; // flattened: {si, li, text}

SCENES.forEach((sc, si) => {
  const el = document.createElement("section");
  el.className = "scene";
  el.id = "scene-" + sc.id;
  el.dataset.si = si;
  el.innerHTML = `
    <div class="kicker">${sc.kicker || ""}</div>
    <h2 class="headline display">${sc.headline || ""}</h2>
    <div class="art">${sc.art || ""}</div>`;
  stage.appendChild(el);
  sc._el = el;
  sc.lines.forEach((text, li) => steps.push({ si, li, text }));
});

// fill credits in outro
const creditsEl = document.getElementById("credits");
if (creditsEl) {
  creditsEl.innerHTML =
    `${CONFIG.authors}<br>${CONFIG.course}` +
    (CONFIG.ctaText ? `<br><a class="cta" href="${CONFIG.ctaUrl}" target="_blank" rel="noopener">${CONFIG.ctaText} →</a>` : "");
}

/* ambient particles */
(function () {
  const amb = document.getElementById("ambient");
  for (let i = 0; i < 36; i++) {
    const d = document.createElement("div");
    d.className = "dot";
    d.style.left = Math.random() * 100 + "vw";
    const dur = 9 + Math.random() * 12;
    d.style.animationDuration = dur + "s";
    d.style.animationDelay = -Math.random() * dur + "s";
    const s = 2 + Math.random() * 5;
    d.style.width = d.style.height = s + "px";
    amb.appendChild(d);
  }
})();

/* ============================================================
   Voice (Web Speech API) with robust fallback timer
   ============================================================ */
const synth = window.speechSynthesis;
let voices = [], voice = null, muted = false;

function pickVoice() {
  voices = synth ? synth.getVoices() : [];
  const de = voices.filter(v => /^de/i.test(v.lang));
  // Prefer a natural-sounding German voice
  voice =
    de.find(v => /google/i.test(v.name)) ||
    de.find(v => /(petra|anna|markus|helena|katja|conrad|premium|neural)/i.test(v.name)) ||
    de[0] || null;
  buildVoiceMenu(de);
}
function buildVoiceMenu(de) {
  const sel = document.getElementById("voicePick");
  if (!sel) return;
  sel.innerHTML = "";
  if (!de.length) { sel.hidden = true; return; }
  de.forEach((v, i) => {
    const o = document.createElement("option");
    o.value = v.name; o.textContent = v.name.replace(/\(.*?\)/g, "").trim() || v.name;
    if (voice && v.name === voice.name) o.selected = true;
    sel.appendChild(o);
  });
  sel.onchange = () => { voice = de.find(v => v.name === sel.value) || voice; };
}
if (synth) {
  pickVoice();
  synth.onvoiceschanged = pickVoice;
}

// rough spoken duration estimate (ms) — used as fallback pacing
function estimate(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(2200, (words / (2.6 * CONFIG.rate)) * 1000 + 550);
}

/* ============================================================
   Player engine
   ============================================================ */
let cur = -1;            // current step index
let token = 0;           // guards against stale onend/timers
let timer = null;        // fallback / safety timer
let paused = false;
let started = false;
let endTimer = null;

const captionBox = document.getElementById("captionText");
const progressFill = document.getElementById("progressFill");
const controls = document.getElementById("controls");

function clearTimers() { if (timer) { clearTimeout(timer); timer = null; } }

function setActiveScene(si) {
  SCENES.forEach((sc, i) => sc._el.classList.toggle("active", i === si));
  // adjust background
  const sc = SCENES[si];
  document.body.style.setProperty("--bg1", sc.bg[0]);
  document.body.style.setProperty("--bg2", sc.bg[1]);
  document.getElementById("stage").style.background =
    `radial-gradient(130% 100% at 50% 0%, ${sc.bg[1]} 0%, ${sc.bg[0]} 60%, #05070f 100%)`;
}

function revealUpTo(si, li) {
  SCENES[si]._el.querySelectorAll(".reveal").forEach(el => {
    const need = parseInt(el.dataset.step || "0", 10);
    el.classList.toggle("in", li >= need);
  });
}

function showCaption(text) {
  captionBox.classList.remove("show");
  // small delay for the fade
  requestAnimationFrame(() => {
    captionBox.textContent = text;
    requestAnimationFrame(() => captionBox.classList.add("show"));
  });
}

function setProgress() {
  progressFill.style.width = ((cur + 1) / steps.length) * 100 + "%";
}

function playStep(i) {
  clearTimers();
  if (i >= steps.length) return finish();
  if (i < 0) i = 0;
  cur = i;
  const step = steps[i];
  const prevSi = i > 0 ? steps[i - 1].si : -1;

  if (step.si !== prevSi || !started) setActiveScene(step.si);
  revealUpTo(step.si, step.li);
  showCaption(step.text);
  setProgress();

  const myToken = ++token;
  const advance = () => { if (myToken === token && !paused) playStep(cur + 1); };

  const canSpeak = synth && voice && !muted;
  if (canSpeak) {
    try { synth.cancel(); } catch (e) {}
    const u = new SpeechSynthesisUtterance(step.text);
    u.voice = voice; u.lang = CONFIG.lang;
    u.rate = CONFIG.rate; u.pitch = CONFIG.pitch; u.volume = 1;
    u.onend = advance;
    u.onerror = () => { /* fall back to timer below */ };
    // safety net in case onend never fires (Chrome long-utterance bug, stalls)
    timer = setTimeout(advance, estimate(step.text) * 2.4 + 4000);
    try { synth.speak(u); } catch (e) { clearTimers(); timer = setTimeout(advance, estimate(step.text)); }
  } else {
    // no voice / muted → silent film pacing
    timer = setTimeout(advance, estimate(step.text));
  }
}

function finish() {
  clearTimers();
  try { synth && synth.cancel(); } catch (e) {}
  captionBox.classList.remove("show");
  progressFill.style.width = "100%";
  setTimeout(() => { document.getElementById("end").hidden = false; }, 700);
}

/* ----- transport ----- */
function nextScene() {
  const si = steps[cur] ? steps[cur].si : 0;
  // jump to first step of next scene
  let i = cur + 1;
  while (i < steps.length && steps[i].si === si) i++;
  playStep(Math.min(i, steps.length));
}
function prevScene() {
  const si = steps[cur] ? steps[cur].si : 0;
  // first step of current scene, or previous scene if already at start
  let firstOfCur = cur;
  while (firstOfCur > 0 && steps[firstOfCur - 1].si === si) firstOfCur--;
  if (cur === firstOfCur && firstOfCur > 0) {
    const prevSi = steps[firstOfCur - 1].si;
    let j = firstOfCur - 1;
    while (j > 0 && steps[j - 1].si === prevSi) j--;
    playStep(j);
  } else {
    playStep(firstOfCur);
  }
}

function togglePause() {
  if (!started) return;
  paused = !paused;
  document.body.classList.toggle("paused", paused);
  document.getElementById("btnPause").textContent = paused ? "▶" : "⏸";
  if (paused) {
    clearTimers();
    try { synth && synth.pause(); } catch (e) {}
  } else {
    if (synth && voice && !muted && synth.paused) {
      try { synth.resume(); } catch (e) {}
      // re-arm safety timer
      const myToken = token;
      timer = setTimeout(() => { if (myToken === token && !paused) playStep(cur + 1); },
        estimate(steps[cur].text) * 2.4 + 4000);
    } else {
      playStep(cur); // restart current step pacing
    }
  }
}

function toggleMute() {
  muted = !muted;
  document.getElementById("btnMute").textContent = muted ? "🔇" : "🔊";
  const music = document.getElementById("music");
  if (muted) { try { synth && synth.cancel(); } catch (e) {} if (music) music.muted = true; }
  else if (music) music.muted = false;
  if (started && !paused) playStep(cur); // re-pace current step in the new mode
}

function toggleFs() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

/* ----- start / replay ----- */
function startStory() {
  document.getElementById("start").style.display = "none";
  document.getElementById("end").hidden = true;
  controls.hidden = false;
  started = true; paused = false; muted = false;
  document.body.classList.remove("paused");
  document.getElementById("btnPause").textContent = "⏸";

  // optional background music
  const music = document.getElementById("music");
  if (music) { music.volume = 0.16; music.play().catch(() => {}); }

  // warn if no TTS voice is available
  if (!synth || !voice) {
    document.getElementById("ttsWarn") && (document.getElementById("ttsWarn").hidden = false);
  }
  playStep(0);
}

document.getElementById("startBtn").addEventListener("click", startStory);
document.getElementById("replayBtn").addEventListener("click", () => { startStory(); });
document.getElementById("btnPrev").addEventListener("click", () => { paused = false; document.body.classList.remove("paused"); document.getElementById("btnPause").textContent = "⏸"; prevScene(); });
document.getElementById("btnNext").addEventListener("click", () => { paused = false; document.body.classList.remove("paused"); document.getElementById("btnPause").textContent = "⏸"; nextScene(); });
document.getElementById("btnPause").addEventListener("click", togglePause);
document.getElementById("btnMute").addEventListener("click", toggleMute);
document.getElementById("btnFs").addEventListener("click", toggleFs);

window.addEventListener("keydown", e => {
  if (!started) { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); startStory(); } return; }
  if (e.code === "Space") { e.preventDefault(); togglePause(); }
  else if (e.code === "ArrowRight") { e.preventDefault(); paused = false; document.body.classList.remove("paused"); document.getElementById("btnPause").textContent = "⏸"; nextScene(); }
  else if (e.code === "ArrowLeft") { e.preventDefault(); paused = false; document.body.classList.remove("paused"); document.getElementById("btnPause").textContent = "⏸"; prevScene(); }
  else if (e.key === "f" || e.key === "F") toggleFs();
  else if (e.key === "m" || e.key === "M") toggleMute();
  else if (e.key === "r" || e.key === "R") startStory();
});

// Chrome safety: cancel speech on unload so it doesn't keep talking
window.addEventListener("beforeunload", () => { try { synth && synth.cancel(); } catch (e) {} });

// log estimated total runtime to the console for tuning
console.log(`Agile-Story · ${steps.length} Schritte · geschätzte Laufzeit ≈ ` +
  Math.round(steps.reduce((s, st) => s + estimate(st.text), 0) / 1000) + "s");
