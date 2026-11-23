/* ==========================================================================
   HIER ALLES ANPASSEN – Texte, Datum, Ort, Fotos, Mail-Schlüssel.
   Nur diese Datei bearbeiten, der Rest der Seite liest von hier.
   ========================================================================== */
window.INVITE = {
  // Paar
  partner1: "Sophie",
  partner2: "Jonas",
  monogram: "S & J",            // steht auf dem Wachssiegel

  // Datum & Zeit (ISO für Kalender-Export, Anzeige als Text)
  dateISO: "2027-09-11T14:00:00",
  endISO: "2027-09-12T02:00:00",
  dateLong: "Samstag, 11. September 2027",
  dateShort: "11.09.2027",
  place: "Regensburg",        // kurz, für die Titelseite

  // Ort
  venueName: "Gut Musterhof",
  venueAddress: "Musterweg 1, 93047 Regensburg",
  mapsUrl: "https://maps.google.com/?q=Regensburg",

  // Einladungstext
  headline: "Feiert die Liebe mit uns",
  story:
    "Nach vielen gemeinsamen Jahren ist es Zeit, Ja zu sagen – laut, vor euch allen und mit euch allen: unserer Familie, unseren Freunden, den Menschen, die uns wichtig sind.",
  quote: "Und auf einmal war alles ganz einfach.",

  // Ablauf (beliebig viele Punkte)
  schedule: [
    { time: "14:00", title: "Freie Trauung", note: "im Garten" },
    { time: "15:30", title: "Sektempfang", note: "mit Kuchen & Fotos" },
    { time: "18:30", title: "Abendessen", note: "" },
    { time: "21:00", title: "Party", note: "bis in die Nacht" }
  ],
  dresscode: "Festlich – gerne in hellen Sommerfarben",

  // Antwort
  rsvpDeadline: "15. Juni 2027",
  maxGuests: 6,

  // Fotos (eigene Bilder einfach in assets/photos/ legen und hier eintragen)
  photos: {
    cover: [
      "assets/photos/foto-1.svg",
      "assets/photos/foto-2.svg",
      "assets/photos/foto-3.svg",
      "assets/photos/foto-4.svg"
    ],
    back1: "assets/photos/foto-5.svg",
    back3: "assets/photos/foto-2.svg"
  },

  // Web3Forms – Schlüssel kostenlos auf https://web3forms.com holen
  // (E-Mail eingeben → Schlüssel kommt per Mail). Antworten gehen an diese Adresse.
  web3formsKey: "DEIN-WEB3FORMS-ACCESS-KEY"
};
