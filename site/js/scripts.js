/* =============================================================
   Laura Eckert — Portfolio · interactions
   ============================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const isTouch = coarsePointer || window.innerWidth <= 768;
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".header");
  root.classList.add("js-motion");

  const scrollSubscribers = new Set();
  let currentScrollY = window.scrollY || window.pageYOffset || 0;
  let lenis = null;

  const getScrollY = () => currentScrollY;
  const publishScroll = (y) => {
    currentScrollY = y;
    scrollSubscribers.forEach((fn) => fn(y));
  };
  const onScrollValue = (fn) => {
    scrollSubscribers.add(fn);
    fn(currentScrollY);
    return () => scrollSubscribers.delete(fn);
  };
  window.__subscribeScroll = onScrollValue;
  window.__getScrollY = getScrollY;

  const syncScrollEngine = () => {
    if (lenis) lenis.resize();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  };

  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.08,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    lenis.on("scroll", ({ scroll }) => publishScroll(scroll));
    window.lenis = lenis;
    body.classList.add("has-lenis");
  } else {
    window.addEventListener("scroll", () => publishScroll(window.scrollY || window.pageYOffset || 0), { passive: true });
  }

  const scrollToY = (target) => {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.05 });
    } else {
      window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  /* ---------- Dynamic year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Live local clock (Brazil, GMT-3) ---------- */
  const clockEls = document.querySelectorAll("[data-clock]");
  if (clockEls.length) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => {
      const now = new Date();
      const label = fmt.format(now) + " BRT";
      const iso = now.toISOString();
      clockEls.forEach((el) => {
        el.textContent = label;
        if (el.tagName === "TIME") el.setAttribute("datetime", iso);
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  const fireSiteReady = () => {
    syncScrollEngine();
    window.dispatchEvent(new CustomEvent("site:ready"));
  };

  /* ---------- Magnetic CTAs ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.getAttribute("data-magnetic")) || 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.translate = x.toFixed(2) + "px " + y.toFixed(2) + "px";
      }, { passive: true });
      el.addEventListener("mouseleave", () => { el.style.translate = "0 0"; });
    });
  }

  /* ---------- Smooth in-page anchors (Lenis-aware) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const offset = (header?.offsetHeight || 0) + 8;
      if (lenis) {
        lenis.scrollTo(target, { offset: -offset, duration: 1.05 });
      } else {
        scrollToY(Math.max(0, target.getBoundingClientRect().top + getScrollY() - offset));
      }
    });
  });

  /* ---------- Nav scroll spy ---------- */
  const navLinks = Array.from(document.querySelectorAll("[data-nav-section]"));
  if (navLinks.length) {
    const navMap = navLinks.map((link) => ({
      link,
      section: document.getElementById(link.getAttribute("data-nav-section")),
    })).filter((entry) => entry.section);
    const syncNav = () => {
      const marker = window.innerHeight * 0.38;
      let active = navMap[0]?.link || null;
      navMap.forEach(({ link, section }) => {
        const r = section.getBoundingClientRect();
        if (r.top <= marker && r.bottom >= marker) active = link;
      });
      navLinks.forEach((link) => link.classList.toggle("is-active", link === active));
    };
    onScrollValue(syncNav);
    syncNav();
    window.addEventListener("resize", syncNav, { passive: true });
  }

  document.documentElement.removeAttribute("data-theme");
  try { localStorage.removeItem("theme"); } catch (_) {}

  /* ---------- Custom cursor — reticle de precisão ---------- */
  if (!isTouch && !reduceMotion) {
    body.classList.add("has-custom-cursor");

    const cursor = document.createElement("div");
    cursor.className = "cursorx is-rest";
    cursor.innerHTML =
      '<svg class="cursorx__cross" viewBox="0 0 30 30" width="30" height="30" fill="none" aria-hidden="true">' +
        '<line x1="15" y1="2" x2="15" y2="11"/><line x1="15" y1="19" x2="15" y2="28"/>' +
        '<line x1="2" y1="15" x2="11" y2="15"/><line x1="19" y1="15" x2="28" y2="15"/>' +
        '<circle class="cursorx__dot" cx="15" cy="15" r="1.25"/>' +
      '</svg>' +
      '<span class="cursorx__ripple" aria-hidden="true"></span>' +
      '<svg class="cursorx__scroll" viewBox="0 0 28 40" width="28" height="40" fill="none" aria-hidden="true">' +
        '<line x1="14" y1="4" x2="14" y2="30"/>' +
        '<line x1="8" y1="24" x2="14" y2="32"/><line x1="20" y1="24" x2="14" y2="32"/>' +
      '</svg>' +
      '<span class="cursorx__readout"></span>' +
      '<span class="cursorx__label"></span>';

    const frameBox = document.createElement("div");
    frameBox.className = "cursorx-frame";
    frameBox.innerHTML =
      '<span class="cursorx-frame__c cursorx-frame__c--tl"></span>' +
      '<span class="cursorx-frame__c cursorx-frame__c--tr"></span>' +
      '<span class="cursorx-frame__c cursorx-frame__c--bl"></span>' +
      '<span class="cursorx-frame__c cursorx-frame__c--br"></span>';

    body.appendChild(frameBox);
    body.appendChild(cursor);

    const readout = cursor.querySelector(".cursorx__readout");
    const label = cursor.querySelector(".cursorx__label");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cur = { x: pos.x, y: pos.y };
    let active = false;
    let mode = "rest";        // rest | hover | scroll
    let frameEl = null;       // elemento com brackets travados
    const FRAME_PAD = 6;

    const setMode = (next) => {
      if (mode === next) return;
      cursor.classList.remove("is-rest", "is-hover", "is-scroll");
      cursor.classList.add("is-" + next);
      mode = next;
    };

    const snapFrame = (el) => {
      const r = el.getBoundingClientRect();
      frameBox.style.transform = "translate(" + (r.left - FRAME_PAD).toFixed(1) + "px," + (r.top - FRAME_PAD).toFixed(1) + "px)";
      frameBox.style.width = (r.width + FRAME_PAD * 2).toFixed(1) + "px";
      frameBox.style.height = (r.height + FRAME_PAD * 2).toFixed(1) + "px";
      frameBox.classList.add("is-on");
    };
    const clearFrame = () => {
      frameBox.classList.remove("is-on");
      frameEl = null;
    };

    const syncFrame = () => {
      if (frameEl) snapFrame(frameEl);
    };

    window.addEventListener("resize", syncFrame, { passive: true });
    window.addEventListener("scroll", syncFrame, { passive: true });

    const ripple = cursor.querySelector(".cursorx__ripple");

    const pulseClick = () => {
      ripple.classList.remove("is-pulse");
      void ripple.offsetWidth;
      ripple.classList.add("is-pulse");
    };

    const render = () => {
      if (mode === "rest") {
        cur.x += (pos.x - cur.x) * 0.26;
        cur.y += (pos.y - cur.y) * 0.26;
        readout.textContent = Math.round(pos.x) + " · " + Math.round(pos.y);
      } else {
        cur.x = pos.x;
        cur.y = pos.y;
        readout.textContent = "";
      }
      cursor.style.transform = "translate(" + cur.x.toFixed(2) + "px," + cur.y.toFixed(2) + "px)";
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    document.addEventListener("mousemove", (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!active) { active = true; cursor.style.opacity = "1"; }
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      active = false;
      cursor.style.opacity = "0";
      cursor.classList.remove("is-press");
      clearFrame();
      setMode("rest");
    });

    document.addEventListener("mousedown", () => {
      if (!active) return;
      cursor.classList.add("is-press");
      pulseClick();
    });
    document.addEventListener("mouseup", () => cursor.classList.remove("is-press"));

    const enterTarget = (el, text) => {
      const t = (text || "").trim();
      label.textContent = t;
      if (/scroll/i.test(t)) {
        clearFrame();
        setMode("scroll");
      } else {
        frameEl = el;
        snapFrame(el);
        setMode("hover");
      }
    };
    const leaveTarget = () => {
      clearFrame();
      label.textContent = "";
      setMode("rest");
    };

    document.querySelectorAll("[data-cursor], a, button").forEach((el) => {
      const text = el.getAttribute("data-cursor") || "";
      el.addEventListener("mouseenter", () => enterTarget(el, text));
      el.addEventListener("mouseleave", leaveTarget);
    });

    window.__cursorLabel = (text) => {
      if (!active) return;
      const t = (text || "").trim();
      label.textContent = t;
      if (!t) { clearFrame(); setMode("rest"); return; }
      clearFrame();
      setMode("hover");
    };
  }

  /* ---------- Atmosphere layer (WebGL + fallback) — after preloader so it
     doesn't compete with first paint / Lenis height measurement. ---------- */
  (function initAtmosphere() {
    const host = document.querySelector("[data-atmosphere]");
    const canvas = document.querySelector("[data-atmosphere-canvas]");
    if (!host || !canvas) return;

    if (reduceMotion) {
      host.classList.add("is-fallback");
      return;
    }

    let started = false;
    const boot = () => {
      if (started) return;
      started = true;
      startAtmosphere(host, canvas);
    };
    window.addEventListener("site:ready", boot, { once: true });
    setTimeout(boot, 3200);
  })();

  function startAtmosphere(host, canvas) {

    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, powerPreference: "high-performance" });
    if (!gl) {
      host.classList.add("is-fallback");
      return;
    }

    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";
    const fs = "precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform float s;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(h(i+vec2(0.,0.)),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}float fbm(vec2 p){float v=0.;float a=.55;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.52;}return v;}void main(){vec2 uv=(gl_FragCoord.xy/r.xy);vec2 p=uv*vec2(r.x/r.y,1.0);vec2 drift=vec2(t*0.015,t*0.008);vec2 mouse=(m-0.5)*0.26;float flow=fbm((p+drift+mouse)+vec2(0.,s*0.00012));float f2=fbm((p*1.5)-drift*0.55-mouse*0.6);vec3 warm=vec3(0.985,0.965,0.925);vec3 blush=vec3(0.79,0.16,0.49);vec3 peach=vec3(0.98,0.76,0.67);float mask=smoothstep(0.25,0.88,flow);vec3 col=mix(warm,mix(blush,peach,0.5+0.5*sin(t*0.07+f2*6.2831)),mask*0.42);float vign=smoothstep(1.25,0.18,length(uv-0.5));col=mix(warm,col,vign);gl_FragColor=vec4(col,0.58);}";

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
      return shader;
    };
    const vert = compile(gl.VERTEX_SHADER, vs);
    const frag = compile(gl.FRAGMENT_SHADER, fs);
    if (!vert || !frag) {
      host.classList.add("is-fallback");
      return;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      host.classList.add("is-fallback");
      return;
    }
    gl.useProgram(prog);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "r");
    const uTime = gl.getUniformLocation(prog, "t");
    const uMouse = gl.getUniformLocation(prog, "m");
    const uScroll = gl.getUniformLocation(prog, "s");

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.uniform2f(uRes, w, h);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - (e.clientY / window.innerHeight);
    }, { passive: true });

    let visible = !document.hidden;
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
    const render = (now) => {
      if (visible) {
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        gl.uniform1f(uTime, now * 0.001);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uScroll, getScrollY());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  /* ---------- Preloader ---------- */
  const pre = document.querySelector(".preloader");
  const heroSection = document.querySelector(".hero");
  const enterHero = () => {
    if (heroSection) heroSection.classList.add("is-entered");
  };
  window.addEventListener("site:ready", enterHero);
  if (reduceMotion) enterHero();

  if (pre) {
    const seen = sessionStorage.getItem("preloaded");
    const pctEl = pre.querySelector("[data-preload-pct]");
    let loadPct = 0;
    const setPct = (v) => {
      loadPct = Math.min(100, Math.max(loadPct, v));
      if (pctEl) pctEl.textContent = String(Math.round(loadPct));
    };
    if (seen || reduceMotion) {
      pre.remove();
      body.classList.remove("is-loading");
      requestAnimationFrame(fireSiteReady);
    } else {
      body.classList.add("is-loading");
      const name = pre.querySelector(".preloader__name");
      const role = pre.querySelector(".preloader__role");
      const letters = (name.textContent || "").split("");
      name.innerHTML = letters.map((c) => "<span>" + (c === " " ? "&nbsp;" : c) + "</span>").join("");
      const spans = name.querySelectorAll("span");
      spans.forEach((s, i) => {
        s.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 500, delay: i * 50, fill: "forwards", easing: "cubic-bezier(0.22,1,0.36,1)" }
        );
      });
      let fake = 0;
      const fakeTimer = setInterval(() => {
        fake += 4 + Math.random() * 9;
        setPct(Math.min(fake, 86));
      }, 110);
      if (document.fonts?.ready) document.fonts.ready.then(() => setPct(72));
      window.addEventListener("load", () => {
        clearInterval(fakeTimer);
        setPct(100);
      }, { once: true });
      const nameDone = letters.length * 50 + 500;
      setTimeout(() => {
        if (role) role.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards" });
      }, nameDone);
      setTimeout(() => {
        pre.style.transition = "clip-path 0.8s cubic-bezier(0.76,0,0.24,1), opacity 0.6s ease 0.5s";
        pre.style.clipPath = "inset(0 0 100% 0)";
        pre.classList.add("is-done");
        body.classList.remove("is-loading");
        syncScrollEngine();
        sessionStorage.setItem("preloaded", "1");
        fireSiteReady();
        setTimeout(() => pre.remove(), 1200);
      }, Math.min(nameDone + 700, 2600));
    }
  } else {
    requestAnimationFrame(fireSiteReady);
  }

  /* ---------- Hero portrait parallax — removed (typography-led hero) ---------- */

  /* ---------- Header scroll state ---------- */
  onScrollValue((y) => {
    if (header) header.classList.toggle("is-scrolled", y > 40);
  });

  /* ---------- Scroll progress bar ---------- */
  const bar = document.querySelector(".scroll-progress");
  if (bar) {
    onScrollValue((y) => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (y / h) * 100 : 0;
      bar.style.width = p + "%";
    });
  }

  /* ---------- Back to top ---------- */
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    onScrollValue((y) => {
      toTop.classList.toggle("is-visible", y > window.innerHeight);
    });
    toTop.addEventListener("click", () => scrollToY(0));
  }
  document.querySelectorAll("[data-to-top]").forEach((btn) => {
    btn.addEventListener("click", () => scrollToY(0));
  });

  /* ---------- Animated social icons (Lottie) ---------- */
  if (window.lottie) {
    document.querySelectorAll(".ua-btn").forEach((btn) => {
      const mount = btn.querySelector(".ua-icon");
      const name = btn.getAttribute("data-icon");
      if (!mount || !name) return;
      const anim = window.lottie.loadAnimation({
        container: mount,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "assets/icons/" + name + ".json",
      });
      if (reduceMotion) return;
      const playFwd = () => { anim.setDirection(1); anim.play(); };
      const playRev = () => { anim.setDirection(-1); anim.play(); };
      btn.addEventListener("mouseenter", playFwd);
      btn.addEventListener("mouseleave", playRev);
      btn.addEventListener("focus", playFwd);
      btn.addEventListener("blur", playRev);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".section, .reveal, [data-stagger]");
  const reveal = (el) => {
    if (el.classList.contains("is-in")) return;
    if (el.hasAttribute("data-stagger")) {
      const step = parseFloat(el.getAttribute("data-stagger")) || 0.05;
      const kids = Array.from(el.children);
      kids.forEach((child, i) => { child.style.transitionDelay = i * step + "s"; });
      // Clear the stagger delays once the reveal finishes so they don't leak
      // into hover/active transitions (which would feel like a stall on hover).
      const settleMs = (kids.length * step + 0.28) * 1000;
      setTimeout(() => { kids.forEach((child) => { child.style.transitionDelay = ""; }); }, settleMs);
    }
    el.classList.add("is-in");
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
    revealEls.forEach((el) => io.observe(el));

    let queued = false;
    const sweep = () => {
      queued = false;
      const vh = window.innerHeight;
      revealEls.forEach((el) => {
        if (el.classList.contains("is-in")) return;
        if (el.getBoundingClientRect().top < vh * 0.92) {
          reveal(el);
          io.unobserve(el);
        }
      });
    };
    onScrollValue(() => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(sweep);
      }
    });
    window.addEventListener("resize", sweep, { passive: true });
    window.addEventListener("load", sweep);
    setTimeout(sweep, 400);
    setTimeout(sweep, 1200);
  } else {
    revealEls.forEach(reveal);
  }

  /* ---------- Footer wordmark slide-in ---------- */
  const signoff = document.querySelector(".footer--reveal");
  if (signoff) {
    if ("IntersectionObserver" in window) {
      const fio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) signoff.classList.add("is-revealed");
          document.body.classList.toggle("signoff-active", entry.isIntersecting);
        });
      }, { threshold: 0.25 });
      fio.observe(signoff);
    } else {
      signoff.classList.add("is-revealed");
    }
  }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute("data-count"));
        const suffix = el.getAttribute("data-suffix") || "";
        const dur = 1500;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
          el.textContent = val + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Pinned 3D card-stack (Selected Work) ---------- */
  const pin = document.querySelector(".works-pin");
  const cards = Array.prototype.slice.call(document.querySelectorAll(".proj"));
  const workSection = document.querySelector(".section.work");
  const counter = document.querySelector(".works-counter__cur");
  const workDisplay = document.querySelector("[data-works-display]");
  if (pin && cards.length && !isTouch && !reduceMotion) {
    const n = cards.length;
    let ticking = false;
    // Shared per-card progress math (single source of truth for transform + clip).
    const INTRO_HOLD = 0.15;
    const LEAD = 0.5 / n;
    const END_MARGIN = 0.04;
    const SPAN = Math.max(1 - LEAD - END_MARGIN, 0.001);
    const STEP = n > 1 ? SPAN / (n - 1) : 1;
    const VELO = n > 1 ? 1 / STEP : n;
    const pcFromPin = (p) =>
      Math.min(Math.max((p - INTRO_HOLD) / (1 - INTRO_HOLD), 0), 1);
    const cardD = (pc, i) => {
      const c = n > 1 ? LEAD + i * STEP : 0.5;
      let d = (pc - c) * VELO;
      return Math.max(-1.5, Math.min(1.5, d));
    };
    const apply = () => {
      ticking = false;
      const rect = pin.getBoundingClientRect();
      const dist = Math.max(pin.offsetHeight - window.innerHeight, 1);
      const p = Math.min(Math.max(-rect.top / dist, 0), 1);
      // Hold the ghost "Selected Work" alone at the top before the cards engage.
      const introHold = INTRO_HOLD;
      const pc = pcFromPin(p);
      let active = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        let d = cardD(pc, i);
        const ad = Math.min(Math.abs(d), 1);
        const eased = Math.pow(ad, 1.3);
        const vh = window.innerHeight;
        const lane = vh * 1.18;
        let ty = -d * lane;
        const panelTy = -d * lane;
        if (i === 0 && pc < 0.2) {
          const introBlend = 1 - pc / 0.2;
          ty += introBlend * vh * 0.5;
        }
        const rot = -d * 28;
        const scale = 1 - eased * 0.32;
        const op = Math.max(0, 1 - eased * 1.35);
        const panel = card.querySelector(".proj__panel");
        const float = card.querySelector(".proj__float");
        card.style.transform = "";
        card.style.visibility = "";
        if (panel) {
          let panelY = panelTy;
          if (i === 0 && pc < 0.2) {
            panelY += (1 - pc / 0.2) * vh * 0.5;
          }
          panel.style.transform = "translateY(" + panelY.toFixed(1) + "px)";
        }
        if (float) {
          float.style.transform = "translate(-50%, " + ty.toFixed(1) + "px) perspective(1100px) rotateX(" + rot.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
        }
        card.style.opacity = op.toFixed(3);
        card.style.zIndex = String(Math.round(20 - ad * 10));
        card.style.pointerEvents = ad < 0.4 ? "auto" : "none";
        if (Math.abs(d) < best) {
          best = Math.abs(d);
          active = i;
        }
      });
      if (counter) counter.textContent = "0" + (active + 1);
      if (workDisplay) {
        const fadeStart = introHold * 0.55;
        const fadeEnd = introHold + 0.05;
        const t = Math.min(Math.max((p - fadeStart) / (fadeEnd - fadeStart), 0), 1);
        const eased = Math.pow(t, 1.05);
        const opacity = 1 - eased;
        const lift = eased * (window.innerHeight * 0.14);
        workDisplay.style.opacity = opacity.toFixed(3);
        workDisplay.style.transform = "translateY(" + (-lift).toFixed(1) + "px)";
        workDisplay.style.visibility = opacity < 0.03 ? "hidden" : "";
      }
    };
    const onTick = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    onTick();
    onScrollValue(onTick);
    window.addEventListener("resize", onTick, { passive: true });

    /* ---------- Banner reveal: soft radial mask bloom on the colored sill (behind the mock) ---------- */
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      // Sync ScrollTrigger to Lenis WITHOUT a second rAF (Lenis already runs its own).
      if (window.lenis) window.lenis.on("scroll", ScrollTrigger.update);

      // banner (colored sill) blooms in behind the mock as the card settles.
      const reveals = cards.map((card) => {
        const sill = card.querySelector(".proj__panel-sill");
        return sill ? gsap.quickSetter(sill, "--reveal") : null;
      });

      ScrollTrigger.create({
        trigger: ".works-pin",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const pc = pcFromPin(self.progress);
          cards.forEach((card, i) => {
            const ad = Math.min(Math.abs(cardD(pc, i)), 1);
            if (reveals[i]) reveals[i]((1 - ad).toFixed(3)); // 1 = full banner at active, 0 = receded at edges
          });
        },
      });
      ScrollTrigger.refresh();
    }
  } else if (workSection) {
    workSection.classList.add("work--static");
  }

  /* ---------- Scroll-driven background moods ---------- */
  const moodSections = document.querySelectorAll("[data-mood]");
  if (moodSections.length) {
    const setMood = (m) => {
      body.classList.remove("mood-base", "mood-surface", "mood-tint", "mood-deep");
      if (m === "base") body.classList.add("mood-base");
      else if (m && m !== "base") body.classList.add("mood-" + m);
    };
    const syncMood = () => {
      const center = window.innerHeight * 0.5;
      let active = null;
      moodSections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= center && r.bottom >= center) active = s;
      });
      setMood(active ? active.getAttribute("data-mood") : "base");
    };
    onScrollValue(syncMood);
    syncMood();
    window.addEventListener("resize", syncMood, { passive: true });
  }

  /* ---------- Scroll-scrubbed canvas darkening: work → shipped ----------
     Selected Work and the Showroom share the same dark canvas; this drives a
     scroll-linked --stage-shade so the whole field darkens as the showroom
     rises into view (and lifts back on exit), continuously — no class snap,
     no recorte. All visible sections read the same value, so there is no seam
     at the section boundary. */
  const shippedSection = document.getElementById("shipped");
  if (shippedSection) {
    const SHADE_MAX = 85; // % of #000 mixed into --bg at full darkness (~#040404, near pure black)
    const root = document.documentElement;
    const clampShade = (v) => Math.min(Math.max(v, 0), 1);
    let shadeTicking = false;
    const applyShade = () => {
      shadeTicking = false;
      const vh = window.innerHeight;
      const r = shippedSection.getBoundingClientRect();
      // Front-loaded ramp: the field reaches near-black BEFORE the showroom's
      // dark 3D content (near-black fog) dominates, so the section slides into an
      // already-dark stage — no step at its top edge. Runs from the showroom
      // sitting 0.3vh below the fold (top = 1.3vh) to 30% risen (top = 0.7vh).
      const enter = clampShade((vh * 1.3 - r.top) / (vh * 0.6));
      // Mirror on the way out: lift back as the section's bottom clears the screen.
      const exit = clampShade((r.bottom - vh * 0.2) / (vh * 0.6));
      const p = Math.min(enter, exit);
      const eased = p * p * (3 - 2 * p); // smoothstep
      root.style.setProperty("--stage-shade", (eased * SHADE_MAX).toFixed(2));
    };
    const onShade = () => {
      if (!shadeTicking) {
        shadeTicking = true;
        requestAnimationFrame(applyShade);
      }
    };
    onShade();
    onScrollValue(onShade);
    window.addEventListener("resize", onShade, { passive: true });
  }

  /* ---------- Parallax ---------- */
  const parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length && !reduceMotion) {
    const onPar = () => {
      parallax.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = "translateY(" + (offset * -1).toFixed(2) + "px)";
      });
    };
    onScrollValue(onPar);
    onPar();
  }

  /* ---------- Video modal ---------- */
  const modal = document.querySelector(".modal");
  if (modal) {
    const closeBtn = modal.querySelector(".modal__close");
    let lastFocused = null;
    const open = (e) => {
      lastFocused = (e && e.currentTarget) || document.activeElement;
      modal.classList.add("is-open");
      if (closeBtn) closeBtn.focus();
    };
    const close = () => {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };
    document.querySelectorAll("[data-open-modal]").forEach((b) => b.addEventListener("click", open));
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".modal__close")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        e.preventDefault();
        if (closeBtn) closeBtn.focus();
      }
    });
  }

  /* ---------- Contact form (no backend — demo) ---------- */
  const form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("is-sent");
      form.querySelector("button").textContent = "Sent";
    });
  }

  /* ---------- Case study page progress ---------- */
  const csProgress = document.querySelector(".cs-progress__bar");
  if (csProgress) {
    onScrollValue((y) => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      csProgress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    });
  }

  /* ---------- Sticky decisions: swap image by scroll ---------- */
  const sticky = document.querySelector("[data-sticky-steps]");
  if (sticky) {
    const steps = sticky.querySelectorAll("[data-step]");
    const imgs = sticky.querySelectorAll("[data-step-img]");
    if ("IntersectionObserver" in window && steps.length) {
      const sio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = entry.target.getAttribute("data-step");
            imgs.forEach((im) => im.classList.toggle("is-active", im.getAttribute("data-step-img") === idx));
          }
        });
      }, { threshold: 0.6 });
      steps.forEach((s) => sio.observe(s));
    }
  }

  /* ---------- Story pinned 2-act opener ---------- */
  const storyOpen = document.querySelector("[data-story-open]");
  if (storyOpen) {
    const stage = storyOpen.querySelector(".story-open__stage");
    const memory = storyOpen.querySelector("[data-memory]");
    const cards = Array.from(storyOpen.querySelectorAll("[data-memory-card]"));
    const stamps = Array.from(storyOpen.querySelectorAll(".story-open__stamp"));
    const portrait = storyOpen.querySelector("[data-portrait]");
    const portraitGrade = portrait ? portrait.querySelector(".memory__grade") : null;
    const portraitLight = portrait ? portrait.querySelector(".memory__light") : null;
    const flipEl = storyOpen.querySelector("[data-flip]");
    const caps = storyOpen.querySelectorAll("[data-cap]");
    const slot = storyOpen.querySelector("[data-bento-slot]");
    const bentoAct = storyOpen.querySelector('[data-act="03"]');

    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
    const smooth = (v) => v * v * (3 - 2 * v);
    const easeOut = (v) => 1 - Math.pow(1 - v, 3);
    const lerp = (a, b, t) => a + (b - a) * t;
    const on = (nodes, attr, val) => nodes.forEach((n) => n.classList.toggle("is-on", n.getAttribute(attr) === val));

    if (reduceMotion || isTouch) {
      // Static fallback — clean stacked gallery, professional landing flows after.
      storyOpen.classList.add("is-static");
      if (memory) memory.classList.add("memory--static");
      cards.forEach((card) => {
        card.style.setProperty("--lit", "0.42");
        card.style.setProperty("--gradeop", "0.5");
      });
      if (bentoAct) bentoAct.classList.add("is-built");
    } else {
      // ---- Cinematic memory-as-depth driver ----
      const RISE0 = 0.50, RISE1 = 0.62, FLIP0 = 0.62, FLIP1 = 0.78, BUILT = 0.80;
      let homeTop = 0, homeLeft = 0, homeW = 0, homeH = 0;
      let slotTop = 0, slotLeft = 0, slotW = 0, slotH = 0;
      let lastPro = "process";
      let ticking = false;

      if (stage) stage.classList.add("is-memory");

      const measure = () => {
        if (!portrait || !stage) return;
        const stageR = stage.getBoundingClientRect();
        const pf = portrait.style.transform, pfil = portrait.style.filter;
        portrait.style.transform = "none";
        portrait.style.filter = "none";
        portrait.style.left = ""; portrait.style.top = "";
        portrait.style.width = ""; portrait.style.height = ""; portrait.style.right = "";
        const phr = portrait.getBoundingClientRect();
        homeTop = phr.top - stageR.top;
        homeLeft = phr.left - stageR.left;
        homeW = phr.width;
        homeH = phr.height;
        if (slot) {
          const sr = slot.getBoundingClientRect();
          slotTop = sr.top - stageR.top;
          slotLeft = sr.left - stageR.left;
          slotW = sr.width;
          slotH = sr.height;
        }
        portrait.style.transform = pf;
        portrait.style.filter = pfil;
      };

      const setCardVars = (card, q) => {
        const inFront = q >= 0.5;
        const approach = clamp01(q / 0.5);
        const depart = clamp01((q - 0.5) / 0.5);
        const z = inFront ? lerp(0, 760, depart * depart) : lerp(-1500, 0, easeOut(approach));
        const scale = inFront ? lerp(1, 1.6, depart) : lerp(0.34, 1, easeOut(approach));
        const op = q < 0.5
          ? smooth(clamp01(q / 0.22))
          : (1 - smooth(clamp01((depart - 0.18) / 0.7)));
        const blur = inFront ? lerp(0, 18, depart * depart) : lerp(16, 0, easeOut(approach));
        const bright = inFront ? lerp(1, 0.85, depart) : lerp(0.3, 1, approach);
        const lit = smooth(clamp01(1 - Math.min(Math.abs(q - 0.5) / 0.3, 1)));
        const gradeop = smooth(clamp01(1 - Math.min(Math.abs(q - 0.5) / 0.42, 1))) * 0.9;
        card.style.setProperty("--z", z.toFixed(0) + "px");
        card.style.setProperty("--scale", scale.toFixed(4));
        card.style.setProperty("--op", op.toFixed(3));
        card.style.setProperty("--blur", blur.toFixed(2) + "px");
        card.style.setProperty("--bright", bright.toFixed(3));
        card.style.setProperty("--lit", lit.toFixed(3));
        card.style.setProperty("--gradeop", gradeop.toFixed(3));
        card.style.zIndex = String(2000 + Math.round(z));
      };

      const apply = () => {
        ticking = false;
        const rect = storyOpen.getBoundingClientRect();
        const dist = Math.max(storyOpen.offsetHeight - window.innerHeight, 1);
        const p = clamp01(-rect.top / dist);

        // Memories 1..6 — continue straight from the #apps card; overlapping windows so
        // one is in focus at a time, no empty title beat.
        const N = cards.length || 1;
        const span = RISE0 - 0.02;
        const step = span / N;
        cards.forEach((card, i) => {
          const start = 0.02 + i * step - step * 0.35;
          const width = step * 1.7;
          const q = clamp01((p - start) / width);
          setCardVars(card, q);
        });

        // Memory #7 (portrait): rises with the light, then flips into the bento.
        if (!portrait) return;
        if (p < FLIP0) {
          const rq = clamp01((p - RISE0) / (RISE1 - RISE0));
          const sc = lerp(0.4, 1, easeOut(rq));
          const blur = lerp(16, 0, easeOut(rq));
          const op = smooth(clamp01(rq / 0.5));
          const tiltNow = lerp(-6, 0, rq);
          const bell = smooth(clamp01(1 - Math.abs(rq - 0.82) / 0.42));
          portrait.style.left = ""; portrait.style.top = "";
          portrait.style.width = ""; portrait.style.height = ""; portrait.style.right = "";
          portrait.style.aspectRatio = ""; portrait.style.maxWidth = "";
          portrait.style.transform = "scale(" + sc.toFixed(4) + ") rotate(" + tiltNow.toFixed(2) + "deg)";
          portrait.style.filter = "blur(" + blur.toFixed(2) + "px)";
          portrait.style.setProperty("--pf", op.toFixed(3));
          if (portraitGrade) portraitGrade.style.opacity = (bell * 0.9).toFixed(3);
          if (portraitLight) portraitLight.style.opacity = bell.toFixed(3);
          if (flipEl) flipEl.style.setProperty("--flip", "0deg");
          if (bentoAct) bentoAct.classList.remove("is-built");
          stage.style.setProperty("--t", "0");
        } else {
          portrait.style.filter = "";
          portrait.style.setProperty("--pf", "1");
          if (portraitGrade) portraitGrade.style.opacity = "0";
          if (portraitLight) portraitLight.style.opacity = "0";
          const wide = window.innerWidth > 768;
          const t = smooth(clamp01((p - FLIP0) / (FLIP1 - FLIP0)));
          stage.style.setProperty("--t", t.toFixed(4));
          if (wide && t > 0 && slot) {
            const stageR = stage.getBoundingClientRect();
            const sr = slot.getBoundingClientRect();
            slotTop = sr.top - stageR.top;
            slotLeft = sr.left - stageR.left;
            slotW = sr.width;
            slotH = sr.height;
          }
          if (wide && slotW > 0) {
            const land = t >= 0.999 ? 1 : t;
            portrait.style.right = "auto";
            portrait.style.left = (homeLeft + (slotLeft - homeLeft) * land).toFixed(1) + "px";
            portrait.style.top = (homeTop + (slotTop - homeTop) * land).toFixed(1) + "px";
            portrait.style.width = (homeW + (slotW - homeW) * land).toFixed(1) + "px";
            portrait.style.height = (homeH + (slotH - homeH) * land).toFixed(1) + "px";
            portrait.style.transform = "none";
            portrait.style.aspectRatio = "auto";
            portrait.style.maxWidth = "none";
            portrait.style.boxSizing = "border-box";
          } else {
            portrait.style.transform = "none";
          }
          if (bentoAct) bentoAct.classList.toggle("is-built", p > BUILT);
          if (flipEl) flipEl.style.setProperty("--flip", (t * 180).toFixed(2) + "deg");
          const proKey = t >= 0.5 ? "professional" : "process";
          if (proKey !== lastPro) {
            lastPro = proKey;
            on(caps, "data-cap", proKey);
          }
        }
      };

      const onTick = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(apply);
        }
      };
      const onResize = () => { measure(); onTick(); };

      measure();
      apply();
      window.addEventListener("load", onResize);
      onScrollValue(onTick);
      window.addEventListener("resize", onResize, { passive: true });
    }
  }

  /* ---------- App race — pinned mobile concepts ---------- */
  const appRaceSection = document.querySelector("[data-app-race]")?.closest("#apps");
  if (appRaceSection) {
    const raceRoot = appRaceSection.querySelector("[data-app-race]");
    const mia = appRaceSection.querySelector('[data-app-runner="mia"]');
    const kriax = appRaceSection.querySelector('[data-app-runner="kriax"]');
    const compactRace = window.matchMedia("(max-width: 860px)").matches;
    const canScrub = raceRoot && mia && kriax && !reduceMotion && !isTouch && !compactRace;
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
    const smooth = (v) => v * v * (3 - 2 * v);
    const easeOut = (v) => 1 - Math.pow(1 - v, 3);
    const easeOutExpo = (v) => (v >= 1 ? 1 : 1 - Math.pow(2, -9 * v));
    const lerp = (a, b, t) => a + (b - a) * t;
    let ticking = false;

    const memoryDeck = appRaceSection.querySelector("[data-memory]");
    const memCards = Array.from(appRaceSection.querySelectorAll("[data-memory-card]"));
    const bridge = appRaceSection.querySelector("[data-bridge]");
    const phoneScreen = bridge ? bridge.querySelector(".story-bridge__screen") : null;
    const midShot = bridge ? bridge.querySelector("[data-bridge-mid]") : null;

    /* The flip card (memory #7) descends into the bento slot at the end of the pin. */
    const flipCard = memCards.find((c) => c.hasAttribute("data-memory-flip")) || null;
    const flipInner = flipCard ? flipCard.querySelector("[data-mflip]") : null;
    const flipCap = flipCard ? flipCard.querySelector(".memory__cap") : null;
    const bentoAct = appRaceSection.querySelector('[data-act="03"]');
    const bentoSlot = appRaceSection.querySelector("[data-bento-slot]");
    const pinEl = appRaceSection.querySelector(".app-race__pin");

    /* Headline role morph — the accent word cycles the career and lands on
       "Design Engineer", lighting each matching timeline node. Fires ONCE the
       first time the dwell is reached, on its own timeline (scroll-independent). */
    const accentWord = appRaceSection.querySelector("[data-accent-word]");
    const htlItems = Array.from(appRaceSection.querySelectorAll(".work-htl__item"));
    const ROLES = ["Accountant", "Marketer", "Project Manager", "Design Engineer"];
    let morphPlayed = false;
    const lightItem = (idx) => htlItems.forEach((it, i) => it.classList.toggle("is-lit", i === idx));
    const enterWord = (text) => {
      if (!accentWord) return;
      accentWord.classList.remove("is-exit", "is-enter");
      accentWord.classList.add("is-enter-start");
      accentWord.textContent = text;
      void accentWord.offsetWidth; /* commit the start frame */
      accentWord.classList.remove("is-enter-start");
      accentWord.classList.add("is-enter");
    };
    const runRoleMorph = () => {
      if (!accentWord) return;
      const STEP = 400, GAP = 200;
      const stepTo = (idx) => {
        accentWord.classList.remove("is-enter");
        accentWord.classList.add("is-exit");
        setTimeout(() => { lightItem(idx); enterWord(ROLES[idx]); }, GAP);
        if (idx < ROLES.length - 1) setTimeout(() => stepTo(idx + 1), STEP + GAP);
      };
      stepTo(0);
    };
    /* reduced motion / static: land on the final role immediately */
    if ((reduceMotion || !canScrub) && accentWord) {
      morphPlayed = true;
      accentWord.classList.add("is-enter");
      accentWord.textContent = "Design Engineer";
      lightItem(htlItems.length - 1);
    }

    if (canScrub) {
      /* LABS-style horizontal coverflow. `d` = signed distance from the focused
         card (i - active). The active card sits centred, full-size and sharp;
         neighbours pile outward — leaning in-plane, shrinking, blurring and
         darkening into depth — the incoming side to the right, the passed side
         to the left. `deckIn` reveals the deck as the bridge hands off; the
         first card is exempt (the bridge's own cross-fade reveals it). */
      const CF_LEAN = 42;   /* max in-plane lean (deg) */
      const setCoverflow = (card, d, isFlip, deckIn, isFirst) => {
        const w = window.innerWidth;
        const ad = Math.abs(d);
        const side = d < 0 ? -1 : (d > 0 ? 1 : 0);
        const sat = 1 - Math.exp(-ad * 0.85);            /* 0..1, saturates */
        const x = side * w * 0.46 * sat;                 /* pile outward, converging */
        const y = -ad * 14;                              /* slight settle into depth */
        const rot = side * -CF_LEAN * sat;               /* lean away from centre */
        const scale = Math.pow(0.72, ad);
        const blur = Math.min(20, ad * 6);
        const bright = Math.max(0.12, Math.pow(0.6, ad));
        let op = Math.max(0, 1 - Math.pow(ad / 3.4, 1.5));
        if (!isFirst) op *= deckIn;
        card.style.setProperty("--cf-x", x.toFixed(1) + "px");
        card.style.setProperty("--cf-y", y.toFixed(1) + "px");
        card.style.setProperty("--cf-rot", rot.toFixed(2) + "deg");
        card.style.setProperty("--scale", scale.toFixed(4));
        card.style.setProperty("--op", op.toFixed(3));
        card.style.setProperty("--blur", blur.toFixed(2) + "px");
        card.style.setProperty("--bright", bright.toFixed(3));
        card.style.zIndex = String(3000 - Math.round(ad * 100));
        if (isFlip) {
          /* the portrait turns to its Design-Engineer face over the last stretch
             of its approach to centre, ready to descend into the bento. */
          const mflip = smooth(clamp01(1 - Math.max(d, 0) / 1.2)) * 180;
          const inner = card.querySelector("[data-mflip]");
          if (inner) inner.style.setProperty("--mflip", mflip.toFixed(1) + "deg");
        }
      };

      /* Travel geometry: the flip square's centred "home" rect and the bento slot
         rect, both relative to the pin. Measured lazily, re-measured on resize. */
      let travelMeasured = false;
      let homeL = 0, homeT = 0, homeW = 0, homeH = 0, slotL = 0, slotT = 0, slotW = 0, slotH = 0;
      const measureTravel = () => {
        if (travelMeasured) return true;
        if (!flipCard || !flipInner || !bentoSlot || !pinEl) return false;
        const fw = flipInner.offsetWidth, fh = flipInner.offsetHeight;
        const cw = flipCard.offsetWidth, ch = flipCard.offsetHeight;
        if (!fw || !fh || !cw) return false;
        /* card is centred: top:47% + translate(-50%,-50%) → visual top-left = offset − size/2.
           The flip square sits at the top of the card, so its rect is: */
        homeW = fw; homeH = fh;
        homeL = flipCard.offsetLeft - cw / 2;
        homeT = flipCard.offsetTop - ch / 2;
        const pinR = pinEl.getBoundingClientRect();
        const sR = bentoSlot.getBoundingClientRect();
        slotL = sR.left - pinR.left;
        slotT = sR.top - pinR.top;
        slotW = sR.width;
        slotH = sR.height;
        travelMeasured = true;
        return true;
      };

      /* Bridge geometry: the phone SCREEN rect (where the first photo lives) and
         deck card #0's focus rect, both bridge-relative so the leap copy can grow
         straight out of the phone into the deck. Measured lazily; reset on resize. */
      let bMeasured = false, cardMeasured = false, midDirty = false;
      let psL = 0, psT = 0, psW = 0, psH = 0;   // phone screen, bridge-relative
      let cdL = 0, cdT = 0, cdW = 0, cdH = 0;   // deck card #0, bridge-relative
      const measureBridge = () => {
        if (bMeasured) return true;
        if (!phoneScreen || !bridge) return false;
        const br = bridge.getBoundingClientRect();
        const r = phoneScreen.getBoundingClientRect();
        if (!r.width) return false;
        psL = r.left - br.left; psT = r.top - br.top; psW = r.width; psH = r.height;
        bMeasured = true; return true;
      };
      const measureCard = () => {
        if (cardMeasured) return true;
        if (!memCards[0] || !bridge) return false;
        const br = bridge.getBoundingClientRect();
        const r = memCards[0].getBoundingClientRect();
        if (!r.width) return false;
        cdL = r.left - br.left; cdT = r.top - br.top; cdW = r.width; cdH = r.height;
        cardMeasured = true; return true;
      };

      const apply = () => {
        ticking = false;
        const rect = appRaceSection.getBoundingClientRect();
        const dist = Math.max(appRaceSection.offsetHeight - window.innerHeight, 1);
        const p = clamp01(-rect.top / dist);
        const w = window.innerWidth;
        const h = window.innerHeight;

        /* Phase budget over the ONE pin: acts → card+MY STORY → recede → memories → flip. */
        /* Pin re-timed for the phone->story bridge. APPS keeps its original pixel
           budget (same feel) via pa; the bridge owns p[A..B]; the deck/flip/bento
           run on pd, which STARTS at card #1's focus so there is no duplicate first
           card and no re-rise of the deck's first photo. */
        const A = 0.3529, B = 0.6353, HANDOFF = 0.4793;
        const pa = clamp01(p / A) * 0.50;
        const pb = clamp01((p - A) / (B - A));
        const pd = p <= B ? HANDOFF : HANDOFF + ((p - B) / (1 - B)) * (1 - HANDOFF);
        const pAct = clamp01(pa / 0.28);
        const depth = easeOutExpo(clamp01(pAct / 0.44));
        const split = smooth(smooth(clamp01((pAct - 0.50) / 0.26)));
        const names = smooth(clamp01((pAct - 0.62) / 0.22));
        const labels = smooth(clamp01((pAct - 0.80) / 0.16));
        /* Card forms + MY STORY flies in */
        const shift = smooth(clamp01((pa - 0.28) / 0.09));
        const shift2 = smooth(clamp01((pa - 0.31) / 0.09));
        /* MY STORY recedes to architecture, but the bordered card (frame) now STAYS
           present through the bridge — the gallery happens inside it — and only
           dissolves as the bridge hands off to the deck. */
        const recede = smooth(clamp01((pa - 0.43) / 0.06));
        const cardout = smooth(clamp01((pb - 0.66) / 0.34));

        appRaceSection.style.setProperty("--race", depth.toFixed(4));
        appRaceSection.style.setProperty("--split", split.toFixed(4));
        appRaceSection.style.setProperty("--names", names.toFixed(4));
        appRaceSection.style.setProperty("--labels", labels.toFixed(4));
        appRaceSection.style.setProperty("--shift", shift.toFixed(4));
        appRaceSection.style.setProperty("--shift2", shift2.toFixed(4));
        appRaceSection.style.setProperty("--recede", recede.toFixed(4));
        appRaceSection.style.setProperty("--cardout", cardout.toFixed(4));

        /* Memories — a horizontal coverflow that flows one photo at a time from the
           incoming pile (right) through the sharp centre to the passed pile (left).
           The deck is centred on card #0 exactly at the bridge HANDOFF so the 2006
           hero hands straight into focus; the flip portrait lands centred by PH1,
           leaving the tail for its travel into the bento + dwell. */
        const PH0 = HANDOFF, PH1 = 0.86;
        const N = memCards.length || 1;
        const active = clamp01((pd - PH0) / (PH1 - PH0)) * (N - 1);
        const deckIn = smooth(clamp01((pd - PH0) / 0.05));
        memCards.forEach((card, i) => {
          setCoverflow(card, i - active, card.hasAttribute("data-memory-flip"), deckIn, i === 0);
        });

        /* Memory #7, now flipped to the Design-Engineer portrait, DESCENDS with the
           scroll into the bento slot, morphing from a square print to the slot's frame.
           The bento assembles around it; then it dwells, pinned, to be read. */
        if (flipCard) {
          const tr = smooth(clamp01((pd - 0.86) / 0.07));
          if (tr <= 0) {
            flipCard.style.left = "";
            flipCard.style.top = "";
            flipCard.style.width = "";
            flipCard.style.height = "";
            flipCard.style.transform = "";
            flipCard.style.overflow = "";
            if (flipInner) flipInner.style.height = "";
            if (flipCap) flipCap.style.opacity = "";
            travelMeasured = false;
          } else if (measureTravel()) {
            flipCard.style.setProperty("--op", "1");
            flipCard.style.setProperty("--lit", (1 - tr).toFixed(3));
            flipCard.style.setProperty("--gradeop", "0");
            flipCard.style.left = (homeL + (slotL - homeL) * tr).toFixed(1) + "px";
            flipCard.style.top = (homeT + (slotT - homeT) * tr).toFixed(1) + "px";
            flipCard.style.width = (homeW + (slotW - homeW) * tr).toFixed(1) + "px";
            flipCard.style.height = (homeH + (slotH - homeH) * tr).toFixed(1) + "px";
            flipCard.style.transform = "rotate(" + (-6 * (1 - tr)).toFixed(2) + "deg)";
            flipCard.style.overflow = "hidden";
            flipCard.style.zIndex = "2300";
            if (flipInner) flipInner.style.height = "100%";
            if (flipCap) flipCap.style.opacity = (1 - smooth(clamp01(tr / 0.3))).toFixed(3);
          }
        }
        if (bentoAct) bentoAct.classList.toggle("is-built", pd > 0.90);
        /* Suppress the global cursorx coord readout while the bento is in its
           built/dwell state, so only the #apps-scoped [data-apps-coord] HUD shows. */
        document.body.classList.toggle("is-bento-dwell", pd > 0.90);

        /* Bento dwell (p 0.93→1.0): scrub the timeline via --bento and trip the
           one-shot headline morph the first time the dwell is entered. */
        if (bentoAct) {
          const bentoProgress = clamp01((pd - 0.93) / 0.07);
          bentoAct.style.setProperty("--bento", bentoProgress.toFixed(4));
          if (!morphPlayed && bentoProgress > 0.04) {
            morphPlayed = true;
            runRoleMorph();
          }
        }

        /* ---- Phone -> story bridge: the host phone travels in showing ONLY the
           first memory (2006) in its screen. The camera then pushes in — the photo
           grows straight out of the phone screen and lands as deck card #1, where
           the coverflow deck takes over. No pre-deck gallery/coverflow. ---- */
        if (bridge) {
          const bPhone = smooth(clamp01((pb - 0.05) / 0.40));
          const bExit = smooth(clamp01((pb - 0.62) / 0.30));
          const growT = smooth(clamp01((pb - 0.46) / 0.52));   // camera push / zoom
          bridge.style.setProperty("--b-phone", bPhone.toFixed(4));
          bridge.style.setProperty("--b-exit", bExit.toFixed(4));
          /* the framed card opens up a touch while the phone is on screen. */
          appRaceSection.style.setProperty("--bframe", (bPhone * (1 - bExit)).toFixed(4));
          /* narrow will-change: only promote layers while the bridge is on screen */
          bridge.classList.toggle("is-live", pb > 0.001 && pb < 0.999);
          /* The 2006 photo (leap copy) grows out of the phone screen into deck
             card #1 — this grow IS the camera zoom. Explicit bridge-relative
             rect interpolation so the aspect reframes cleanly, phone → deck. */
          if (midShot) {
            if (growT <= 0) {
              if (midDirty) {
                midShot.style.left = ""; midShot.style.top = "";
                midShot.style.width = ""; midShot.style.height = "";
                midShot.style.transform = ""; midShot.style.zIndex = "";
                midShot.style.opacity = ""; midShot.style.aspectRatio = "";
                midDirty = false;
              }
            } else if (measureBridge() && measureCard()) {
              const t = growT;
              midShot.style.left = (psL + (cdL - psL) * t).toFixed(1) + "px";
              midShot.style.top = (psT + (cdT - psT) * t).toFixed(1) + "px";
              midShot.style.width = (psW + (cdW - psW) * t).toFixed(1) + "px";
              midShot.style.height = (psH + (cdH - psH) * t).toFixed(1) + "px";
              midShot.style.transform = "none";
              midShot.style.aspectRatio = "auto";
              midShot.style.zIndex = "40";
              midShot.style.opacity = (1 - smooth(clamp01((pb - 0.9) / 0.1))).toFixed(3);
              midDirty = true;
            }
          }
          /* card #1 (2006) crossfades in at its focus exactly as the middle shot
             lands -> seamless hand-off into the deck, no duplicate first card. */
          if (memCards[0]) {
            const bornFade = smooth(clamp01((pb - 0.74) / 0.26));
            const op0 = parseFloat(memCards[0].style.getPropertyValue("--op")) || 0;
            memCards[0].style.setProperty("--op", (op0 * bornFade).toFixed(3));
          }
        }

        /* Phones — depth stack at center, then peel to corners */
        const stackY = h * 0.038;
        const miaRaceZ = lerp(-320, 48, depth);
        const kriaxRaceZ = lerp(-480, -36, depth);
        const miaRaceS = lerp(0.5, 1.02, depth);
        const kriaxRaceS = lerp(0.46, 0.96, depth);
        const miaRaceR = lerp(-4, 0, depth);
        const kriaxRaceR = lerp(4, 0, depth);
        const kriaxFinalX = -w * 0.32, kriaxFinalY = -h * 0.14, kriaxFinalR = 26;
        const miaFinalX = w * 0.32, miaFinalY = h * 0.16, miaFinalR = -76;
        const peel = easeOut(split);
        const miaX = lerp(0, miaFinalX, peel);
        const miaY = lerp(stackY, miaFinalY, peel);
        const kriaxX = lerp(0, kriaxFinalX, peel);
        const kriaxY = lerp(-stackY, kriaxFinalY, peel);
        const miaZ = lerp(miaRaceZ, 0, peel);
        const kriaxZ = lerp(kriaxRaceZ, 0, peel);
        const miaS = lerp(miaRaceS, 1, peel);
        const kriaxS = lerp(kriaxRaceS, 1, peel);
        const miaR = lerp(miaRaceR, miaFinalR, peel);
        const kriaxR = lerp(kriaxRaceR, kriaxFinalR, peel);
        const tEase = smooth(shift);
        const fMiaX = lerp(miaX, w * 0.135, tEase);
        const fMiaY = lerp(miaY, h * 0.04, tEase);
        const fMiaR = lerp(miaR, 6, tEase);
        const fMiaS = lerp(miaS, 0.84, tEase);
        const fKriaxX = lerp(kriaxX, -w * 0.135, tEase);
        const fKriaxY = lerp(kriaxY, -h * 0.04, tEase);
        const fKriaxR = lerp(kriaxR, -6, tEase);
        const fKriaxS = lerp(kriaxS, 0.84, tEase);

        mia.style.setProperty("--x", fMiaX.toFixed(1) + "px");
        mia.style.setProperty("--y", fMiaY.toFixed(1) + "px");
        mia.style.setProperty("--z", miaZ.toFixed(1) + "px");
        mia.style.setProperty("--s", fMiaS.toFixed(4));
        mia.style.setProperty("--r", fMiaR.toFixed(2) + "deg");
        kriax.style.setProperty("--x", fKriaxX.toFixed(1) + "px");
        kriax.style.setProperty("--y", fKriaxY.toFixed(1) + "px");
        kriax.style.setProperty("--z", kriaxZ.toFixed(1) + "px");
        kriax.style.setProperty("--s", fKriaxS.toFixed(4));
        kriax.style.setProperty("--r", fKriaxR.toFixed(2) + "deg");

        /* Apps act EXITS: the two concept phones are thrown straight off the
           sides — Mia to the RIGHT, Kriax to the LEFT — fully off-screen, as the
           zoom-out reveals MY STORY. Keyed across the apps→bridge seam so the
           throw lands at the moment the act ends; the host phone then rises into
           the cleared stage and the gallery lives inside its screen. */
        if (bridge) {
          const gone = smooth(clamp01((p - 0.315) / 0.050));
          if (gone > 0) {
            const goneFade = (1 - smooth(clamp01((p - 0.335) / 0.030))).toFixed(3);
            mia.style.setProperty("--x", lerp(fMiaX, w * 1.05, gone).toFixed(1) + "px");
            mia.style.setProperty("--y", lerp(fMiaY, h * 0.06, gone).toFixed(1) + "px");
            mia.style.setProperty("--r", lerp(fMiaR, -22, gone).toFixed(2) + "deg");
            mia.style.opacity = goneFade;
            kriax.style.setProperty("--x", lerp(fKriaxX, -w * 1.05, gone).toFixed(1) + "px");
            kriax.style.setProperty("--y", lerp(fKriaxY, -h * 0.06, gone).toFixed(1) + "px");
            kriax.style.setProperty("--r", lerp(fKriaxR, 22, gone).toFixed(2) + "deg");
            kriax.style.opacity = goneFade;
          } else {
            mia.style.opacity = "";
            kriax.style.opacity = "";
          }
        }

        /* Dot treadmill */
        const travel = depth + split * 0.18;
        appRaceSection.style.setProperty("--dot-y", (-(travel * h * 0.92)).toFixed(1) + "px");
        appRaceSection.style.setProperty("--dot-y-far", (-(travel * h * 0.48)).toFixed(1) + "px");
        appRaceSection.style.setProperty("--bg-scale", lerp(1.06, 1.52, travel).toFixed(4));
        appRaceSection.style.setProperty("--bg-z", lerp(-80, 180, travel).toFixed(1) + "px");
      };

      const onTick = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(apply);
        }
      };
      apply();
      onScrollValue(onTick);
      window.addEventListener("resize", () => { travelMeasured = false; bMeasured = false; cardMeasured = false; onTick(); }, { passive: true });
    } else {
      appRaceSection.classList.add("app-race--static");
      if (memoryDeck) memoryDeck.classList.add("memory--static");
    }
  }

  /* ---------- Story image warm-up — start decoding before the bridge pin needs them ---------- */
  const appsSection = document.getElementById("apps");
  if (appsSection && "IntersectionObserver" in window) {
    const warmStoryImages = () => {
      appsSection.querySelectorAll("img").forEach((img) => {
        if (img.complete && img.naturalWidth) return;
        const warm = new Image();
        warm.decoding = "async";
        warm.src = img.currentSrc || img.src;
      });
    };
    const warmIo = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      warmStoryImages();
      warmIo.disconnect();
    }, { rootMargin: "2200px 0px" });
    warmIo.observe(appsSection);
  }

  /* ---------- Services accordion ---------- */
  const svcRow = document.querySelector("[data-svc-accordion]");
  if (svcRow) {
    const items = Array.from(svcRow.querySelectorAll("[data-svc]"));
    let current = svcRow.querySelector(".is-open");
    const open = (target) => {
      if (target === current) return;
      current = target;
      items.forEach((it) => {
        const onState = it === target;
        it.classList.toggle("is-open", onState);
        const btn = it.querySelector(".svc-item__bar");
        if (btn) btn.setAttribute("aria-expanded", String(onState));
      });
    };
    items.forEach((it) => {
      const btn = it.querySelector(".svc-item__bar");
      if (!btn) return;
      btn.addEventListener("click", () => open(it));
      if (!isTouch) it.addEventListener("mouseenter", () => open(it));
    });
  }
})();

