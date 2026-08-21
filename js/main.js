/* ===========================================================
   EL EJE CAFETERO — interacciones (v3)
   =========================================================== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Preloader */
  window.addEventListener("load", () => {
    const pre = $("#preloader");
    if (pre) setTimeout(() => pre.classList.add("done"), 500);
  });

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

  /* Menu filters */
  const filterBtns = $$(".filter-btn");
  if (filterBtns.length) {
    filterBtns.forEach((btn) => btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      $$(".menu-cat").forEach((sec) => { sec.style.display = (cat === "all" || sec.dataset.cat === cat) ? "" : "none"; });
      if (cat !== "all") {
        const el = $(`.menu-cat[data-cat="${cat}"]`);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" });
      }
    }));
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
