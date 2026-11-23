/* Hochzeitseinladung – Logik. Inhalte kommen aus js/config.js */
(() => {
  "use strict";
  const C = window.INVITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- Inhalte einsetzen ---------------- */
  $$("[data-bind]").forEach((el) => { const v = C[el.dataset.bind]; if (v != null) el.textContent = v; });
  const P = C.photos || {};
  $$("img[data-src]").forEach((img) => {
    const k = img.dataset.src;
    const src = k.startsWith("cover") ? (P.cover || [])[+k.slice(5)] : P[k];
    if (src) { img.decoding = "async"; img.src = src; }
  });
  if (C.partner1) document.title = `${C.partner1} & ${C.partner2} – Einladung zur Hochzeit`;

  const ol = $("#schedule");
  (C.schedule || []).forEach((s) => {
    const li = document.createElement("li");
    const t = document.createElement("time"); t.textContent = s.time;
    const d = document.createElement("div");
    const b = document.createElement("strong"); b.textContent = s.title; d.append(b);
    if (s.note) { const n = document.createElement("small"); n.textContent = s.note; d.append(n); }
    li.append(t, d); ol.append(li);
  });
  const maps = $("#maps"); if (C.mapsUrl) maps.href = C.mapsUrl; else maps.remove();

  // Kalender (.ics)
  $("#ics").addEventListener("click", () => {
    const f = (iso) => iso.replace(/[-:]/g, "").slice(0, 15);
    const esc = (s = "") => String(s).replace(/([,;\\])/g, "\\$1");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hochzeit//DE", "BEGIN:VEVENT",
      `UID:${f(C.dateISO)}-hochzeit@einladung`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART:${f(C.dateISO)}`, `DTEND:${f(C.endISO || C.dateISO)}`,
      `SUMMARY:${esc(`Hochzeit ${C.partner1} & ${C.partner2}`)}`,
      `LOCATION:${esc(`${C.venueName}, ${C.venueAddress}`)}`,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "hochzeit.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  /* ---------------- Formular ---------------- */
  const form = $("#rsvp-form");
  const F = form.elements;
  const guests = $("#guests");
  for (let i = 1; i <= (C.maxGuests || 6); i++) guests.add(new Option(i === 1 ? "1 Person" : `${i} Personen`, i));
  const status = $(".status", form);
  const btn = $(".send", form);
  const thanks = $(".thanks");
  const KEY = (C.web3formsKey || "").trim();
  const demo = !KEY || KEY.startsWith("DEIN");

  const setInvalid = (el, bad) => el.setAttribute("aria-invalid", bad ? "true" : "false");
  form.addEventListener("input", (e) => { if (e.target.getAttribute("aria-invalid") === "true" && e.target.checkValidity()) setInvalid(e.target, false); if (e.target.name === "antwort") $(".choice").classList.remove("invalid"); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "status"; status.textContent = "";
    const fd = new FormData(form);
    if (fd.get("botcheck")) return;
    const name = F["name"].value.trim(), email = F["email"].value.trim(), answer = fd.get("antwort");
    let msg = "";
    if (!answer) { $(".choice").classList.add("invalid"); msg = "Bitte wählt Zusage oder Absage."; }
    setInvalid(F["name"], !name); setInvalid(F["email"], !F["email"].checkValidity() || !email);
    if (!name) msg ||= "Bitte gebt euren Namen an.";
    else if (!email || !F["email"].checkValidity()) msg ||= "Bitte gebt eine gültige E-Mail-Adresse an.";
    if (msg) { status.textContent = msg; (form.querySelector('[aria-invalid="true"]') || F["antwort"][0]).focus({ preventScroll: true }); return; }

    const yes = answer === "Zusage";
    const payload = {
      access_key: KEY,
      subject: `${yes ? "✅ Zusage" : "❌ Absage"}: ${name} – Hochzeit ${C.partner1} & ${C.partner2}`,
      from_name: "Hochzeitseinladung",
      name, email,
      Antwort: answer,
      ...(yes ? { Personen: fd.get("personen"), "Allergien / Essen": fd.get("essen") || "–" } : {}),
      Nachricht: fd.get("nachricht") || "–",
      botcheck: false
    };

    btn.classList.add("busy"); btn.disabled = true;
    try {
      if (demo) {
        await new Promise((r) => setTimeout(r, 700));
        console.info("[Demo] Web3Forms-Schlüssel fehlt – würde senden:", payload);
      } else {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || `Fehler ${res.status}`);
      }
      $("#thanks-title").textContent = yes ? "Wie schön!" : "Danke!";
      $("#thanks-text").textContent = yes
        ? `Wir freuen uns riesig auf euch, ${name.split(/\s|&/)[0]}. Eure Antwort ist angekommen.`
        : "Schade, dass ihr nicht dabei sein könnt – danke, dass ihr Bescheid gebt.";
      if (demo) $("#thanks-text").textContent += " (Vorschau: Es wurde noch keine Mail verschickt.)";
      form.hidden = true; thanks.hidden = false;
    } catch (err) {
      status.textContent = "Das hat leider nicht geklappt. Bitte versucht es gleich noch einmal.";
      console.error(err);
    } finally { btn.classList.remove("busy"); btn.disabled = false; }
  });
  $("#again").addEventListener("click", () => { form.reset(); form.hidden = false; thanks.hidden = true; });

  /* ---------------- Scroll-Animation ---------------- */
  if (!document.documentElement.classList.contains("anim") || !window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.remove("anim");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const root = document.documentElement;
  const stage = $("#stage"), scroller = $("#scroller"), book = $("#book");
  const leaves = [1, 2, 3].map((n) => $(`.leaf[data-leaf="${n}"]`)); // oben → unten
  const envParts = $$(".env-part");
  const dots = $$(".dots button");
  const chapters = ["cover", "invite", "details", "rsvp"];
  const visibleFace = { cover: leaves[0].querySelector(".front"), invite: leaves[1].querySelector(".front"), details: leaves[2].querySelector(".front"), rsvp: $(".base") };
  let tl, current = null, T = {};

  function measure() {
    const vw = stage.clientWidth, vh = stage.clientHeight;
    const spread = vw >= 900 && vw / vh > 1.05;
    let pw, ph;
    if (spread) {
      ph = Math.min(vh - 120, 800);
      pw = Math.min(ph * 0.7, (vw - 120) / 2);
      ph = Math.min(ph, pw / 0.62);
    } else {
      pw = Math.min(vw - 28, 460);
      ph = Math.min(vh - 96, pw * 1.62);
    }
    const ew = Math.min(vw * 0.88, 640, (vh - 170) * 1.42);
    const eh = ew / 1.42;
    const s = Math.min((ew * 0.9) / ph, (eh * 0.84) / pw);
    // Umschlag beim Herausziehen etwas nach unten, damit die Karte im Bild bleibt
    const lift = Math.max(0, Math.min(eh / 2 + pw * s + 14 - vh / 2 + 28, vh / 2 - eh / 2 - 12));
    return { vw, vh, spread, pw, ph, ew, eh, s, lift, cardY: spread ? -6 : -24 };
  }

  function build() {
    const p = tl ? tl.scrollTrigger.progress : 0;
    if (tl) { tl.scrollTrigger.kill(); tl.kill(); }
    const d = measure();
    root.style.setProperty("--pw", d.pw + "px"); root.style.setProperty("--ph", d.ph + "px");
    root.style.setProperty("--ew", d.ew + "px"); root.style.setProperty("--eh", d.eh + "px");

    // Zeitpunkte (Einheiten der Timeline)
    T = { open: 0.25, slide: 1.15, out: 2.2, cover: 3.6, flip1: 3.8, invite: 5.0, flip2: 5.2, details: 6.4, flip3: 6.6, rsvp: 7.8 };
    scroller.style.height = Math.round(d.vh + T.rsvp * d.vh * 0.78) + "px";

    // Ausgangszustand
    gsap.set(envParts, { clearProps: "transform,opacity,visibility" });
    gsap.set(".env-shadow", { zIndex: 0 }); gsap.set(".env-back", { zIndex: 1 }); gsap.set(".env-pocket", { zIndex: 4 });
    gsap.set(".env-flap", { rotationX: 0, transformPerspective: 1600, transformOrigin: "50% 0%", zIndex: 5 });
    gsap.set(".seal", { scale: 1, autoAlpha: 1, zIndex: 6 });
    gsap.set(book, { x: 0, y: d.eh * 0.05, rotation: -90, scale: d.s, zIndex: 3 });
    leaves.forEach((l, i) => gsap.set(l, { rotationY: 0, z: 2 * (3 - i), transformOrigin: "0% 50%" }));
    gsap.set($$(".leaf .front .shade"), { opacity: 0 });
    gsap.set($$(".leaf .back .shade"), { opacity: 0.32 });
    gsap.set($$(".leaf .back"), { autoAlpha: 1 });
    gsap.set(".hint", { autoAlpha: 1, y: 0, xPercent: -50 });
    gsap.set(".dots", { autoAlpha: 0 });

    tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: scroller, start: "top top", end: "bottom bottom",
        scrub: 0.5,
        snap: /[?&]nosnap/.test(location.search) ? false : { snapTo: "labelsDirectional", duration: { min: 0.25, max: 0.8 }, delay: 0.1, ease: "power2.inOut" },
        onUpdate: sync
      }
    });

    tl.addLabel("start", 0)
      .to(".hint", { autoAlpha: 0, y: 12, duration: 0.3 }, 0)
      // 1. Siegel lösen, Lasche öffnen
      .to(".seal", { scale: 1.18, autoAlpha: 0, duration: 0.35, ease: "power1.in" }, 0.05)
      .to(".env-flap", { rotationX: 180, duration: 1, ease: "power1.inOut" }, T.open)
      .set(".env-flap", { zIndex: 2 }, T.open + 0.5)
      // 2. Karte herausziehen
      .to(envParts, { y: d.lift, duration: 1, ease: "power2.inOut" }, T.slide)
      .to(book, { y: d.lift - (d.eh / 2 + (d.pw * d.s) / 2 + 14), duration: 1, ease: "power2.inOut" }, T.slide)
      .set(book, { zIndex: 7 }, T.slide + 1)
      // 3. Karte nach vorn, aufrichten, Umschlag fällt weg
      .to(book, { y: d.cardY, rotation: 0, scale: 1, duration: 1.2, ease: "power2.inOut" }, T.out)
      .to(envParts, { y: d.vh * 0.8, autoAlpha: 0, duration: 1.05, ease: "power2.in" }, T.out + 0.05)
      .to(".dots", { autoAlpha: 1, duration: 0.3 }, T.out + 0.9)
      .addLabel("cover", T.cover);

    // 4. Blättern
    [T.flip1, T.flip2, T.flip3].forEach((t, i) => {
      const leaf = leaves[i];
      const zTo = 2 * (i + 1);
      tl.to(leaf, { rotationY: -180, duration: 1, ease: "power2.inOut" }, t)
        .to(leaf, { z: 70, duration: 0.5, ease: "power1.out" }, t)
        .to(leaf, { z: zTo, duration: 0.5, ease: "power1.in" }, t + 0.5)
        .to(leaf.querySelector(".front .shade"), { opacity: 0.32, duration: 0.5, ease: "power1.in" }, t)
        .to(leaf.querySelector(".back .shade"), { opacity: 0, duration: 0.5, ease: "power1.out" }, t + 0.5);
      if (d.spread) {
        if (i === 0) tl.to(book, { x: d.pw / 2, duration: 1, ease: "power2.inOut" }, t);
      } else {
        // Mobil: umgeblätterte Seite verschwindet nach links
        tl.to(leaf.querySelector(".back"), { autoAlpha: 0, duration: 0.35, ease: "power1.in" }, t + 0.6);
      }
    });
    tl.to({}, { duration: 0.2 }, T.rsvp - 0.2) // kurze Ruhephase am Ende
      .addLabel("invite", T.invite).addLabel("details", T.details).addLabel("rsvp", T.rsvp);

    ScrollTrigger.refresh();
    if (p) window.scrollTo(0, tl.scrollTrigger.start + p * (tl.scrollTrigger.end - tl.scrollTrigger.start));
    current = null; sync();
    window.__invite = { tl, T };
  }

  function sync() {
    const t = tl.time();
    const ch = t < T.out + 0.9 ? null : t < T.flip1 + 0.5 ? "cover" : t < T.flip2 + 0.5 ? "invite" : t < T.flip3 + 0.5 ? "details" : "rsvp";
    if (ch === current) return;
    current = ch;
    dots.forEach((b, i) => { const on = chapters[i] === ch; b.classList.toggle("on", on); b.setAttribute("aria-current", on ? "step" : "false"); });
    Object.entries(visibleFace).forEach(([k, el]) => { el.inert = k !== ch; });
  }

  const go = (label, smooth = true) => {
    if (!tl) return;
    const y = tl.scrollTrigger.labelToScroll(label);
    window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
  };
  dots.forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
  $(".skip").addEventListener("click", (e) => { e.preventDefault(); go("rsvp", false); setTimeout(() => F["antwort"][0].focus({ preventScroll: true }), 400); });

  let lastW = 0, lastH = 0, rt;
  const onResize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 120) return;
    lastW = w; lastH = h; build();
  };
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(onResize, 180); });

  const start = () => { window.scrollTo(0, 0); lastW = stage.clientWidth; lastH = stage.clientHeight; build(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
})();
