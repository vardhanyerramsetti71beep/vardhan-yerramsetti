/* Vardhan Yerramsetti — cinematic portfolio */
var Sound = { on: false, ctx: null, gain: null, tick() {} };

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Split text ---------- */
  $$(".split").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "char";
      s.textContent = ch === " " ? " " : ch;
      el.appendChild(s);
    });
  });
  const story = $("#storyText");
  if (story) story.innerHTML = story.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(" ");

  startTimecode();
  initSound();
  initScratches();
  initEmbers();

  /* ---------- No-animation fallback ---------- */
  if (!hasGSAP || reduceMotion) {
    document.documentElement.classList.add("static");
    document.body.classList.remove("is-loading");
    $(".leader")?.remove();
    $$(".story-text .word").forEach((w) => (w.style.opacity = 1));
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 2 });
      else target.scrollIntoView({ behavior: "smooth" });
    })
  );

  /* =====================================================
     OPENING: film-leader countdown → "presents" → letterbox opens
     ===================================================== */
  const lbScale = () => (window.innerHeight / 2) / $(".lb-top").offsetHeight + 0.05;
  const video = $("#introVideo");
  const intro = gsap.timeline({ paused: true });

  gsap.set(".lb", { scaleY: lbScale });
  gsap.set(".hero-media img", { scale: 1.45, filter: "saturate(.85) contrast(1.12) brightness(0)" });

  // When the intro video ends: quick projector flash, then the letterbox opens on the hero.
  intro
    .to(".leader-flash", { opacity: 1, duration: 0.08 }, 0)
    .set(video, { autoAlpha: 0 }, 0.08)
    .to(".leader-flash", { opacity: 0, duration: 0.5 }, 0.08)
    .addLabel("reveal", 0.35)
    .set(".leader", { autoAlpha: 0 }, "reveal")
    .add(() => {
      document.body.classList.remove("is-loading");
      lenis?.start();
      $(".leader").style.display = "none";
      try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
    }, "reveal")
    .to(".lb", { scaleY: 1, duration: 1.6, ease: "expo.inOut" }, "reveal")
    .to(".hero-media img", { scale: 1.06, filter: "saturate(.85) contrast(1.12) brightness(.9)", duration: 2.6, ease: "expo.out" }, "reveal+=0.3")
    .from(".t-big .char", { yPercent: 110, duration: 1.4, stagger: 0.06, ease: "expo.out" }, "reveal+=0.9")
    .from(".t-script .char", { yPercent: 110, opacity: 0, duration: 1.2, stagger: 0.03, ease: "expo.out" }, "reveal+=1.2")
    .from(".hero-kicker, .hero-sub, .hero-cta, .hero-credits-top, .hero-side, .hero-billing", { opacity: 0, y: 24, duration: 1, stagger: 0.08, ease: "power3.out" }, "reveal+=1.3")
    .from(".nav", { opacity: 0, y: -20, duration: 0.8 }, "reveal+=1.5");

  let introSeen = false;
  try { introSeen = sessionStorage.getItem("introSeen") === "1"; } catch (e) {}
  let introDone = false;
  const finishIntro = (jump) => {
    if (introDone) return;
    introDone = true;
    video.pause();
    if (jump) intro.seek("reveal");
    intro.play();
  };

  if (introSeen || !video) {
    video?.removeAttribute("src");
    video?.load();
    finishIntro(true);
  } else {
    video.addEventListener("playing", () => video.classList.add("is-playing"), { once: true });
    video.addEventListener("ended", () => finishIntro(false));
    video.addEventListener("error", () => finishIntro(true));
    // If the video is blocked or the connection is too slow, don't keep visitors waiting.
    const startTimer = setTimeout(() => { if (video.currentTime === 0) finishIntro(true); }, 5000);
    video.addEventListener("playing", () => clearTimeout(startTimer), { once: true });
    const p = video.play();
    if (p && p.catch) p.catch(() => finishIntro(true));
  }
  $(".skip")?.addEventListener("click", () => finishIntro(true));

  /* =====================================================
     HERO: scroll pushes into the photo, title drifts apart, letterbox closes
     ===================================================== */
  const heroTl = gsap.timeline({
    scrollTrigger: { trigger: ".hero", start: "top top", end: "+=110%", scrub: 1, pin: true, refreshPriority: 2 },
  });
  heroTl
    .fromTo(".hero-media img", { scale: 1.06 }, { scale: 1.45, ease: "none", immediateRender: false }, 0)
    .to(".hero-title", { y: -60, opacity: 0, ease: "power1.in" }, 0)
    .to(".hero-credits-top, .hero-side, .hero-billing", { opacity: 0, ease: "none", duration: 0.4 }, 0);
  $$(".t-big .char").forEach((c, i, arr) => {
    const mid = (arr.length - 1) / 2;
    heroTl.to(c, { x: (i - mid) * 70, filter: "blur(6px)", ease: "none" }, 0);
  });
  heroTl.fromTo(".lb", { scaleY: 1 }, { scaleY: lbScale, ease: "power2.in", immediateRender: false }, 0.45);

  // Photo follows the mouse a little
  if (finePointer) {
    const mx = gsap.quickTo(".hero-media", "x", { duration: 1.2, ease: "power3.out" });
    const my = gsap.quickTo(".hero-media", "y", { duration: 1.2, ease: "power3.out" });
    window.addEventListener("mousemove", (e) => {
      mx((e.clientX / innerWidth - 0.5) * -24);
      my((e.clientY / innerHeight - 0.5) * -16);
    });
  }

  /* =====================================================
     CHAPTER CARDS
     ===================================================== */
  $$(".chapter").forEach((ch) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ch, start: "top 70%", end: "bottom 30%", scrub: true } });
    tl.fromTo($(".chapter-no", ch), { opacity: 0, letterSpacing: "1.6em" }, { opacity: 1, letterSpacing: "0.6em", duration: 0.35 })
      .fromTo($(".chapter-title", ch), { opacity: 0, scale: 0.75, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.4 }, 0)
      .fromTo($(".chapter-line", ch), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0.15)
      .to({}, { duration: 0.3 })
      .to($(".chapter-inner", ch), { opacity: 0, scale: 1.25, filter: "blur(10px)", duration: 0.35, ease: "power1.in" });
  });

  /* =====================================================
     STORY
     ===================================================== */
  gsap.fromTo(".story-photo", { clipPath: "inset(100% 0 0 0)" }, {
    clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut",
    scrollTrigger: { trigger: ".story-photo", start: "top 80%" },
  });
  gsap.fromTo(".story-photo img", { yPercent: -10 }, {
    yPercent: 0, ease: "none",
    scrollTrigger: { trigger: ".story-photo", start: "top bottom", end: "bottom top", scrub: true },
  });
  gsap.to(".story-text .word", {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: ".story-text", start: "top 80%", end: "bottom 50%", scrub: true },
  });
  gsap.from(".avail", { opacity: 0, y: 20, scrollTrigger: { trigger: ".avail", start: "top 92%" } });
  gsap.from(".stat", { y: 50, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".stats", start: "top 85%" } });
  $$("[data-count]").forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 2.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* =====================================================
     WORK — horizontal reel with motion-blur skew
     ===================================================== */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const track = $("#workTrack");
    const reels = $$(".reel", track);
    const counter = $("#workIndex");
    const dist = () => track.scrollWidth - innerWidth;
    const skewTo = gsap.quickTo(reels, "skewX", { duration: 0.5, ease: "power3.out" });

    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: ".work", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1,
        invalidateOnRefresh: true, refreshPriority: 1,
        onUpdate: (self) => {
          skewTo(gsap.utils.clamp(-8, 8, self.getVelocity() / -400));
          const i = Math.min(reels.length, Math.round(self.progress * (reels.length - 1)) + 1);
          counter.textContent = String(i).padStart(2, "0");
        },
      },
    });
    gsap.to(".work-ghost", { xPercent: -30, ease: "none", scrollTrigger: { trigger: ".work", start: "top top", end: () => "+=" + dist(), scrub: true } });
    reels.forEach((r) => {
      gsap.fromTo(r, { opacity: 0.35, scale: 0.88 }, { opacity: 1, scale: 1, ease: "none", scrollTrigger: { trigger: r, containerAnimation: tween, start: "left 100%", end: "left 40%", scrub: true } });
    });
  });
  mm.add("(max-width: 900px)", () => {
    $$(".reel").forEach((r) => gsap.from(r, { y: 70, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: r, start: "top 90%" } }));
  });

  /* =====================================================
     CAST, JOURNEY
     ===================================================== */
  gsap.from(".cast .eyebrow, .cast .section-title", { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".cast", start: "top 75%" } });
  gsap.from(".cast-row", { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ".cast-list", start: "top 85%" } });

  gsap.to(".timeline-line span", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true } });
  $$(".scene").forEach((s) => gsap.from(s, { x: 60, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: s, start: "top 85%" } }));

  /* =====================================================
     END CREDITS ROLL
     ===================================================== */
  const roll = $("#creditsRoll");
  gsap.set(roll, { xPercent: -50, x: 0 });
  gsap.fromTo(roll, { y: () => innerHeight * 0.6 }, {
    y: () => -roll.offsetHeight + innerHeight * 0.5, ease: "none",
    scrollTrigger: { trigger: ".credits", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
  });

  /* =====================================================
     CONTACT
     ===================================================== */
  gsap.from(".contact-title .char", { yPercent: 110, duration: 1.2, stagger: 0.03, ease: "expo.out", scrollTrigger: { trigger: ".contact-title", start: "top 80%" } });
  gsap.from(".contact .eyebrow, .contact-mail, .contact-links a", { y: 30, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: ".contact-title", start: "top 70%" } });

  /* =====================================================
     NAV
     ===================================================== */
  const nav = $(".nav");
  const bar = $(".scroll-progress span");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      nav.classList.toggle("scrolled", self.scroll() > innerHeight * 0.9);
      gsap.set(bar, { scaleX: self.progress });
    },
  });
  $$(".nav-links a").forEach((link) => {
    const sec = $(link.getAttribute("href"));
    if (sec) ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", onToggle: (s) => link.classList.toggle("active", s.isActive) });
  });

  // Letters scramble on hover
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/";
  $$("[data-scramble]").forEach((el) => {
    const original = el.textContent;
    let frame = 0, raf;
    el.addEventListener("mouseenter", () => {
      cancelAnimationFrame(raf);
      frame = 0;
      const run = () => {
        el.textContent = [...original].map((c, i) => (i < frame / 2 ? c : glyphs[(Math.random() * glyphs.length) | 0])).join("");
        frame++;
        if (frame / 2 <= original.length) raf = requestAnimationFrame(run);
        else el.textContent = original;
      };
      run();
    });
  });

  /* =====================================================
     CURSOR + MAGNETIC
     ===================================================== */
  if (finePointer) {
    const cursor = $(".cursor"), dot = $(".cursor-dot"), ring = $(".cursor-ring"), label = $(".cursor-label");
    const dx = gsap.quickTo(dot, "x", { duration: 0.1 }), dy = gsap.quickTo(dot, "y", { duration: 0.1 });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    window.addEventListener("mousemove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => { label.textContent = el.dataset.cursor; cursor.classList.add("is-active"); });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    });
    $$(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  // Pinned sections add scroll distance, so order triggers by page position.
  ScrollTrigger.sort();
  window.addEventListener("load", () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();

/* ---------- Film scratches that flash now and then ---------- */
function initScratches() {
  const lines = [...document.querySelectorAll(".scratches i")];
  if (!lines.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(() => {
    lines.forEach((l) => {
      if (Math.random() < 0.12) {
        l.style.left = Math.random() * 100 + "%";
        l.style.opacity = (Math.random() * 0.5 + 0.2).toFixed(2);
        l.style.height = Math.random() * 60 + 40 + "%";
        l.style.top = Math.random() * 30 + "%";
      } else l.style.opacity = 0;
    });
  }, 90);
}

/* ---------- Floating embers in the hero ---------- */
function initEmbers() {
  const canvas = document.getElementById("embers");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let w, h, ps = [], visible = true;
  const spawn = (any) => ({ x: Math.random() * w, y: any ? Math.random() * h : h + 10, r: Math.random() * 1.8 + 0.4, vy: Math.random() * 0.5 + 0.15, vx: (Math.random() - 0.5) * 0.25, a: Math.random() * 0.6 + 0.25, t: Math.random() * 6.28 });
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ps = Array.from({ length: Math.round(Math.min(110, (w * h) / 13000)) }, () => spawn(true));
  }
  function draw() {
    requestAnimationFrame(draw);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    ctx.shadowColor = "rgba(255,120,50,.9)";
    ctx.shadowBlur = 10;
    for (const p of ps) {
      p.t += 0.02; p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.3;
      if (p.y < -10) Object.assign(p, spawn(false));
      ctx.fillStyle = `rgba(242,180,90,${p.a * (0.55 + Math.sin(p.t * 3) * 0.45)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
    }
  }
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  addEventListener("resize", resize);
  resize(); draw();
}

/* ---------- Film timecode in the nav ---------- */
function startTimecode() {
  const el = document.getElementById("timecode");
  if (!el) return;
  const start = performance.now(), pad = (n) => String(n).padStart(2, "0");
  (function tick() {
    const ms = performance.now() - start, s = Math.floor(ms / 1000);
    el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(Math.floor((ms % 1000) / 41.67))}`;
    requestAnimationFrame(tick);
  })();
}

/* ---------- Optional projector sound (off by default) ---------- */
function initSound() {
  const btn = document.querySelector(".sound");
  if (!btn) return;
  const label = btn.querySelector(".sound-label");

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const ctx = new AC();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      // soft brown noise = projector hum
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      let v = last * 3;
      // 24 clicks per second = film running through the gate
      const phase = (i / ctx.sampleRate) * 24 % 1;
      if (phase < 0.012) v += (Math.random() * 2 - 1) * 0.35;
      d[i] = v;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 2200;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(lp).connect(gain).connect(ctx.destination);
    src.start();
    Sound.ctx = ctx; Sound.gain = gain;
    return true;
  }

  Sound.tick = () => {
    if (!Sound.on || !Sound.ctx) return;
    const ctx = Sound.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 1000;
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.13);
  };

  btn.addEventListener("click", () => {
    if (!Sound.ctx && !build()) return;
    Sound.on = !Sound.on;
    Sound.ctx.resume();
    Sound.gain.gain.setTargetAtTime(Sound.on ? 0.22 : 0, Sound.ctx.currentTime, 0.3);
    btn.setAttribute("aria-pressed", String(Sound.on));
    label.textContent = Sound.on ? "Sound on" : "Sound off";
  });
}
