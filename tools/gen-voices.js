#!/usr/bin/env node
/* ============================================================
   Stimmen-Generator (macOS)
   Rendert pro Drehbuch-Zeile eine Audiodatei mit der jeweiligen
   Figuren-Stimme (macOS "say") und legt sie unter assets/voice/ ab.

   Voraussetzung: macOS mit den deutschen Stimmen
   (Systemeinstellungen → Bedienungshilfen → Gesprochene Inhalte →
    Systemstimme → Anpassen … → Deutsch). Für beste Qualität die
   Stimmen Eddy, Rocko, Sandy, Shelley, Reed, Grandpa, Anna laden.

   Aufruf:  npm run voices      (aus dem Projektordner)
   ============================================================ */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "assets", "voice");
const { CHARACTERS, SCRIPT } = require(path.join(ROOT, "story.js"));

fs.mkdirSync(OUT, { recursive: true });
// evtl. vorhandene MP3 (ElevenLabs) entfernen, damit kein Formate-Mix entsteht
fs.readdirSync(OUT).filter(f => /\.mp3$/.test(f)).forEach(f => fs.unlinkSync(path.join(OUT, f)));

const ids = [];
let made = 0, skipped = 0;

SCRIPT.forEach((b, i) => {
  const c = CHARACTERS[b.who];
  if (!c || !c.voice || c.kind === "system") { skipped++; return; }

  const aiff = path.join(OUT, `_tmp.aiff`);
  const m4a = path.join(OUT, `${i}.m4a`);
  const rate = Math.round(180 * (c.rate || 1));
  const text = b.text.replace(/\s+/g, " ").trim();

  try {
    execFileSync("say", ["-v", c.voice, "-r", String(rate), "-o", aiff, text], { stdio: "ignore" });
    execFileSync("afconvert", [aiff, m4a, "-d", "aac", "-f", "m4af"], { stdio: "ignore" });
    fs.unlinkSync(aiff);
    ids.push(i);
    made++;
    process.stdout.write(`  ✓ [${i}] ${c.name.padEnd(14)} ${text.slice(0, 48)}\n`);
  } catch (e) {
    process.stdout.write(`  ✗ [${i}] ${c.name} — Stimme "${c.voice}" nicht verfügbar?\n`);
  }
});

fs.writeFileSync(path.join(OUT, "manifest.json"),
  JSON.stringify({ format: "m4a", ids }, null, 0));

console.log(`\nFertig: ${made} Stimmen erzeugt, ${skipped} übersprungen.`);
console.log(`Dateien in assets/voice/  ·  manifest.json geschrieben.`);
