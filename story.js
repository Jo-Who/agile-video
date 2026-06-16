/* ============================================================
   DIE AKTE AGILE — Drehbuch & Besetzung
   ------------------------------------------------------------
   Diese Datei wird sowohl im Browser (window.STORY) als auch
   vom Stimmen-Generator in Node (tools/gen-voices.js) gelesen.
   ► Texte/Figuren hier anpassen. Danach Stimmen neu rendern:
     npm run voices
   ============================================================ */
(function (global) {

  // ---- Besetzung -------------------------------------------------
  // voice  = macOS "say"-Stimme (für gerenderte Audiodateien)
  // pitch/rate = Fallback-Variation für die Live-Browserstimme
  const CHARACTERS = {
    narrator: { name: "Reportage", emoji: "🎙️", color: "#e7c987",
                voice: "Reed (Deutsch (Deutschland))", pitch: 0.7, rate: 0.92, kind: "narrator" },
    jonas:    { name: "Jonas",     emoji: "🧑‍💻", color: "#38bdf8",
                voice: "Eddy (Deutsch (Deutschland))", pitch: 1.0, rate: 1.0 },
    david:    { name: "David",     emoji: "🧔",   color: "#34d399",
                voice: "Rocko (Deutsch (Deutschland))", pitch: 0.85, rate: 1.0 },
    inas:     { name: "Inas",      emoji: "👩",   color: "#f472b6",
                voice: "Sandy (Deutsch (Deutschland))", pitch: 1.15, rate: 1.0 },
    marianne: { name: "Marianne",  emoji: "👩‍🦰", color: "#fbbf24",
                voice: "Shelley (Deutsch (Deutschland))", pitch: 1.25, rate: 1.02 },
    dozentin: { name: "Dozentin Z. M.", emoji: "👩‍🏫", color: "#a78bfa",
                voice: "Anna", pitch: 1.05, rate: 0.98 },
    chef:     { name: "Der Chef",  emoji: "👨‍💼", color: "#fb7185",
                voice: "Grandpa (Deutsch (Deutschland))", pitch: 0.8, rate: 0.95 },
    system:   { name: "", emoji: "", color: "#e7c987", voice: null, kind: "system" }
  };

  // ---- Akte (Szenen) --------------------------------------------
  // Jeder Beat: { who, text, stage? }
  // stage setzt die Bühne (bleibt bis zum nächsten stage bestehen):
  //   chars  = anwesende Figuren (IDs)
  //   props  = Hintergrund-Emojis [{e,label?}]
  //   place  = Ortsmarke unten links im Bild
  const SCRIPT = [

    // ===== AKT 1 — COLD OPEN ====================================
    { act: "DOK · GRUPPE D", title: "DIE AKTE AGILE", label: "",
      theme: { bg1: "#0a0e16", bg2: "#141b26", accent: "#e7c987" }, rec: true,
      stage: { chars: [], props: [{ e: "📺" }, { e: "📡" }, { e: "🎬" }, { e: "🔴" }], place: "" },
      who: "narrator",
      text: "Eine wahre Geschichte. Über vier Studierende, ein Projekt am Abgrund – und ein Wort, das alles veränderte." },
    { who: "narrator", text: "Heute, in unserer Reportage: die Akte Agile." },
    { who: "narrator", text: "Die Namen sind echt. Die Deadlines leider auch." },
    { statement: true, who: "narrator",
      text: "Wo seht ihr konkrete Einsatzmöglichkeiten von Agile im Studium und im Job?" },
    { who: "narrator", text: "Das ist unsere Leitfrage. Und sie beginnt, wie so oft, im ganz normalen Wahnsinn." },

    // ===== AKT 2 — VORHER · KLASSISCH ===========================
    { act: "DOK · GRUPPE D", title: "", label: "VORHER · KLASSISCH",
      theme: { bg1: "#1a0c11", bg2: "#2c1019", accent: "#fb7185" }, rec: true,
      stage: { chars: ["jonas", "david", "inas", "marianne"], props: [{ e: "📚" }, { e: "📄" }, { e: "☕" }], place: "UNI · GRUPPENRAUM" },
      who: "narrator",
      text: "Vier Namen. Vier Leute, die studieren und nebenbei arbeiten: Jonas, David, Inas und Marianne." },
    { who: "narrator", text: "Ihr Auftrag: ein grosses Semesterprojekt. Klassisch geplant. Was soll schon schiefgehen?" },
    { who: "inas", text: "Wir haben am Anfang alles bis ins letzte Detail durchgeplant. Hundert Seiten Konzept." },
    { who: "inas", text: "Rückblickend? Wir waren fleissig. Nur leider an den völlig falschen Dingen." },
    { who: "david", text: "Und dann hat jeder für sich allein vor sich hin gewerkelt. Wochenlang." },
    { who: "jonas", text: "Feedback? Gab es keins. Wir haben uns ja kaum gesehen." },
    { who: "jonas", text: "Ehrlich gesagt: wir haben mehr geplant als gemacht." },
    { who: "marianne", text: "Und die Nacht vor der Abgabe... darüber reden wir lieber nicht." },
    { who: "narrator", text: "Doch es kam schlimmer. Denn da war ja noch der Job." },

    { label: "FIRMA · BÜRO 4. STOCK",
      stage: { chars: ["jonas", "chef"], props: [{ e: "📊" }, { e: "💸" }, { e: "🤷" }], place: "FIRMA · BÜRO" },
      who: "chef",
      text: "Was Sie genau bauen sollen? Details? Dafür habe ich ja Sie. Machen Sie einfach, dass es fertig wird." },
    { who: "jonas", text: "Klare Ansage. Nur leider keine klare Anforderung." },
    { who: "narrator", text: "Drei Monate Arbeit. Eine Präsentation. Und ein Gesicht, das Bände sprach." },
    { who: "chef", text: "Das... ist nicht das, was ich wollte." },
    { who: "narrator", text: "Alles auf einmal geplant. Alles am Ende geliefert. Alles zu spät." },
    { who: "david", text: "So konnte es einfach nicht weitergehen." },

    // ===== AKT 3 — DAS MODUL ====================================
    { act: "DOK · GRUPPE D", title: "", label: "WENDEPUNKT · DAS MODUL",
      theme: { bg1: "#13102c", bg2: "#241b4f", accent: "#a78bfa" }, rec: true,
      stage: { chars: ["jonas", "david", "dozentin", "inas", "marianne"], props: [{ e: "🎓" }, { e: "💡" }, { e: "🧩" }], place: "HWZ · HÖRSAAL" },
      who: "narrator",
      text: "Dann, im Modul Agile Methoden, betrat jemand den Raum, der alles ändern sollte." },
    { who: "dozentin", text: "Willkommen. Vergesst kurz alles, was ihr über starre, perfekte Pläne zu wissen glaubt." },
    { who: "dozentin", text: "Die Idee ist simpel: nicht alles am Anfang planen, sondern in kleinen Schritten liefern – und dabei lernen." },
    { who: "dozentin", text: "So eine kurze Etappe mit einem fertigen Ergebnis nennen wir einen Sprint." },
    { who: "dozentin", text: "Jeden Tag ein kurzes Standup: Was lief, was hakt, was kommt? Drei Minuten, im Stehen." },
    { who: "dozentin", text: "Eure Aufgaben kommen auf ein Board: To Do, In Arbeit, Fertig. Sichtbar für alle." },
    { who: "dozentin", text: "Am Ende eines Sprints zeigt ihr euer Ergebnis her. Das nennen wir ein Review." },
    { who: "david", text: "Und wenn etwas nicht passt, merken wir es sofort – nicht erst nach drei Monaten." },
    { who: "dozentin", text: "Und am Ende jeder Etappe holt ihr Feedback und passt euch an. Inspect and adapt." },
    { who: "inas", text: "Moment – wir dürfen also Fehler machen, solange wir sie früh bemerken?" },
    { who: "dozentin", text: "Genau. Ein Fehler in Woche eins ist eine Lektion. In Woche zwölf ist er eine Katastrophe." },
    { who: "dozentin", text: "Und ihr arbeitet zusammen, nicht nebeneinander. Menschen vor Prozessen." },
    { who: "marianne", text: "Das war der Moment, in dem es bei mir Klick gemacht hat." },
    { who: "narrator", text: "Für die vier war das ein Aha-Moment. Vielleicht der erste seit Langem." },

    // ===== AKT 4 — NACHHER · STUDIUM ============================
    { act: "DOK · GRUPPE D", title: "", label: "NACHHER · AGIL IM STUDIUM",
      theme: { bg1: "#0a2230", bg2: "#0f3343", accent: "#22d3ee" }, rec: true,
      stage: { chars: ["jonas", "david", "inas", "marianne"], props: [{ e: "🗂️" }, { e: "✅" }, { e: "🔄" }], place: "UNI · DASSELBE TEAM" },
      who: "narrator",
      text: "Das nächste Projekt. Dieselben vier. Aber diesmal: ganz anders." },
    { who: "marianne", text: "Zuerst: alle Aufgaben in eine Liste – unser Backlog. Kein Chaos mehr im Kopf." },
    { who: "jonas", text: "Dann Zwei-Wochen-Sprints. Am Ende jeder Etappe etwas, das wirklich funktioniert." },
    { who: "jonas", text: "Und wenn mal etwas schiefläuft, ist es nur ein Päckchen – nicht das ganze Projekt." },
    { who: "david", text: "Jeden Montag ein kurzes Standup. Jeder weiss, woran die anderen gerade sind." },
    { who: "inas", text: "Und das Board zeigt auf einen Blick: Wo stehen wir wirklich?" },
    { who: "marianne", text: "Plötzlich fühlt sich das Projekt nicht mehr wie ein Berg an. Sondern wie machbare Päckchen." },
    { who: "narrator", text: "Kein Versteckspiel. Keine bösen Überraschungen. Und keine durchwachten Nächte mehr." },

    // ===== AKT 5 — NACHHER · JOB ================================
    { act: "DOK · GRUPPE D", title: "", label: "AGIL · IM JOB",
      theme: { bg1: "#0a2433", bg2: "#0e3a44", accent: "#34d399" }, rec: true,
      stage: { chars: ["jonas"], props: [{ e: "🚀" }, { e: "💬" }, { e: "🙋" }], place: "JONAS · IT-TEAM" },
      who: "narrator",
      text: "Doch der eigentliche Beweis kam nicht im Hörsaal. Sondern im Job." },
    { who: "jonas", text: "In meinem IT-Team starten wir jeden Morgen mit einem Daily. Alle zwei Wochen liefern wir dem Kunden etwas Echtes." },
    { who: "jonas", text: "Früh Feedback statt grossem Knall am Ende. So bauen wir endlich das Richtige." },

    { label: "DAVID · MARKETING",
      stage: { chars: ["david"], props: [{ e: "📣" }, { e: "📈" }, { e: "🗂️" }], place: "DAVID · MARKETING" },
      who: "david",
      text: "Bei uns im Marketing planen wir Kampagnen jetzt in Sprints. Ein Kanban-Board statt zehn offener Chats." },

    { label: "INAS · EVENTS",
      stage: { chars: ["inas"], props: [{ e: "🎪" }, { e: "📅" }, { e: "✅" }], place: "INAS · EVENTS" },
      who: "inas",
      text: "Ich koordiniere Events. Backlog, klare Etappen, kurze Retros – seitdem geht nichts mehr unter." },

    { label: "MARIANNE · VERWALTUNG",
      stage: { chars: ["marianne"], props: [{ e: "🏢" }, { e: "🗃️" }, { e: "🔁" }], place: "MARIANNE · VERWALTUNG" },
      who: "marianne",
      text: "Und ich nutze ein persönliches Kanban für meine To-Dos. Klingt klein, verändert aber den ganzen Tag." },

    { stage: { chars: ["jonas", "david", "inas", "marianne"], props: [{ e: "💻" }, { e: "📣" }, { e: "🎪" }, { e: "🏢" }], place: "" },
      who: "narrator",
      text: "Marketing, Events, Verwaltung, IT. Agilität ist längst nicht mehr nur etwas für Programmierer." },
    { stage: { chars: ["dozentin"], props: [{ e: "💡" }], place: "" },
      who: "dozentin",
      text: "Genau das ist der Punkt: Agil ist keine Software. Agil ist eine Haltung." },
    { stage: { chars: ["jonas", "david", "inas", "marianne"], props: [{ e: "💼" }, { e: "🎓" }], place: "" },
      who: "narrator",
      text: "Eine Haltung, die im Hörsaal beginnt – und im Berufsleben bleibt." },

    // ===== ZWISCHENSPIEL — MITMACHEN (interaktiv) ===============
    { act: "DOK · GRUPPE D", title: "", label: "MITMACHEN · DEINE RUNDE",
      theme: { bg1: "#1a1530", bg2: "#2b2150", accent: "#fbbf24" }, rec: true,
      stage: { chars: ["jonas", "inas", "david", "marianne"], props: [{ e: "❓" }, { e: "🧠" }], place: "QUIZ · BIST DU AGIL?" },
      who: "narrator",
      text: "Kleiner Test – hast du aufgepasst? Was ist eigentlich ein Sprint?",
      quiz: {
        options: [
          "Eine kurze Etappe mit einem fertigen Ergebnis",
          "Ein hundert Seiten dicker Plan ganz am Anfang",
          "Die durchgemachte Nacht vor der Abgabe"
        ],
        correct: 0,
        okWho: "inas",  okText: "Genau! Klein, fertig, wiederholbar.",
        noWho: "jonas", noText: "Ähm, nein – das war noch klassisch gedacht. Probier's nochmal!"
      } },
    { who: "narrator",
      text: "Und die grosse Frage: Wo lässt sich Agilität einsetzen?",
      quiz: {
        options: [
          "Nur in der Software-Entwicklung",
          "Im Studium und in fast jedem Job",
          "Eigentlich nirgends so richtig"
        ],
        correct: 1,
        okWho: "dozentin", okText: "Richtig. Genau darum ging es die ganze Zeit.",
        noWho: "david",    noText: "Nicht ganz – denk an Marketing, Events, Verwaltung. Nochmal!"
      } },
    { who: "narrator", text: "Stark. Dann hast du das Wichtigste mitgenommen." },

    // ===== AKT 6 — OUTRO ========================================
    { act: "DOK · GRUPPE D", title: "", label: "ENDE DER REPORTAGE",
      theme: { bg1: "#0a0e16", bg2: "#141b26", accent: "#e7c987" }, rec: true,
      stage: { chars: ["jonas", "david", "inas", "marianne"], props: [{ e: "🎬" }, { e: "🔴" }], place: "" },
      who: "narrator",
      text: "Vom Hundert-Seiten-Konzept zum ersten kleinen Schritt. Vom Chaos zur Klarheit." },
    { who: "jonas", text: "Klein anfangen." },
    { who: "inas", text: "Früh Feedback holen." },
    { who: "david", text: "In Etappen denken." },
    { who: "marianne", text: "Und stetig besser werden." },
    { who: "narrator", text: "Vier Studierende. Ein Modul. Eine Erkenntnis, die bleibt." },
    { stage: { chars: ["dozentin"], props: [{ e: "🎓" }], place: "" },
      who: "dozentin", text: "Ihr müsst nicht alles auf einmal ändern. Fangt einfach klein an." },
    { stage: { chars: [], props: [{ e: "🎬" }, { e: "📺" }], place: "" },
      who: "narrator", text: "Die Akte Agile – hiermit geschlossen." },
    { who: "system", text: "GRUPPE D\nDavid Egeler · Marianne Wiederkehr · Inas Kassem · Jonas Russi\nMit Dank an Z. M. · HWZ" }
  ];

  global.STORY = { CHARACTERS: CHARACTERS, SCRIPT: SCRIPT };

})(typeof window !== "undefined" ? window : globalThis);

if (typeof module !== "undefined" && module.exports) {
  module.exports = (typeof window !== "undefined" ? window : globalThis).STORY;
}