/* ============================================================
   Case study modal (Shipped) — split stage + detail panel
   ============================================================ */
(function () {
  const cmodal = document.getElementById("case-modal");
  if (!cmodal) return;

  const PROJECTS = {
    zouti: {
      company: "Zouti", year: "2024", type: "E-commerce",
      grad: "linear-gradient(135deg,#FC3802,#6E1E0C)", mockc: "#FC3802",
      overview: "Zouti is a direct-to-consumer brand that wanted an online store as considered as its products. I took it end to end — from the brand system to a checkout built to convert.",
      contributions: [
        "Designed the full visual identity and turned it into a flexible design system.",
        "Built the storefront in code — responsive, fast, and accessible on every device.",
        "Streamlined the checkout flow to cut friction and reduce drop-off."
      ],
      slides: ["Storefront", "Product page", "Checkout"]
    },
    akrus: {
      company: "Akrus", year: "2024", type: "Landing Page",
      grad: "linear-gradient(135deg,#6D5BD0,#241A63)", mockc: "#6D5BD0",
      overview: "Akrus was launching and needed a page that did one job well: turn curiosity into a waitlist. I designed and built a focused launch experience around a single conversion goal.",
      contributions: [
        "Designed a one-screen narrative that builds tension toward the signup.",
        "Wrote the copy alongside the layout so message and motion move together.",
        "Built a lightweight form with instant, satisfying feedback states."
      ],
      slides: ["Hero", "Signup", "Confirmation"]
    },
    liqpay: {
      company: "LiqPay", year: "2023", type: "Web App",
      grad: "linear-gradient(135deg,#1FA890,#0B4444)", mockc: "#129E8A",
      overview: "LiqPay is a payments product where trust is everything. I worked on making dense financial flows feel calm, clear, and unmistakably human.",
      contributions: [
        "Redesigned core payment flows for clarity over density.",
        "Built reusable interface components in code.",
        "Tuned states, empty cases, and errors so nothing feels cold."
      ],
      slides: ["Dashboard", "Send money", "Activity"]
    },
    gassen: {
      company: "Gassen", year: "2023", type: "Branding · Web",
      grad: "linear-gradient(135deg,#E0683C,#7A2D12)", mockc: "#E0683C",
      overview: "Gassen needed an identity that held up from the logo all the way into the product UI. I built a brand system designed to live in code, not just in a slide deck.",
      contributions: [
        "Created the logo, type, and color system from scratch.",
        "Mapped every brand decision to design tokens for the interface.",
        "Built branded UI components ready for production."
      ],
      slides: ["Logo system", "Brand page", "Components"]
    },
    century: {
      company: "Century", year: "2024", type: "Web App",
      grad: "linear-gradient(135deg,#3B6FE0,#142A6E)", mockc: "#3B6FE0",
      overview: "Century is a community platform where clarity builds trust. I designed and built the core experience around legibility, orientation, and ease.",
      contributions: [
        "Designed the information architecture for fast orientation.",
        "Built the responsive interface in code.",
        "Produced the visual assets that give the platform its character."
      ],
      slides: ["Feed", "Profile", "Spaces"]
    }
  };

  const q = (sel) => cmodal.querySelector(sel);
  const track = q("[data-scenes]");
  const dotsWrap = q("[data-dots]");
  const openBtn = q("[data-open]");
  const dialog = q(".cmodal__dialog");
  let index = 0, slideCount = 0, lastFocus = null;

  const sceneHTML = (label) =>
      '<div class="cmodal__scene">' +
        '<span class="cmodal__cap">' + label + "</span>" +
        '<div class="cmodal__mock"></div>' +
      "</div>";

  const goTo = (i, instant) => {
    index = (i + slideCount) % slideCount;
    if (instant) track.classList.add("is-instant");
    track.style.transform = "translateX(-" + index * 100 + "%)";
    if (instant) {
      void track.offsetWidth;
      track.classList.remove("is-instant");
    }
    dotsWrap.querySelectorAll("button").forEach((d, di) => d.classList.toggle("is-active", di === index));
  };

  const fill = (key, url) => {
    const p = PROJECTS[key];
    if (!p) return;
    q("[data-title]").textContent = p.company;
    q("[data-company]").textContent = p.company;
    q("[data-yr]").textContent = p.year;
    q("[data-type]").textContent = p.type;
    q("[data-overview]").textContent = p.overview;
    q("[data-contrib]").innerHTML = p.contributions.map((c) => "<li>" + c + "</li>").join("");
    dialog.style.setProperty("--stage", p.grad);
    track.innerHTML = p.slides.map((s) => sceneHTML(s)).join("");
    dotsWrap.innerHTML = p.slides
      .map((_, i) => '<button type="button" aria-label="Slide ' + (i + 1) + '"></button>')
      .join("");
    dotsWrap.querySelectorAll("button").forEach((d, di) => d.addEventListener("click", () => goTo(di)));
    slideCount = p.slides.length;
    if (url && url !== "#") { openBtn.href = url; openBtn.hidden = false; }
    else { openBtn.removeAttribute("href"); openBtn.hidden = true; }
    goTo(0);
  };

  const openModal = (key, url) => {
    fill(key, url);
    lastFocus = document.activeElement;
    cmodal.classList.add("is-open");
    cmodal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    q("[data-close]").focus();
  };

  const closeModal = () => {
    cmodal.classList.remove("is-open");
    cmodal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  document.querySelectorAll("[data-project]").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(card.getAttribute("data-project"), card.getAttribute("href"));
    });
  });

  q("[data-prev]").addEventListener("click", () => goTo(index - 1));
  q("[data-next]").addEventListener("click", () => goTo(index + 1));
  cmodal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (!cmodal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    else if (e.key === "ArrowLeft") goTo(index - 1, true);
    else if (e.key === "ArrowRight") goTo(index + 1, true);
  });
})();

