/* ===========================================================
   EL EJE CAFETERO — interacciones (v3)
   =========================================================== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ===========================================================
     CARTA EDITABLE — los productos/precios se leen de un CSV
     (Google Sheets publicado o archivo local). Si falla, se usan
     los ítems que ya están escritos en carta.html (respaldo).
     Para conectar Google Sheets: publica la hoja como CSV y pega
     su URL en CARTA_SHEET_CSV. Para desactivar: deja "".
     =========================================================== */
  window.CARTA_SHEET_CSV = window.CARTA_SHEET_CSV || "assets/data/carta.csv";
  (function cartaFromCSV() {
    const lists = $$('.menu-list[data-list]');
    if (!lists.length || !window.CARTA_SHEET_CSV) return; // solo en carta.html
    const slug = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
    const esc = s => (s == null ? "" : String(s)).replace(/[&<>"]/g,
      c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    function parseCSV(text) {
      text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const rows = []; let row = [], f = "", q = false, i = 0;
      while (i < text.length) {
        const c = text[i];
        if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i += 2; continue; } q = false; i++; continue; } f += c; i++; continue; }
        if (c === '"') { q = true; i++; continue; }
        if (c === ",") { row.push(f); f = ""; i++; continue; }
        if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; i++; continue; }
        f += c; i++;
      }
      if (f.length || row.length) { row.push(f); rows.push(row); }
      return rows.filter(r => r.some(c => c.trim() !== ""));
    }
    const priceHTML = p => esc((p || "").trim()).replace(/\s*\/\s*(.+)$/, ' <small>/ $1</small>');
    const itemHTML = it =>
      `<div class="mitem"><div class="mi-main"><div class="mi-name">${esc(it.n)}` +
      (it.et ? ` <span class="v">${esc(it.et)}</span>` : "") + `</div>` +
      (it.d ? `<div class="mi-desc">${esc(it.d)}</div>` : "") +
      `</div><span class="dots"></span><span class="mi-price">${priceHTML(it.p)}</span></div>`;
    function build(text) {
      const rows = parseCSV(text);
      const hIdx = rows.findIndex(r => { const h = r.map(slug); return h.includes("seccion") && h.includes("producto") && h.includes("precio"); });
      if (hIdx < 0) return;
      const H = rows[hIdx].map(slug);
      const ci = { sec: H.indexOf("seccion"), prod: H.indexOf("producto"), desc: H.indexOf("descripcion"), price: H.indexOf("precio"), et: H.indexOf("etiqueta") };
      if (ci.sec < 0 || ci.prod < 0 || ci.price < 0) return;
      const bySec = {};
      for (let r = hIdx + 1; r < rows.length; r++) {
        const row = rows[r]; const name = (row[ci.prod] || "").trim();
        if (!name) continue;
        const key = slug(row[ci.sec] || "");
        (bySec[key] = bySec[key] || []).push({
          n: name, d: ci.desc >= 0 ? (row[ci.desc] || "").trim() : "",
          p: (row[ci.price] || "").trim(), et: ci.et >= 0 ? (row[ci.et] || "").trim() : ""
        });
      }
      if (!Object.keys(bySec).length) return;
      lists.forEach(ul => {
        const items = bySec[ul.getAttribute("data-list")];
        if (items && items.length) ul.innerHTML = items.map(itemHTML).join("");
      });
    }
    const ctrl = ("AbortController" in window) ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), 6000) : null;
    const opts = { cache: "no-store" }; if (ctrl) opts.signal = ctrl.signal;
    fetch(window.CARTA_SHEET_CSV, opts)
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(txt => { if (t) clearTimeout(t); try { build(txt); } catch (e) { } })
      .catch(() => { if (t) clearTimeout(t); /* respaldo: ítems estáticos de carta.html */ });
  })();

  /* Transición suave entre páginas (fade con velo, sin pantalla de carga) */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
    // solo enlaces internos .html del mismo sitio
    if (/^(#|https?:|mailto:|tel:|wa\.me)/i.test(href)) return;
    if (!/\.html($|[?#])/.test(href)) return;
    if (a.href === location.href) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => { location.href = a.href; }, 360);
  });
  // al volver con el botón atrás, quita el velo
  window.addEventListener("pageshow", () => document.body.classList.remove("leaving"));

  /* Header scroll + back to top */
  const head = $(".kn-head");
  const onScroll = () => {
    if (head) head.classList.toggle("scrolled", window.scrollY > 40);
    const tt = $("#toTop");
    if (tt) tt.classList.toggle("show", window.scrollY > 600);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Kinetic nav */
  const knToggle = $(".kn-toggle");
  const closeNav = () => { document.body.classList.remove("kn-open"); document.body.style.overflow = ""; };
  const openNav = () => { document.body.classList.add("kn-open"); document.body.style.overflow = "hidden"; };
  if (knToggle) {
    knToggle.addEventListener("click", () =>
      document.body.classList.contains("kn-open") ? closeNav() : openNav()
    );
    const scrim = $(".kn-scrim");
    if (scrim) scrim.addEventListener("click", closeNav);
    $$(".kn-list a").forEach((a) => a.addEventListener("click", closeNav));
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* Counters */
  const animateNum = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.dec | 0);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dur = 1600; const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const numIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { animateNum(e.target); numIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => numIO.observe(el));

  /* ---- Image corridor (ImageStreamHero, vanilla port) ---- */
  function buildCorridor(el) {
    const cards = +el.dataset.cards || 9;
    const speed = +el.dataset.speed || 18;
    const axis = +el.dataset.axis || 55;
    let images = [];
    try { images = JSON.parse(el.dataset.images || "[]"); } catch (e) { images = []; }
    const P = {
      perspective: 30, cardWidth: 18, cardHeight: 25, cardRadius: 0.4,
      birthHeight: 2.6, exitHeight: 46, railBirth: -11, railExit: 44,
      fan: 3.3, turnBirth: 6, turnExit: 28, stops: 24,
    };
    const uid = "c" + Math.random().toString(36).slice(2, 8);
    const rN = "r_" + uid, lN = "l_" + uid, cN = "card_" + uid;

    const keyframes = (dir, name) => {
      const steps = [];
      for (let s = 0; s <= P.stops; s++) {
        const u = s / P.stops;
        const scale = (P.birthHeight / P.cardHeight) * Math.pow(P.exitHeight / P.birthHeight, u);
        const z = P.perspective * (1 - 1 / scale);
        const rail = P.railExit - (P.railExit - P.railBirth) * Math.pow(1 - u, P.fan);
        const turn = P.turnBirth + (P.turnExit - P.turnBirth) * u;
        steps.push(
          `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`
        );
      }
      return `@keyframes ${name}{${steps.join("")}}`;
    };

    const style = document.createElement("style");
    style.textContent =
      keyframes(1, rN) + keyframes(-1, lN) +
      `@media(prefers-reduced-motion:reduce){.${cN}{animation-play-state:paused}}`;
    el.appendChild(style);

    const stage = document.createElement("div");
    stage.className = "corridor-stage";
    stage.setAttribute("aria-hidden", "true");
    stage.style.perspective = `${P.perspective}cqw`;
    stage.style.perspectiveOrigin = `50% ${axis}%`;
    const inner = document.createElement("div");
    inner.style.cssText = "position:absolute;inset:0;transform-style:preserve-3d";
    stage.appendChild(inner);

    [rN, lN].forEach((name, ri) => {
      // Each rail lives in its own 3D layer; the left rail is nudged a hair
      // back in Z so the two rails never share a depth at the throat — that
      // z-fight was what made cards flicker at the centre.
      const rail = document.createElement("div");
      rail.className = "corridor-rail" + (ri === 1 ? " left" : "");
      inner.appendChild(rail);
      for (let i = 0; i < cards; i++) {
        const src = images.length ? images[i % images.length] : "";
        const c = document.createElement("div");
        c.className = `${cN} corridor-card`;
        c.style.cssText =
          `left:50%;top:${axis}%;width:${P.cardWidth}cqw;height:${P.cardHeight}cqw;` +
          `margin-left:${-P.cardWidth / 2}cqw;margin-top:${-P.cardHeight / 2}cqw;` +
          `border-radius:${P.cardRadius}cqw;animation:${name} ${speed}s linear infinite;` +
          `animation-delay:${-(i * speed) / cards}s`;
        if (src) {
          const im = document.createElement("img");
          im.src = src; im.alt = ""; im.loading = "lazy"; im.decoding = "async"; im.draggable = false;
          c.appendChild(im);
        }
        rail.appendChild(c);
      }
    });
    el.insertBefore(stage, el.firstChild);
  }
  $$("[data-corridor]").forEach(buildCorridor);

  /* ---- Coverflow carousel (avanza de a poco) ---- */
  function buildCoverflow(el) {
    let images = [];
    try { images = JSON.parse(el.dataset.images || "[]"); } catch (e) { images = []; }
    if (!images.length) return;
    const track = document.createElement("div");
    track.className = "cflow-track";
    el.appendChild(track);
    const cards = images.map((src) => {
      const c = document.createElement("div");
      c.className = "cflow-card";
      const im = document.createElement("img");
      im.src = src; im.alt = ""; im.loading = "lazy"; im.decoding = "async"; im.draggable = false;
      c.appendChild(im);
      track.appendChild(c);
      return c;
    });
    const n = cards.length;
    let active = Math.floor(n / 2);
    const layout = () => {
      const gap = Math.min(210, el.clientWidth * 0.19);
      cards.forEach((c, i) => {
        let off = i - active;
        if (off > n / 2) off -= n;
        if (off < -n / 2) off += n;
        const abs = Math.abs(off);
        const sc = off === 0 ? 1 : Math.max(0.6, 0.86 - abs * 0.09);
        const rot = off === 0 ? 0 : (off > 0 ? -40 : 40);
        c.style.transform =
          `translate(-50%,-50%) translateX(${off * gap}px) rotateY(${rot}deg) scale(${sc})`;
        c.style.zIndex = String(100 - abs);
        c.style.opacity = abs > 3 ? "0" : "1";
        c.classList.toggle("is-side", off !== 0);
      });
    };
    layout();
    addEventListener("resize", layout, { passive: true });
    cards.forEach((c, i) => c.addEventListener("click", () => { active = i; layout(); }));
    let timer = setInterval(() => { active = (active + 1) % n; layout(); }, 2600);
    el.addEventListener("pointerenter", () => clearInterval(timer));
    el.addEventListener("pointerleave", () => { timer = setInterval(() => { active = (active + 1) % n; layout(); }, 2600); });
  }
  $$("[data-coverflow]").forEach(buildCoverflow);

  /* Menú: los botones saltan a la sección (sin ocultar el resto) */
  const filterBtns = $$(".filter-btn");
  if (filterBtns.length) {
    const setActive = (cat) => filterBtns.forEach((b) => b.classList.toggle("active", b.dataset.filter === cat));
    const jumpTo = (cat) => {
      const el = (cat === "all") ? $(".menu-cat") : $(`.menu-cat[data-cat="${cat}"]`);
      // scroll-margin-top (CSS) deja el hueco de la barra sticky; scrollIntoView
      // encuentra el contenedor de scroll correcto (ventana o body).
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    filterBtns.forEach((btn) => btn.addEventListener("click", () => {
      setActive(btn.dataset.filter);
      jumpTo(btn.dataset.filter);
    }));
    // scrollspy: marca en la barra la sección que se está viendo
    const cats = $$(".menu-cat");
    if (cats.length && "IntersectionObserver" in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.dataset.cat); });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      cats.forEach((c) => spy.observe(c));
    }
  }

  /* Lightbox */
  const lb = $("#lightbox");
  if (lb) {
    const lbImg = $("#lightbox img");
    $$("[data-lightbox]").forEach((img) => img.addEventListener("click", () => {
      lbImg.src = img.dataset.full || img.src;
      lb.classList.add("open"); document.body.style.overflow = "hidden";
    }));
    const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lb-close")) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* Back to top */
  const tt = $("#toTop");
  if (tt) tt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Quote / message builder (estilo CALFERS) */
  $$(".quote").forEach((box) => {
    const phone = box.dataset.phone || "";
    const greeting = box.dataset.greeting || "Hola El Eje Cafetero,";
    const groups = $$(".q-opts", box);
    const pre = $(".q-preview pre", box);
    const waBtn = $("[data-wa]", box);
    const build = () => {
      let lines = [greeting, "", box.dataset.intro || "Me gustaría coordinar lo siguiente:", ""];
      groups.forEach((g) => {
        const sel = $(".q-opt.sel", g);
        lines.push(`▸ ${g.dataset.line}: ${sel ? sel.textContent.trim() : "—"}`);
      });
      lines.push("", box.dataset.outro || "¿Podemos coordinar los detalles? ¡Gracias!");
      const msg = lines.join("\n");
      if (pre) pre.textContent = msg;
      if (waBtn) waBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    };
    groups.forEach((g) => {
      if (!$(".q-opt.sel", g)) { const f = $(".q-opt", g); if (f) f.classList.add("sel"); }
      $$(".q-opt", g).forEach((opt) => opt.addEventListener("click", () => {
        $$(".q-opt", g).forEach((o) => o.classList.toggle("sel", o === opt));
        build();
      }));
    });
    build();
  });

  /* About — sticky story (blob cambia de color por beat) */
  const abStory = $(".ab-story");
  if (abStory) {
    const stage = $(".ab-stage", abStory);
    const num = $(".ab-stage .ab-num", abStory);
    const ill = $(".ab-stage img", abStory);
    const beats = $$(".ab-beat", abStory);
    const apply = (b) => {
      beats.forEach((x) => x.classList.toggle("active", x === b));
      if (stage && b.dataset.color) stage.style.setProperty("--c", b.dataset.color);
      if (num) num.textContent = b.dataset.num || "";
      if (ill && b.dataset.ill) ill.src = b.dataset.ill;
    };
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) apply(e.target); });
    }, { threshold: 0, rootMargin: "-45% 0px -45% 0px" });
    beats.forEach((b) => sio.observe(b));
    if (beats[0]) apply(beats[0]);
  }

  /* About — valores en pestañas */
  $$(".ab-values").forEach((v) => {
    const tabs = $$(".ab-tab", v), panels = $$(".ab-panel", v);
    const set = (val) => {
      v.dataset.active = val;
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.val === val));
      panels.forEach((p) => p.classList.toggle("active", p.dataset.val === val));
    };
    tabs.forEach((t) => t.addEventListener("click", () => set(t.dataset.val)));
  });

})();
