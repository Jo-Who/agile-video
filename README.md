# DIE AKTE AGILE 🎬

Eine **cinematische Mini-Doku** (5–8 Min) zum Thema:
*„Wo seht ihr konkrete Einsatzmöglichkeiten von Agile im Studium und im Job?“*

Im Stil einer Reportage („DOK · Gruppe D"): Letterbox-Balken, **REC**-Anzeige, laufender
Timecode, Film-Grain — Emoji-Figuren mit **Sprechblasen & Namen**, Text der sich **tippt**,
**verschiedene KI-Stimmen pro Figur** und dramatische Musik.

Die Story: Vier Studierende (Jonas, David, Inas, Marianne) machen Projektarbeit erst
**klassisch** (Chaos, alles am Ende) — bis **Dozentin Z. M.** ihnen im Agile-Modul zeigt,
wie es anders geht. Danach: agil im **Studium** und im **Job**.

→ Keine persönlichen Aufnahmen (KI-Stimmen). Läuft auf **PC & Handy**. Einfach Link teilen.

---

## ▶️ Anschauen
`index.html` im Browser öffnen (am besten **Chrome/Safari**) → **„Reportage starten"** → läuft
automatisch durch. Steuerung unten rechts oder per Tastatur:
`Leertaste` Pause · `→/←` Beat wechseln · `V` Stimmen-Modus · `F` Vollbild · `R` neu.
**„Weiter ▸"** überspringt zum nächsten Beat (1. Klick: Tippanimation überspringen).

---

## 🎙️ Die Stimmen (wichtig!)

Die Figuren-Stimmen sind **vorgerenderte Audiodateien** in `assets/voice/` – sie sind schon
dabei und funktionieren überall (auch nach dem Vercel-Deploy), ohne dass etwas installiert
werden muss.

Erzeugt wurden sie auf einem **Mac** mit den eingebauten Stimmen (`say`):

| Figur | Stimme (macOS) |
|------|----------------|
| Reportage (Erzähler) | Reed |
| Jonas | Eddy |
| David | Rocko |
| Inas | Sandy |
| Marianne | Shelley |
| Dozentin Z. M. | Anna |
| Der Chef | Grandpa |

### 🌟 Natürliche Stimmen (empfohlen): ElevenLabs
Die Mac-Stimmen klingen etwas robotisch. Für **richtig natürliche** Stimmen (wie in
professionellen Videos) rendern wir dieselben Zeilen über ElevenLabs — das ganze Skript
(~3'000 Zeichen) passt in den **kostenlosen** Tarif:
```bash
# 1) Gratis-Account auf elevenlabs.io → Profile → API Key kopieren
# 2) im Projektordner:
ELEVENLABS_API_KEY=dein_key npm run voices:11
```
Jede Figur bekommt automatisch eine eigene Stimme (Zuordnung in
`tools/gen-voices-elevenlabs.js`). Stimmen deines Accounts anzeigen: `npm run voices:list`.

**Mac-Stimmen neu rendern** (kostenlos, ohne Account; nach Textänderungen):
```bash
npm run voices
```
Für beste Qualität die deutschen Premium-Stimmen laden:
*Systemeinstellungen → Bedienungshilfen → Gesprochene Inhalte → Systemstimme → Anpassen … →
Deutsch* (Eddy, Rocko, Sandy, Shelley, Reed, Grandpa, Anna).

**Stimmen-Modus** im Player (Knopf 🎙️ / Taste `V`) schaltet um zwischen:
🎙️ gerenderte Studio-Stimmen · 🗣️ Live-Browserstimmen · 🔇 nur Untertitel + Musik.

---

## 🎵 Musik
Eine dramatische, lizenzfreie Loop als **`assets/music.mp3`** ablegen → wird automatisch leise
unterlegt und am Ende ausgeblendet. Quellen z.B. **Pixabay Music** oder **Uppbeat**
(Suchbegriffe: *cinematic documentary, suspense, tension, dramatic underscore*). Ohne Datei
läuft alles normal, nur ohne Musik.

---

## ☁️ Deployen (Vercel)
Vercel → **Add New → Project** → Repo `agile-video` importieren → Framework **„Other"**,
Build Command **leer**, Output **Root** → Deploy. Statische Seite, läuft sofort.
(Geht genauso über GitHub Pages: Settings → Pages → `main` / root.)

## 🎥 Als Videodatei abgeben
Vollbild (`F`) → Bildschirmaufnahme **mit Ton** (macOS `⌘⇧5` oder OBS „Desktop-Audio") →
„Reportage starten" → läuft automatisch durch.

---

## ✏️ Anpassen
Alles Inhaltliche steht in **`story.js`**:
- `CHARACTERS` — Figuren, Emojis, Farben, Stimmen.
- `SCRIPT` — die Beats (`who` = Figur, `text` = gesprochene Zeile). `stage` setzt die Bühne
  (anwesende Figuren, Hintergrund-Emojis, Ortsmarke), `theme` die Farben, `label`/`title`
  die Einblendungen.

Nach Textänderungen Stimmen mit `npm run voices` neu erzeugen. Tempo/Pausen in `app.js` → `CFG`.

| Datei | Inhalt |
|------|--------|
| `index.html` | Grundgerüst, Overlays, Steuerung |
| `styles.css` | cinematisches Design & Animationen |
| `story.js` | Besetzung + Drehbuch (auch vom Stimmen-Generator gelesen) |
| `app.js` | Engine: Bühne, Sprechblasen, Tippanimation, Audio, Timecode |
| `tools/gen-voices.js` | rendert die Figuren-Stimmen (macOS) |