/* ============================================================
   Bento card mocks — inject device + unique mesh per project
   ============================================================ */
(function () {
  const MESH = {
    zouti:   { mc: "#FC3802", bg: "radial-gradient(at 18% 22%, #94FEBC 0, transparent 50%), radial-gradient(at 82% 26%, #FC3802 0, transparent 52%), radial-gradient(at 55% 95%, #6E1E0C 0, transparent 55%), #F0EDE8" },
    akrus:   { mc: "#6D5BD0", bg: "radial-gradient(at 16% 24%, #B7AEF0 0, transparent 50%), radial-gradient(at 84% 20%, #6D5BD0 0, transparent 52%), radial-gradient(at 58% 96%, #34268A 0, transparent 55%), #E5E1F7" },
    liqpay:  { mc: "#129E8A", bg: "radial-gradient(at 20% 28%, #8FE3D2 0, transparent 50%), radial-gradient(at 82% 24%, #1FA890 0, transparent 52%), radial-gradient(at 55% 95%, #0B6555 0, transparent 55%), #D6F0EA" },
    gassen:  { mc: "#E0683C", bg: "radial-gradient(at 18% 22%, #F6C09B 0, transparent 50%), radial-gradient(at 82% 28%, #E0683C 0, transparent 52%), radial-gradient(at 55% 94%, #93391A 0, transparent 55%), #F6E2D5" },
    century: { mc: "#3B6FE0", bg: "radial-gradient(at 20% 24%, #9DBAF2 0, transparent 50%), radial-gradient(at 82% 22%, #3B6FE0 0, transparent 52%), radial-gradient(at 55% 95%, #1A3178 0, transparent 55%), #DCE6FA" }
  };

  const device = () => '<div class="bento__device"></div>';

  document.querySelectorAll("[data-project]").forEach((card) => {
    const m = MESH[card.getAttribute("data-project")];
    const shot = card.querySelector(".bento__shot");
    if (!m || !shot) return;
    shot.classList.remove("ph");
    shot.classList.add("bento__shot--mock");
    shot.style.background = m.bg;
    shot.style.setProperty("--mc", m.mc);
    shot.textContent = "";
    shot.insertAdjacentHTML("beforeend", device());
  });
})();

