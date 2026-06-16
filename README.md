# Agile im Studium & Job — eine animierte Story 🎬⚡

Eine **5–8-minütige animierte Web-Story** zum Thema:
*„Wo seht ihr konkrete Einsatzmöglichkeiten von Agile im Studium und im Job?“*

Statt eines klassischen Videos läuft hier eine vertonte Animation im Browser:
**KI-Voiceover** (Sprachsynthese des Browsers) + animierte Emoji-Szenen + Untertitel.
→ Keine persönlichen Aufnahmen, keine Persönlichkeitsrechte verletzt. ✅

**Funktioniert auf PC und Handy.** Einfach den Link teilen — oder als Video aufnehmen.

---

## ▶️ Anschauen

1. `index.html` im Browser öffnen (Chrome/Edge/Safari) **oder** den GitHub-Pages-Link.
2. Auf **„Story starten“** klicken (Klick ist nötig, damit Ton & Stimme erlaubt sind).
3. Läuft automatisch durch. Steuerung unten rechts oder per Tastatur:
   - `Leertaste` Pause/Play · `→`/`←` Szene wechseln · `F` Vollbild · `M` Ton · `R` neu starten

> 💡 **Beste Stimme:** In **Google Chrome** auf dem Mac/PC gibt es sehr natürliche deutsche
> Stimmen ("Google Deutsch"). Über das Dropdown unten rechts lässt sich die Stimme wählen.

---

## 🌐 Online stellen (GitHub Pages) — so kriegt ihr den Link

1. Repo auf GitHub pushen.
2. **Settings → Pages → Source: `main` / root** auswählen, speichern.
3. Nach ~1 Min ist die Story unter `https://<user>.github.io/agile-video/` live.

---

## 🎥 Als Video abgeben (falls eine Datei verlangt wird)

Bildschirmaufnahme **mit Systemton**:
- **macOS:** `⌘ + Shift + 5` → Aufnahme. Für den Ton der Stimme braucht es ggf.
  ein Tool wie *BlackHole* oder einfach **QuickTime → Neue Bildschirmaufnahme** mit
  ausgewähltem Mikrofon/Systemaudio. Tipp: Vollbild (`F`), dann `Story starten`.
- Alternativ **OBS Studio** (gratis): "Bildschirm aufnehmen" + "Desktop-Audio".

Danach läuft alles automatisch von Anfang bis Ende durch — einfach aufnehmen.

---

## ✏️ Inhalte anpassen

Alles steckt in **`app.js`** ganz oben:

- `CONFIG.authors` → eure Namen für das Outro.
- `CONFIG.rate` → Sprechtempo. **Kleiner = langsamer = längeres Video** (z.B. `0.9`).
- `SCENES[]` → Text & Animation jeder Szene. `lines[]` sind die gesprochenen Sätze
  (gleichzeitig Untertitel). Elemente mit `data-step="N"` erscheinen, sobald Satz N
  gesprochen wird.

Die geschätzte Laufzeit wird beim Start in die **Browser-Konsole** geschrieben.

### Optional: Hintergrundmusik
Eine dezente Loop-Datei als `assets/music.mp3` ablegen — wird automatisch leise abgespielt
(z.B. lizenzfreie Musik von Pixabay/Incompetech).

### Optional: eigene Studio-Stimme statt Browser-TTS
Wer höhere Sprachqualität will, kann pro Szene fertige Audiodateien (z.B. aus ElevenLabs)
einsetzen. Die Engine ist dafür vorbereitet — Audio statt `SpeechSynthesisUtterance`
abspielen und beim `ended`-Event weiterschalten. (Standard ist die eingebaute KI-Stimme,
damit nichts Externes nötig ist.)

---

## 🧩 Aufbau

| Datei | Inhalt |
|------|--------|
| `index.html` | Grundgerüst, Overlays, Steuerung |
| `styles.css` | Design & alle Animationen |
| `app.js` | Drehbuch (`SCENES`) + Player-Engine + KI-Voiceover |

Keine Build-Tools, keine Abhängigkeiten — reines HTML/CSS/JS.
