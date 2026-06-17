/* =========================================================
   Sakthivadivel — Portfolio interactions
   Vanilla JS. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pre = $("#preloader");
    if (pre) setTimeout(() => pre.classList.add("loaded"), 500);
  });

  /* ---------- Scroll progress ---------- */
  const progress = $(".scroll-progress");
  const onScrollProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    if (progress) progress.style.width = scrolled + "%";
  };

  /* ---------- Header scrolled state + back-to-top ---------- */
  const header = $(".header");
  const toTop = $(".to-top");
  const onScrollHeader = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 30);
    if (toTop) toTop.classList.toggle("show", y > 600);
  };

  window.addEventListener("scroll", () => {
    onScrollProgress();
    onScrollHeader();
    spyNav();
  }, { passive: true });
  onScrollHeader();

  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Mobile menu ---------- */
  const toggle = $(".menu-toggle");
  const navLinks = $(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      navLinks.classList.toggle("open");
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        toggle.classList.remove("active");
        navLinks.classList.remove("open");
      }
    });
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 74;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ---------- Scroll spy ---------- */
  const navAnchors = $$(".nav-links a");
  const sections = navAnchors
    .map((a) => $(a.getAttribute("href")))
    .filter(Boolean);
  function spyNav() {
    const pos = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((sec) => { if (sec.offsetTop <= pos) current = sec; });
    navAnchors.forEach((a) => {
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          // trigger skill bars / counters within
          if (entry.target.dataset.skill) fillSkill(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Skill bars ---------- */
  function fillSkill(el) {
    const fill = $(".skill__fill", el);
    if (fill) fill.style.width = (el.dataset.skill || 0) + "%";
  }
  // Observe the skills container independently so bars fill when seen
  const skillEls = $$("[data-skill]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { fillSkill(entry.target); sio.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    skillEls.forEach((el) => sio.observe(el));
  } else {
    skillEls.forEach((el) => fillSkill(el));
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.to);
    const dur = 1600;
    const start = performance.now();
    const isFloat = target % 1 !== 0;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
    }
    requestAnimationFrame(step);
  }
  const counters = $$("[data-to]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => { el.textContent = el.dataset.to; });
  }

  /* ---------- Typewriter ---------- */
  const typed = $(".typed");
  if (typed && !reduceMotion) {
    const words = JSON.parse(typed.dataset.words || "[]");
    let wi = 0, ci = 0, deleting = false;
    function tick() {
      const word = words[wi];
      if (deleting) { ci--; } else { ci++; }
      typed.textContent = word.slice(0, ci);
      let delay = deleting ? 45 : 90;
      if (!deleting && ci === word.length) { delay = 1600; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
      setTimeout(tick, delay);
    }
    tick();
  } else if (typed) {
    const words = JSON.parse(typed.dataset.words || "[]");
    typed.textContent = words[0] || "";
  }

  /* ---------- Project filtering ---------- */
  const filterBtns = $$(".filter-btn");
  const works = $$(".work");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      works.forEach((w) => {
        const show = f === "all" || w.dataset.cat === f;
        w.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- Testimonials slider ---------- */
  const track = $(".testi-track");
  if (track) {
    const slides = $$(".testi", track);
    const dotsWrap = $(".testi-dots");
    let idx = 0;
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "testi-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      dot.addEventListener("click", () => go(i));
      dotsWrap.appendChild(dot);
    });
    const dots = $$(".testi-dot", dotsWrap);
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("active", di === idx));
    }
    let timer = setInterval(() => go(idx + 1), 5500);
    const wrap = $(".testi-wrap");
    wrap.addEventListener("mouseenter", () => clearInterval(timer));
    wrap.addEventListener("mouseleave", () => { timer = setInterval(() => go(idx + 1), 5500); });
  }

  /* ---------- Card spotlight (mouse glow) ---------- */
  $$(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ---------- Hero card 3D tilt ---------- */
  const heroCard = $(".hero-card");
  if (heroCard && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    const wrap = heroCard.parentElement;
    wrap.addEventListener("mousemove", (e) => {
      const r = wrap.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
      heroCard.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    wrap.addEventListener("mouseleave", () => {
      heroCard.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (window.matchMedia("(pointer:fine)").matches && !reduceMotion) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = "translate(0,0)"; });
    });
  }

  /* ---------- Custom cursor ---------- */
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");
  if (dot && ring && window.matchMedia("(pointer:fine)").matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    $$("a, button, .filter-btn, [data-magnetic], input, textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }

  /* ---------- Contact form: validation + AJAX submit (delivers email) ---------- */
  const form = $("#contact-form");
  if (form) {
    const EMAIL = "sakthi.vdl@gmail.com";
    const nameEl = $("#name", form);
    const emailEl = $("#email", form);
    const msgEl = $("#message", form);
    const note = $(".form-note", form);
    const btn = $("button[type=submit]", form);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const fieldOf = (el) => el.closest(".field");
    const errOf = (el) => { const f = fieldOf(el); return f ? $(".field-error", f) : null; };

    function setError(el, msg) {
      const f = fieldOf(el); const e = errOf(el);
      if (f) f.classList.add("invalid");
      if (e) e.textContent = msg;
      el.setAttribute("aria-invalid", "true");
    }
    function clearError(el) {
      const f = fieldOf(el); const e = errOf(el);
      if (f) f.classList.remove("invalid");
      if (e) e.textContent = "";
      el.removeAttribute("aria-invalid");
    }
    function validateField(el) {
      const v = (el.value || "").trim();
      if (el === nameEl) {
        if (v.length < 2) return setError(el, "Please enter your name."), false;
      } else if (el === emailEl) {
        if (!emailRe.test(v)) return setError(el, "Please enter a valid email address."), false;
      } else if (el === msgEl) {
        if (v.length < 10) return setError(el, "Tell me a little more (at least 10 characters)."), false;
      }
      clearError(el);
      return true;
    }

    [nameEl, emailEl, msgEl].forEach((el) => {
      el.addEventListener("blur", () => validateField(el));
      el.addEventListener("input", () => { if (fieldOf(el).classList.contains("invalid")) validateField(el); });
    });

    function setNote(msg, kind) {
      if (!note) return;
      note.innerHTML = msg;
      note.classList.remove("ok", "err");
      if (kind) note.classList.add(kind);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const valid = [nameEl, emailEl, msgEl].map(validateField).every(Boolean);
      if (!valid) {
        setNote("Please fix the highlighted fields and try again.", "err");
        const firstBad = $(".field.invalid input, .field.invalid textarea", form);
        if (firstBad) firstBad.focus();
        return;
      }

      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending… <i class="fa fa-spinner fa-spin"></i>';
      setNote("Sending your message…", null);

      try {
        const res = await fetch("https://formsubmit.co/ajax/" + EMAIL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: nameEl.value.trim(),
            email: emailEl.value.trim(),
            message: msgEl.value.trim(),
            _subject: "New portfolio enquiry from " + nameEl.value.trim(),
            _template: "table",
            _captcha: "false"
          })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.success === "true" || data.success === true || res.status === 200)) {
          setNote("✓ Thank you! Your message has been sent — I'll reply within a day.", "ok");
          form.reset();
        } else {
          throw new Error((data && data.message) || "Submission failed");
        }
      } catch (err) {
        setNote('Sorry, sending failed. Please email me directly at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.', "err");
      } finally {
        btn.disabled = false;
        btn.innerHTML = original;
      }
    });
  }

  /* ---------- Resume PDF slider (PDF.js) ---------- */
  (function resume() {
    const viewer = $(".resume-viewer");
    if (!viewer) return;
    const canvas = $(".resume-canvas", viewer);
    const wrap = $(".resume-canvas-wrap", viewer);
    const loading = $(".resume-loading", viewer);
    const errorBox = $(".resume-error", viewer);
    const prevBtn = $(".resume-nav.prev", viewer);
    const nextBtn = $(".resume-nav.next", viewer);
    const dotsWrap = $(".resume-dots", viewer);
    const count = $(".resume-count", viewer);
    const url = "assets/files/Sakthivadivel-Ganesan-Resume.pdf";

    function fail() {
      if (loading) loading.hidden = true;
      if (errorBox) errorBox.hidden = false;
      if (wrap) wrap.style.display = "none";
      [prevBtn, nextBtn].forEach((b) => b && (b.style.display = "none"));
      if (dotsWrap) dotsWrap.style.display = "none";
      if (count) count.style.display = "none";
    }

    if (!window.pdfjsLib) { fail(); return; }
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    let pdf = null, page = 1, total = 1, rendering = false, pendingResize = false;

    function updateChrome() {
      if (count) count.textContent = "Page " + page + " of " + total;
      if (prevBtn) prevBtn.disabled = page <= 1;
      if (nextBtn) nextBtn.disabled = page >= total;
      $$(".resume-dot", dotsWrap).forEach((d, i) =>
        d.setAttribute("aria-current", String(i + 1 === page))
      );
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (let i = 1; i <= total; i++) {
        const dot = document.createElement("button");
        dot.className = "resume-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to page " + i);
        dot.addEventListener("click", () => go(i));
        dotsWrap.appendChild(dot);
      }
    }

    async function render() {
      if (!pdf || rendering) return;
      rendering = true;
      try {
        const pg = await pdf.getPage(page);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const avail = (wrap ? wrap.clientWidth : canvas.clientWidth) || 720;
        const base = pg.getViewport({ scale: 1 });
        const scale = Math.min(avail / base.width, 1.6); // cap so it stays crisp, not huge
        const vp = pg.getViewport({ scale: scale * dpr });
        const ctx = canvas.getContext("2d");
        canvas.width = vp.width;
        canvas.height = vp.height;
        canvas.style.width = vp.width / dpr + "px";
        canvas.style.height = vp.height / dpr + "px";
        await pg.render({ canvasContext: ctx, viewport: vp }).promise;
        if (loading) loading.hidden = true;
      } catch (e) {
        fail();
      } finally {
        rendering = false;
        if (pendingResize) { pendingResize = false; render(); }
      }
    }

    function go(n) {
      const next = Math.max(1, Math.min(total, n));
      if (next === page) return;
      page = next;
      updateChrome();
      render();
    }

    if (prevBtn) prevBtn.addEventListener("click", () => go(page - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(page + 1));

    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (rendering) pendingResize = true; else render(); }, 200);
    }, { passive: true });

    pdfjsLib.getDocument(url).promise.then((doc) => {
      pdf = doc;
      total = doc.numPages;
      page = 1;
      buildDots();
      updateChrome();
      render();
    }).catch(fail);
  })();

  /* ---------- Adobe XD prototypes modal ---------- */
  (function prototypes() {
    const modal = $("#proto-modal");
    const openBtns = $$("[data-open-prototypes]");
    if (!modal || !openBtns.length) return;
    const dialog = $(".proto-dialog", modal);
    let lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      void modal.offsetWidth; // reflow so the open transition runs
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
      const closeBtn = $(".proto-close", modal);
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      if (modal.hidden) return;
      modal.classList.remove("open");
      document.body.style.overflow = "";
      const done = () => { modal.hidden = true; dialog.removeEventListener("transitionend", done); };
      dialog.addEventListener("transitionend", done);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openBtns.forEach((b) => b.addEventListener("click", open));
    $$("[data-proto-close]", modal).forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  })();

  /* ---------- Theme switcher (System / Light / Dark) ---------- */
  (function theme() {
    const btns = $$(".theme-switch__btn");
    if (!btns.length) return;
    const root = document.documentElement;
    const meta = $('meta[name="theme-color"]');
    const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    const STORE = "theme";
    const themeColors = { dark: "#07070c", light: "#f5f6fb" };

    const stored = () => {
      try { return localStorage.getItem(STORE) || "system"; } catch (e) { return "system"; }
    };
    const effective = (pref) =>
      pref === "system" ? (darkMq.matches ? "dark" : "light") : pref;

    function apply(pref) {
      const eff = effective(pref);
      root.setAttribute("data-theme", eff);
      if (meta) meta.setAttribute("content", themeColors[eff] || themeColors.dark);
      btns.forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.themeChoice === pref))
      );
    }

    btns.forEach((b) => {
      b.addEventListener("click", () => {
        const pref = b.dataset.themeChoice;
        try { localStorage.setItem(STORE, pref); } catch (e) {}
        apply(pref);
      });
    });

    // Live-update while on "System" if the OS theme changes.
    const onSystemChange = () => { if (stored() === "system") apply("system"); };
    if (darkMq.addEventListener) darkMq.addEventListener("change", onSystemChange);
    else if (darkMq.addListener) darkMq.addListener(onSystemChange);

    apply(stored());
  })();

  /* ---------- Footer year ---------- */
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