/* =============================================================
   Tools arc wheel — semi-circular rotatable selector
   ============================================================= */
(function () {
  const root = document.querySelector("[data-tool-wheel]");
  if (!root) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = [...root.querySelectorAll(".tool-wheel__item")];
  const count = items.length;
  if (!count) return;

  const STEP_DEG = 20;   // degrees per row on the cylinder
  const RADIUS = 104;    // cylinder radius in px
  const DRAG_SENS = 0.022;
  const WHEEL_SENS = 0.005;
  const VISIBLE = 3.4;   // rows shown each side of centre before fade-out
  const THUMB_TRAVEL = 78; // % of track the thumb can move (100 − thumb height)

  let index = 0;
  let pos = 0;
  let dragging = false;
  let dragY = 0;
  let dragStart = 0;
  let dragMoved = false;
  let snapRaf = 0;
  let wheelTimer = 0;

  const wrap = (n) => ((n % count) + count) % count;
  const shortestOffset = (i, center) => {
    let d = i - center;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  };

  const setActive = (next) => {
    index = wrap(next);
    root.setAttribute("aria-activedescendant", items[index].id);
  };

  const layout = (center, animate) => {
    root.classList.toggle("is-snapping", animate);
    const visualActive = wrap(Math.round(center));

    items.forEach((item, i) => {
      const offset = shortestOffset(i, center);
      const dist = Math.abs(offset);
      const rotx = -offset * STEP_DEG; // negative → positive offset renders below centre
      const opacity = dist > VISIBLE ? 0 : Math.max(0.16, 1 - dist * 0.34);
      const isOn = i === visualActive;

      item.style.setProperty("--tw-rotx", `${rotx.toFixed(2)}deg`);
      item.style.setProperty("--tw-z", `${RADIUS}px`);
      item.style.setProperty("--tw-opacity", opacity.toFixed(3));
      item.style.visibility = dist > VISIBLE + 0.15 ? "hidden" : "visible";
      item.style.pointerEvents = dist > VISIBLE ? "none" : "auto";
      item.classList.toggle("is-active", isOn);
      item.setAttribute("aria-selected", isOn ? "true" : "false");
    });

    // Scroll thumb tracks absolute position through the list
    const progress = count > 1 ? wrap(Math.round(center)) / (count - 1) : 0;
    root.style.setProperty("--tw-thumb-y", `${(progress * THUMB_TRAVEL).toFixed(2)}%`);

    if (!dragging && !animate) {
      index = visualActive;
      root.setAttribute("aria-activedescendant", items[visualActive].id);
    }
  };

  const snapTo = (target, animate) => {
    cancelAnimationFrame(snapRaf);
    const goal = wrap(Math.round(target));
    if (reduceMotion || !animate) {
      pos = goal;
      setActive(goal);
      layout(goal, false);
      return;
    }
    const start = pos;
    const delta = shortestOffset(goal, start);
    const t0 = performance.now();
    const dur = 420;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      pos = start + delta * ease(t);
      layout(pos, true);
      if (t < 1) snapRaf = requestAnimationFrame(tick);
      else {
        pos = goal;
        setActive(goal);
        layout(goal, false);
      }
    };
    snapRaf = requestAnimationFrame(tick);
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    dragging = true;
    dragMoved = false;
    dragY = e.clientY;
    dragStart = pos;
    root.classList.add("is-dragging");
    root.setPointerCapture(e.pointerId);
    cancelAnimationFrame(snapRaf);
    clearTimeout(wheelTimer);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientY - dragY) > 4) dragMoved = true;
    pos = dragStart + (dragY - e.clientY) * DRAG_SENS;
    layout(pos, false);
  };

  const finishDrag = () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove("is-dragging");
    snapTo(Math.round(pos), true);
  };

  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerup", finishDrag);
  root.addEventListener("pointercancel", finishDrag);

  root.addEventListener("wheel", (e) => {
    e.preventDefault();
    pos += e.deltaY * WHEEL_SENS;
    layout(pos, false);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => snapTo(Math.round(pos), true), 120);
  }, { passive: false });

  items.forEach((item, i) => {
    item.addEventListener("click", (e) => {
      if (dragMoved) return;
      e.stopPropagation();
      if (i === index) return;
      snapTo(i, true);
    });
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      snapTo(index - 1, true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      snapTo(index + 1, true);
    }
  });

  setActive(0);
  layout(0, false);
})();

