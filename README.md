# Hochzeitseinladung – Anleitung

Eine Seite, kein Build-Schritt, keine laufenden Kosten.
Beim Scrollen öffnet sich der Umschlag, die Karte kommt heraus, man blättert durch und landet auf der Rückseite mit dem Antwortformular.

## 1. Inhalte anpassen

Alles Inhaltliche steht in **`js/config.js`**: Namen, Datum, Ort, Ablauf, Texte, Antwortfrist, Fotos, Mail-Schlüssel.
Die Datei mit einem Texteditor öffnen, Werte ändern, speichern. Fertig.

**Fotos:** Eigene Bilder (JPG, am besten ca. 1200 px lang) in `assets/photos/` legen und die Dateinamen in `config.js` unter `photos` eintragen.
- `cover`: die 4 Bilder auf der Titelseite (Fotoautomaten-Stil, werden automatisch schwarz-weiß)
- `back1`, `back3`: großes Foto auf den Rückseiten (nur am Laptop/Desktop sichtbar, auf dem Handy wird einseitig geblättert)

**Farben:** ganz oben in `css/style.css` unter `:root` (`--env` = Umschlag, `--accent` = Schrift/Buttons, `--bg` = Hintergrund).

## 2. Mail-Versand einrichten (Web3Forms, kostenlos)

1. Auf https://web3forms.com die E-Mail-Adresse eintragen, an die die Antworten gehen sollen (z. B. die der Braut).
2. Der *Access Key* kommt per Mail.
3. In `js/config.js` bei `web3formsKey` einsetzen.

Jede Zu- oder Absage kommt dann als Mail mit Betreff „✅ Zusage: Name …“ bzw. „❌ Absage: …“. Mit „Antworten“ landet man direkt beim Gast.
Solange kein Schlüssel eingetragen ist, läuft das Formular im Vorschau-Modus und verschickt nichts.

> Eine automatische Bestätigungsmail **an den Gast** gibt es bei Web3Forms nur im kostenpflichtigen Pro-Tarif. Der Gast sieht nach dem Absenden aber direkt eine Bestätigung auf der Seite.

## 3. Veröffentlichen mit Cloudflare Pages (kostenlos)

1. Kostenloses Konto auf https://dash.cloudflare.com anlegen.
2. **Workers & Pages → Create → Pages → Upload assets** (Direct Upload).
3. Projektnamen wählen, z. B. `sophie-und-jonas` → Adresse wird `sophie-und-jonas.pages.dev`.
4. Den **ganzen Ordner** (mit `index.html`, `js/`, `css/` …) hochladen → Deploy.
5. Änderungen später: im Projekt „Create new deployment“ und den Ordner erneut hochladen.

Optional: unter *Custom domains* eine eigene Domain verbinden.

Die Datei `_headers` setzt bei Cloudflare automatisch Sicherheits-Header und sorgt (zusammen mit `robots.txt`) dafür, dass die Seite nicht bei Google auftaucht.

## Lokal ansehen

Im Ordner ein Terminal öffnen und `python3 -m http.server` starten, dann http://localhost:8000 öffnen.
(Direkt per Doppelklick auf `index.html` geht auch, die Mail funktioniert aber erst online.)

## Technik

- Scroll-Animation: [GSAP](https://gsap.com) + ScrollTrigger (liegt in `vendor/`, kostenlos nutzbar), CSS-3D-Transforms
- Schriften lokal eingebunden (Cormorant Garamond, Pinyon Script) – keine Verbindung zu Google, DSGVO-freundlich
- Wer in den Systemeinstellungen „Bewegung reduzieren“ aktiv hat, bekommt die Karten ohne Animation untereinander
- Die Kapitel-Punkte unten springen direkt zu Titel, Einladung, Ablauf oder Antwort
