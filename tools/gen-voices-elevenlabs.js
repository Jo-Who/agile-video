#!/usr/bin/env node
/* ============================================================
   Stimmen-Generator · ElevenLabs (natürliche neuronale Stimmen)
   ------------------------------------------------------------
   Rendert pro Drehbuch-Zeile eine MP3 mit einer natürlichen
   Stimme pro Figur. Deckt mit ~3'000 Zeichen den GRATIS-Tarif ab.

   1) Gratis-Account: https://elevenlabs.io  → Profile → API Key
   2) Im Projektordner ausführen:
        ELEVENLABS_API_KEY=dein_key npm run voices:11
      (Stimmen-Liste deines Accounts:  npm run voices:list)

   Jede Figur wird automatisch einer eigenen Stimme zugeordnet.
   Zuordnung unten in VOICE_MAP anpassbar (Name aus deinem Account).
   ============================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "assets", "voice");
const { CHARACTERS, SCRIPT } = require(path.join(ROOT, "story.js"));

const KEY = process.env.ELEVENLABS_API_KEY;
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

// Wunsch-Stimme pro Figur (Name muss in deinem ElevenLabs-Account sein).
// Findet er den Namen nicht, verteilt das Script automatisch andere Stimmen.
const VOICE_MAP = {
  narrator: "George",     // Warm, Captivating Storyteller — dokumentarisch
  jonas:    "Liam",       // Energetic
  david:    "Callum",     // Husky
  inas:     "Alice",      // Clear, Engaging Educator
  marianne: "Lily",       // Velvety Actress
  dozentin: "Matilda",    // Knowledgable, Professional
  chef:     "Adam"        // Dominant, Firm
};

// pro Figur etwas Charakter über die Voice-Settings
const SETTINGS = {
  narrator: { stability: 0.45, similarity_boost: 0.8, style: 0.15 },
  _default: { stability: 0.4,  similarity_boost: 0.75, style: 0.25 }
};

async function listVoices() {
  const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": KEY } });
  if (!r.ok) throw new Error("Stimmen-Liste fehlgeschlagen: " + r.status + " " + (await r.text()).slice(0, 200));
  const j = await r.json();
  return j.voices.map(v => ({ name: v.name, id: v.voice_id }));
}

async function main() {
  if (!KEY) {
    console.error("✗ Kein API-Key. So starten:\n    ELEVENLABS_API_KEY=dein_key npm run voices:11");
    process.exit(1);
  }
  const voices = await listVoices();
  // Namen wie "George - Warm, Storyteller" → per Präfix matchen
  const findByName = want => {
    want = (want || "").toLowerCase().trim();
    if (!want) return null;
    const hit = voices.find(v => v.name.toLowerCase().split(" - ")[0].trim() === want)
             || voices.find(v => v.name.toLowerCase().startsWith(want));
    return hit ? hit.id : null;
  };
  const byName = { get: findByName, has: w => !!findByName(w) };

  if (process.argv.includes("--list")) {
    console.log("Stimmen in deinem Account:\n" + voices.map(v => "  • " + v.name).join("\n"));
    return;
  }

  // Charakter → voiceId auflösen (mit Fallback-Verteilung)
  const pool = voices.map(v => v.id);
  let pi = 0;
  const resolved = {};
  Object.keys(CHARACTERS).forEach(id => {
    const want = (VOICE_MAP[id] || "").toLowerCase();
    resolved[id] = byName.get(want) || pool[(pi++) % pool.length];
  });
  console.log("Zuordnung:");
  Object.keys(VOICE_MAP).forEach(id =>
    console.log(`  ${(CHARACTERS[id]?.name || id).padEnd(16)} → ${byName.has((VOICE_MAP[id]||'').toLowerCase()) ? VOICE_MAP[id] : "(Auto-Stimme)"}`));

  fs.mkdirSync(OUT, { recursive: true });
  // alte m4a entfernen, damit kein Mischmasch entsteht
  fs.readdirSync(OUT).filter(f => /\.m4a$/.test(f)).forEach(f => fs.unlinkSync(path.join(OUT, f)));

  async function render(text, who, outName) {
    const voiceId = resolved[who];
    const vs = SETTINGS[who] || SETTINGS._default;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.replace(/\s+/g, " ").trim(), model_id: MODEL, voice_settings: { ...vs, use_speaker_boost: true } })
    });
    if (!r.ok) { console.log(`  ✗ ${outName}: ${r.status} ${(await r.text()).slice(0, 120)}`); return false; }
    fs.writeFileSync(path.join(OUT, `${outName}.mp3`), Buffer.from(await r.arrayBuffer()));
    await new Promise(rr => setTimeout(rr, 250)); // sanftes Rate-Limit
    return true;
  }

  const ids = [];
  let made = 0;
  for (let i = 0; i < SCRIPT.length; i++) {
    const b = SCRIPT[i];
    const c = CHARACTERS[b.who];
    if (!c || c.kind === "system") continue;
    if (await render(b.text, b.who, `${i}`)) {
      ids.push(i); made++;
      process.stdout.write(`  ✓ [${i}] ${c.name.padEnd(14)} ${b.text.replace(/\s+/g,' ').slice(0, 44)}\n`);
    }
    if (b.quiz) {
      await render(b.quiz.okText, b.quiz.okWho, `${i}_ok`);
      await render(b.quiz.noText, b.quiz.noWho, `${i}_no`);
      made += 2;
      process.stdout.write(`     ↳ Quiz-Feedback  ${i}_ok (${CHARACTERS[b.quiz.okWho].name}) · ${i}_no (${CHARACTERS[b.quiz.noWho].name})\n`);
    }
  }

  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ format: "mp3", ids }, null, 0));
  console.log(`\nFertig: ${made} Stimmen erzeugt (MP3). manifest.json aktualisiert.`);
  console.log("Tipp: zum Vergleich kannst du jederzeit mit  npm run voices  wieder die Mac-Stimmen erzeugen.");
}

main().catch(e => { console.error("Fehler:", e.message); process.exit(1); });