/* =============================================================
   Bento photo ticker — seamless film strip
   ============================================================= */
(function () {
  const root = document.querySelector("[data-photo-ticker]");
  if (!root) return;

  const track = root.querySelector(".photo-ticker__track");
  const strip = root.querySelector(".photo-ticker__strip");
  if (!track || !strip) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const clone = strip.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.appendChild(clone);
})();

/* =============================================================
   Live crosshair — bento telemetry HUD scoped to #apps.
   The anchored coordinate value tracks the real cursor; an optional
   micro-tilt parallaxes the flip portrait via --cx / --cy.
   ============================================================= */
(function () {
  const apps = document.getElementById("apps");
  const coord = apps && apps.querySelector("[data-apps-coord]");
  if (!apps || !coord) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flip = apps.querySelector(".memory__card--flip");
  const pad = (n) => String(Math.max(0, Math.round(n))).padStart(4, "0");

  let x = 0, y = 0, raf = 0;
  const write = () => {
    raf = 0;
    coord.textContent = pad(x) + " · " + pad(y);
    if (!reduceMotion && flip) {
      const r = apps.getBoundingClientRect();
      const cx = ((x - r.left) / r.width) * 2 - 1;
      const cy = ((y - r.top) / Math.max(window.innerHeight, 1)) * 2 - 1;
      flip.style.setProperty("--cx", Math.max(-1, Math.min(1, cx)).toFixed(3));
      flip.style.setProperty("--cy", Math.max(-1, Math.min(1, cy)).toFixed(3));
    }
  };

  apps.addEventListener("mousemove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(write);
  }, { passive: true });
  apps.addEventListener("mouseenter", () => coord.classList.add("is-on"), { passive: true });
  apps.addEventListener("mouseleave", () => {
    coord.classList.remove("is-on");
    if (flip) { flip.style.setProperty("--cx", "0"); flip.style.setProperty("--cy", "0"); }
  }, { passive: true });
})();
