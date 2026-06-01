// Focus Areas: same typewriter loop as landing page (script.js)
(function () {
  const keywords = [
    "Zero-to-One Design",
    "End-to-End Ownership",
    "Startup Founding",
    "Founder-Led Design",
    "Design Systems",
    "AI Prototyping",
    "Cloud Computing",
    "Developer Experience",
    "Creative Tools",
    "Film Production Tools",
    "Generative UI",
    "Agentic tools",
  ];
  const textEl = document.getElementById("hero-keyword");
  const cursorEl = document.getElementById("hero-cursor");
  if (!textEl || !cursorEl) return;

  const typeDelay = 85;
  const pauseAfterLine = 600;
  const pauseAfterClear = 500;
  const thinkingDotDelay = 180;
  const thinkingCycles = 3;
  const pauseAfterThinking = 200;
  const lineCount = 5;

  let currentLines = [];
  let currentKeyword = "";
  let usedThisRound = [];
  let isTyping = false;
  let timeoutId = null;

  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pickNext() {
    var available = keywords.filter(function (k) {
      return usedThisRound.indexOf(k) === -1;
    });
    if (available.length === 0) {
      usedThisRound = [];
      available = keywords.slice();
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  function updateDisplay(partialLine) {
    var full = currentLines.length ? currentLines.join("\n") + "\n" : "";
    textEl.textContent = full + partialLine;
  }

  function showThinking(done) {
    var dotCount = 0;
    var cycle = 0;
    function tick() {
      var prefix = "Thinking" + ".".repeat(dotCount);
      updateDisplay(prefix);
      dotCount++;
      if (dotCount > 3) {
        dotCount = 0;
        cycle++;
        if (cycle >= thinkingCycles) {
          timeoutId = setTimeout(function () {
            updateDisplay("");
            timeoutId = setTimeout(done, pauseAfterThinking);
          }, thinkingDotDelay);
          return;
        }
      }
      timeoutId = setTimeout(tick, thinkingDotDelay);
    }
    tick();
  }

  function typeLine(keyword, lineDone) {
    var index = 0;
    function tick() {
      if (index <= keyword.length) {
        updateDisplay(keyword.slice(0, index));
        index++;
        timeoutId = setTimeout(tick, typeDelay);
      } else {
        currentLines.push(keyword);
        usedThisRound.push(keyword);
        timeoutId = setTimeout(lineDone, pauseAfterLine);
      }
    }
    tick();
  }

  function startNextLine() {
    currentKeyword = pickNext();
    var isFirstLine = currentLines.length === 0;
    var showThinkingThisTime = isFirstLine || Math.random() < 0.5;
    function doType() {
      typeLine(currentKeyword, function () {
        isTyping = false;
        run();
      });
    }
    if (showThinkingThisTime) {
      showThinking(function () {
        isTyping = true;
        doType();
      });
    } else {
      isTyping = true;
      doType();
    }
  }

  function run() {
    if (isTyping) return;
    if (currentLines.length >= lineCount) {
      isTyping = true;
      textEl.textContent = "";
      currentLines = [];
      timeoutId = setTimeout(function () {
        isTyping = false;
        startNextLine();
      }, pauseAfterClear);
      return;
    }
    startNextLine();
  }

  if (reduceMotion) {
    textEl.textContent = keywords.slice(0, lineCount).join("\n");
    return;
  }

  currentKeyword = keywords[0];
  showThinking(function () {
    isTyping = true;
    typeLine(keywords[0], function () {
      isTyping = false;
      run();
    });
  });
})();

// Horizontal slide navigation (keyboard only)
(function () {
  var track = document.getElementById("deck-track");
  var viewport = document.getElementById("deck-viewport");
  if (!track || !viewport) return;

  var slides = track.querySelectorAll(".slide");
  var total = slides.length;
  if (total === 0) return;

  var index = 0;

  function update() {
    var pct = -index * 100;
    track.style.transform = "translateX(" + pct + "%)";
    slides.forEach(function (slide, i) {
      var hidden = i !== index;
      slide.setAttribute("aria-hidden", hidden ? "true" : "false");
      if ("inert" in HTMLElement.prototype) {
        slide.inert = hidden;
      }
    });
  }

  function go(delta) {
    var nextIndex = Math.max(0, Math.min(total - 1, index + delta));
    if (nextIndex === index) return;
    index = nextIndex;
    update();
  }

  document.addEventListener(
    "keydown",
    function (e) {
      if (document.body.classList.contains("deck-lightbox-open")) return;
      var sreOv = document.getElementById("collab-sre-overlay");
      if (sreOv && sreOv.classList.contains("is-open")) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          var tg = e.target;
          if (
            tg &&
            (tg.tagName === "TEXTAREA" ||
              tg.tagName === "INPUT" ||
              (tg.isContentEditable && tg.isContentEditable !== "false"))
          ) {
            return;
          }
          e.preventDefault();
          return;
        }
      }
      var t = e.target;
      if (t && t.closest && t.closest(".slide-6 .dataviz-tabs")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    },
    false
  );

  update();
})();

// Figma embed(s): scale each iframe to its slot (supports multiple slides)
(function () {
  var FIGMA_PROTO_WIDTH = 1440;
  var FIGMA_PROTO_HEIGHT = 720;

  function initFigmaSlot(slot) {
    var container = slot.querySelector(".figma-container");
    var wrapper = slot.querySelector(".figma-wrapper");
    if (!container || !wrapper) return null;

    var protoW = parseInt(slot.dataset.protoWidth, 10) || FIGMA_PROTO_WIDTH;
    var protoH = parseInt(slot.dataset.protoHeight, 10) || FIGMA_PROTO_HEIGHT;

    var layoutRetries = 0;

    function applyScale() {
      var w = container.clientWidth;
      var h = container.clientHeight;
      if (w <= 0 || h <= 0) {
        if (layoutRetries++ < 20) {
          requestAnimationFrame(applyScale);
        }
        return;
      }
      layoutRetries = 0;
      var scaleW = w / protoW;
      var scaleH = h / protoH;
      var scale = Math.min(scaleW, scaleH);
      var offsetX = Math.max(0, (w - protoW * scale) / 2);
      var offsetY = Math.max(0, (h - protoH * scale) / 2);
      wrapper.style.width = protoW + "px";
      wrapper.style.height = protoH + "px";
      wrapper.style.left = offsetX + "px";
      wrapper.style.top = offsetY + "px";
      wrapper.style.transform = "scale(" + scale + ")";
    }

    applyScale();

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        applyScale();
      });
      ro.observe(container);
      ro.observe(slot);
    }

    var slide = slot.closest(".slide");
    if (slide && typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) applyScale();
          });
        },
        { threshold: 0.01 }
      );
      io.observe(slide);
    }

    return applyScale;
  }

  var slots = document.querySelectorAll(".figma-embed-slot");
  if (!slots.length) return;

  var applyAll = [];
  slots.forEach(function (slot) {
    var fn = initFigmaSlot(slot);
    if (fn) applyAll.push(fn);
  });

  window.addEventListener("resize", function () {
    applyAll.forEach(function (fn) {
      fn();
    });
  });
})();

// IA guide on slide 4: same scale logic as lightbox on microsoft-playwright-testing.html
(function () {
  var host = document.querySelector(".slide-structure-diagram");
  var wrap = document.querySelector(".ia-guide-scale-wrap");
  if (!host || !wrap) return;

  var layoutRetries = 0;

  function applyIaScale() {
    var bw = host.clientWidth;
    var bh = host.clientHeight;
    var cw = wrap.offsetWidth;
    var ch = wrap.offsetHeight;
    if (bw <= 0 || bh <= 0 || cw <= 0 || ch <= 0) {
      if (layoutRetries++ < 24) {
        requestAnimationFrame(applyIaScale);
      }
      return;
    }
    layoutRetries = 0;
    var s = Math.min(bw / cw, bh / ch, 1);
    wrap.style.transform = "scale(" + s + ")";
  }

  applyIaScale();
  window.addEventListener("resize", applyIaScale);

  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(applyIaScale);
    ro.observe(host);
  }

  var slide4 = document.querySelector(".slide-4");
  if (slide4 && typeof IntersectionObserver !== "undefined") {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) applyIaScale();
        });
      },
      { threshold: 0.01 }
    );
    io.observe(slide4);
  }
})();

// Slide 5: scale branding + design system columns to fit below title (same math as IA guide)
(function () {
  var slide5 = document.querySelector(".slide-5");
  var host = document.querySelector(".slide-5-columns-host");
  var wrap = document.querySelector(".slide-5-columns-scale-wrap");
  if (!slide5 || !host || !wrap) return;

  var layoutRetries = 0;

  function applySlide5Scale() {
    var bw = host.clientWidth;
    var bh = host.clientHeight;
    var cw = wrap.offsetWidth;
    var ch = wrap.offsetHeight;
    if (bw <= 0 || bh <= 0 || cw <= 0 || ch <= 0) {
      if (layoutRetries++ < 24) {
        requestAnimationFrame(applySlide5Scale);
      }
      return;
    }
    layoutRetries = 0;
    var s = Math.min(bw / cw, bh / ch, 1);
    wrap.style.transform = "scale(" + s + ")";
  }

  applySlide5Scale();
  window.addEventListener("resize", applySlide5Scale);

  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(applySlide5Scale);
    ro.observe(host);
    ro.observe(wrap);
  }

  if (typeof IntersectionObserver !== "undefined") {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) applySlide5Scale();
        });
      },
      { threshold: 0.01 }
    );
    io.observe(slide5);
  }
})();

// Slide 5 status palette: line chart wipe-in (same logic as script.js #status-color-system)
(function () {
  var rows = document.querySelectorAll(
    "#deck-status-color-system .color-swatch-group:has(.color-swatch-group__chart-inline)"
  );
  if (!rows.length) return;

  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    rows.forEach(function (row) {
      row.classList.add("is-in-view");
    });
    return;
  }

  if (typeof IntersectionObserver === "undefined") {
    rows.forEach(function (row) {
      row.classList.add("is-in-view");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in-view");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -40px 0px", threshold: 0.2 }
  );

  rows.forEach(function (row) {
    observer.observe(row);
  });
})();

// Slide 5: Navigation diagram dissolve → color blocks + labels (same as script.js)
(function () {
  var block = document.querySelector(".slide-5 .js-nav-thumbnail-dissolve");
  if (!block) return;

  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    block.classList.add("dissolved");
    return;
  }

  var delayMs = 1000;
  var timer = null;

  if (typeof IntersectionObserver === "undefined") {
    block.classList.add("dissolved");
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          return;
        }
        if (block.classList.contains("dissolved")) return;
        timer = setTimeout(function () {
          block.classList.add("dissolved");
          timer = null;
          observer.unobserve(block);
        }, delayMs);
      });
    },
    { rootMargin: "0px 0px -80px 0px", threshold: 0.2 }
  );

  observer.observe(block);
})();

// Slide 5: Navigation — View full diagram lightbox (clone of script.js nav lightbox)
(function () {
  var openBtn = document.querySelector(".js-deck-nav-thumbnail-open");
  var lightbox = document.getElementById("deck-nav-lightbox");
  var body = lightbox && lightbox.querySelector(".ia-lightbox__body");
  var source = document.getElementById("deck-layout-nav-diagram");
  var closeBtns = document.querySelectorAll(".js-deck-nav-lightbox-close");
  var brandingLb = document.getElementById("deck-branding-lightbox");
  var explorationsLb = document.getElementById("deck-explorations-lightbox");

  if (!openBtn || !lightbox || !body || !source) return;

  function updateScale() {
    if (!lightbox.classList.contains("is-open")) return;
    var wrap = body.querySelector(".ia-lightbox__scale-wrap");
    var clone = wrap && wrap.firstElementChild;
    if (!wrap || !clone) return;
    wrap.style.width = "";
    wrap.style.height = "";
    wrap.style.display = "";
    wrap.style.alignItems = "";
    wrap.style.justifyContent = "";
    wrap.style.flex = "";
    wrap.style.boxSizing = "";
    wrap.style.minWidth = "";
    wrap.style.minHeight = "";
    clone.style.transform = "";
    clone.style.transformOrigin = "";
    clone.style.width = "";
    clone.style.maxWidth = "";
    clone.style.boxSizing = "";

    var bw = body.clientWidth;
    var bh = body.clientHeight;
    if (bw <= 0 || bh <= 0) return;

    wrap.style.boxSizing = "border-box";
    wrap.style.width = bw + "px";
    wrap.style.height = bh + "px";
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.justifyContent = "center";
    wrap.style.flex = "1";
    wrap.style.minWidth = "0";
    wrap.style.minHeight = "0";

    clone.style.width = "100%";
    clone.style.maxWidth = "100%";
    clone.style.boxSizing = "border-box";

    void wrap.offsetWidth;

    var cw = clone.offsetWidth;
    var ch = clone.offsetHeight;
    if (cw > 0 && ch > 0) {
      // Clamp to 1 so the bitmap is never upscaled past its intrinsic size.
      var s = Math.min(bw / cw, bh / ch, 1);
      clone.style.transformOrigin = "center center";
      clone.style.transform = "scale(" + s + ")";
    }
  }

  function openLightbox() {
    body.innerHTML = "";
    var clone = source.cloneNode(true);
    clone.classList.remove("js-nav-thumbnail-dissolve");
    clone.id = "";
    clone.classList.add("dissolved");
    var wrap = document.createElement("div");
    wrap.className = "ia-lightbox__scale-wrap";
    wrap.appendChild(clone);
    body.appendChild(wrap);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("deck-lightbox-open");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      requestAnimationFrame(updateScale);
    });
    window.addEventListener("resize", updateScale);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("deck-lightbox-open");
    var brandingOpen = brandingLb && brandingLb.classList.contains("is-open");
    var explorationsOpen = explorationsLb && explorationsLb.classList.contains("is-open");
    if (!brandingOpen && !explorationsOpen) {
      document.body.style.overflow = "";
    }
    window.removeEventListener("resize", updateScale);
  }

  openBtn.addEventListener("click", openLightbox);
  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", closeLightbox);
  });
  if (lightbox.querySelector(".ia-lightbox__backdrop")) {
    lightbox.querySelector(".ia-lightbox__backdrop").addEventListener("click", closeLightbox);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
      e.preventDefault();
      closeLightbox();
    }
  });
})();

// IA diagram: staggered dissolve when slide 4 enters view (same as website Structure block)
(function () {
  var guide = document.querySelector(".slide-structure-diagram .ia-guide");
  if (!guide) return;

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    guide.classList.add("ia-guide-visible");
    return;
  }

  var items = guide.querySelectorAll(".ia-main-items li, .ia-features-list li");
  var totalDuration = 2000;
  var stepMs = totalDuration / Math.max(items.length, 1);

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (guide.classList.contains("ia-guide-visible")) return;
        guide.classList.add("ia-guide-visible");
        items.forEach(function (li, i) {
          li.style.animationDelay = (i * stepMs) / 1000 + "s";
        });
      });
    },
    { rootMargin: "0px 0px -80px 0px", threshold: 0.2 }
  );

  observer.observe(guide);
})();

// Slide 5 branding: open full-size image in lightbox
(function () {
  var lightbox = document.getElementById("deck-branding-lightbox");
  if (!lightbox) return;

  var imgEl = lightbox.querySelector(".deck-lightbox__img");
  var backdrop = lightbox.querySelector(".deck-lightbox__backdrop");
  var closeBtn = lightbox.querySelector(".deck-lightbox__close");
  var openBtns = document.querySelectorAll(".js-deck-branding-open");
  var navLightbox = document.getElementById("deck-nav-lightbox");
  var explorationsLb = document.getElementById("deck-explorations-lightbox");
  var lastFocus = null;

  function clearLightboxSrcset() {
    if (!imgEl) return;
    imgEl.removeAttribute("srcset");
    imgEl.removeAttribute("sizes");
  }

  function openLightbox(btn) {
    var src = btn.getAttribute("data-full-src");
    if (!src || !imgEl) return;
    var src2x = btn.getAttribute("data-full-src-2x");
    var innerImg = btn.querySelector("img");
    var alt = innerImg ? innerImg.getAttribute("alt") || "" : "";
    lastFocus = document.activeElement;
    clearLightboxSrcset();
    imgEl.alt = alt;
    imgEl.removeAttribute("src");

    if (src2x) {
      imgEl.srcset = src + " 1x, " + src2x + " 2x";
      imgEl.sizes = Math.max(100, window.innerWidth - 48) + "px";
    }
    imgEl.src = src;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("deck-lightbox-open");
    if (imgEl.decode && typeof imgEl.decode === "function") {
      imgEl.decode().catch(function () {});
    }
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("deck-lightbox-open");
    var navOpen = navLightbox && navLightbox.classList.contains("is-open");
    var explorationsOpen = explorationsLb && explorationsLb.classList.contains("is-open");
    if (!navOpen && !explorationsOpen) {
      document.body.style.overflow = "";
    }
    if (imgEl) {
      imgEl.onload = null;
      clearLightboxSrcset();
      imgEl.removeAttribute("src");
      imgEl.alt = "";
    }
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      openLightbox(btn);
    });
  });

  if (backdrop) backdrop.addEventListener("click", closeLightbox);
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  window.addEventListener("resize", function () {
    if (!lightbox.classList.contains("is-open") || !imgEl) return;
    if (imgEl.hasAttribute("srcset")) {
      imgEl.sizes = Math.max(100, window.innerWidth - 48) + "px";
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    }
  });
})();

// Slide 5 layout: layout explorations image in lightbox
(function () {
  var lightbox = document.getElementById("deck-explorations-lightbox");
  if (!lightbox) return;

  var imgEl = lightbox.querySelector(".deck-explorations-lightbox__img");
  var closeBtn = lightbox.querySelector(".ia-lightbox__close");
  var closeBtns = lightbox.querySelectorAll(".js-deck-explorations-close");
  var openBtns = document.querySelectorAll(".js-deck-explorations-open");
  var navLightbox = document.getElementById("deck-nav-lightbox");
  var brandingLb = document.getElementById("deck-branding-lightbox");
  /* Bump explorationsAssetRev after replacing the PNG so the browser does not keep an old cached bitmap. */
  var explorationsAssetRev = "1";
  var explorationsSrc =
    "../assets/LayoutIterations-55882724-2338-4970-a2be-ddc76c70b107.png?v=" + explorationsAssetRev;
  var lastFocus = null;

  function clearLightboxSrcset() {
    if (!imgEl) return;
    imgEl.removeAttribute("srcset");
    imgEl.removeAttribute("sizes");
  }

  function openLightbox() {
    if (!imgEl) return;
    lastFocus = document.activeElement;
    clearLightboxSrcset();
    imgEl.alt = "Wireframe sketch and dashboard UI explorations";
    imgEl.removeAttribute("src");
    imgEl.src = explorationsSrc;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("deck-lightbox-open");
    document.body.style.overflow = "hidden";
    if (imgEl.decode && typeof imgEl.decode === "function") {
      imgEl.decode().catch(function () {});
    }
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("deck-lightbox-open");
    var navOpen = navLightbox && navLightbox.classList.contains("is-open");
    var brandingOpen = brandingLb && brandingLb.classList.contains("is-open");
    if (!navOpen && !brandingOpen) {
      document.body.style.overflow = "";
    }
    if (imgEl) {
      imgEl.onload = null;
      clearLightboxSrcset();
      imgEl.removeAttribute("src");
      imgEl.alt = "";
    }
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      openLightbox();
    });
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    }
  });
})();

// Slide 6: Insight dataviz gallery — clone row tracks + Healthy / Test failing tabs (same as script.js case study)
(function () {
  var tablist = document.querySelector(".slide-6 .dataviz-tabs");
  if (!tablist) return;

  var scrollWrappers = document.querySelectorAll(".slide-6 .slide-6-insight .dataviz-gallery__scroll");
  scrollWrappers.forEach(function (wrap) {
    var track = wrap.querySelector(".dataviz-gallery__track");
    var rowTrack = track && track.querySelector(".dataviz-gallery__row-track");
    if (track && rowTrack) {
      var clone = rowTrack.cloneNode(true);
      clone.classList.add("dataviz-gallery__row-track--clone");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }
  });

  function syncDatavizScrollDuration() {
    document.querySelectorAll(".slide-6 .dataviz-gallery__track").forEach(function (track) {
      var w = track.scrollWidth;
      if (!w) return;
      var loopW = w / 2;
      var pxPerSec = 32;
      var sec = loopW / pxPerSec;
      sec = Math.max(45, Math.min(140, sec));
      track.style.setProperty("--dataviz-scroll-duration", sec + "s");
    });
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(syncDatavizScrollDuration);
  });
  window.addEventListener("resize", function () {
    requestAnimationFrame(syncDatavizScrollDuration);
  });
  var slide6 = document.querySelector(".slide-6");
  if (slide6 && typeof ResizeObserver !== "undefined") {
    var roDataviz = new ResizeObserver(function () {
      requestAnimationFrame(syncDatavizScrollDuration);
    });
    roDataviz.observe(slide6);
  }
  if (slide6 && typeof IntersectionObserver !== "undefined") {
    var ioDataviz = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) syncDatavizScrollDuration();
        });
      },
      { threshold: 0.05 }
    );
    ioDataviz.observe(slide6);
  }

  if (slide6) {
    slide6.querySelectorAll(".dataviz-gallery__row img").forEach(function (img) {
      if (img.complete) return;
      img.addEventListener(
        "load",
        function () {
          requestAnimationFrame(syncDatavizScrollDuration);
        },
        { once: true }
      );
    });
  }

  var tabs = tablist.querySelectorAll(".dataviz-tab");
  var panels = document.querySelectorAll(".slide-6 .dataviz-pane");
  var slider = tablist.querySelector(".dataviz-tab-slider");
  var DATAVIZ_ORDER = ["healthy", "failing"];
  var autoIntervalId = null;

  function updateTabSlider() {
    if (!slider) return;
    var active = tablist.querySelector(".dataviz-tab--active");
    if (active) {
      tablist.style.setProperty("--tab-slider-left", active.offsetLeft + "px");
      tablist.style.setProperty("--tab-slider-width", active.offsetWidth + "px");
    }
  }

  function showPanel(panelId) {
    panels.forEach(function (p) {
      p.classList.toggle("dataviz-pane--active", p.id === panelId);
    });
    tabs.forEach(function (t) {
      var isActive = t.getAttribute("aria-controls") === panelId;
      t.classList.toggle("dataviz-tab--active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    updateTabSlider();
    requestAnimationFrame(syncDatavizScrollDuration);
  }

  function getNextDataviz() {
    var active = tablist.querySelector(".dataviz-tab--active");
    var current = active ? active.getAttribute("data-dataviz") : "healthy";
    var idx = DATAVIZ_ORDER.indexOf(current);
    if (idx < 0) idx = 0;
    return DATAVIZ_ORDER[(idx + 1) % DATAVIZ_ORDER.length];
  }

  function stopAutoRotate() {
    if (autoIntervalId) {
      clearInterval(autoIntervalId);
      autoIntervalId = null;
    }
  }

  var failingCount = 0;
  requestAnimationFrame(updateTabSlider);
  autoIntervalId = setInterval(function () {
    var next = getNextDataviz();
    var panelId = next === "healthy" ? "deck-dataviz-panel-healthy" : "deck-dataviz-panel-failing";
    showPanel(panelId);
    if (next === "failing") {
      failingCount += 1;
      if (failingCount >= 3) {
        stopAutoRotate();
      }
    }
  }, 6000);

  tabs = tablist.querySelectorAll(".dataviz-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      stopAutoRotate();
      var id = tab.getAttribute("aria-controls");
      if (id) showPanel(id);
    });
  });

  tablist.addEventListener("keydown", function (e) {
    var tabEls = tablist.querySelectorAll(".dataviz-tab");
    var idx = Array.prototype.indexOf.call(tabEls, document.activeElement);
    if (idx < 0) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      stopAutoRotate();
      var prev = tabEls[(idx - 1 + tabEls.length) % tabEls.length];
      prev.focus();
      showPanel(prev.getAttribute("aria-controls"));
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      stopAutoRotate();
      var nextTab = tabEls[(idx + 1) % tabEls.length];
      nextTab.focus();
      showPanel(nextTab.getAttribute("aria-controls"));
    }
  });
})();

// Azure SRE Agent chat overlay — aligned to CoreAI Design (.collab-hub__design)
(function () {
  var overlay = document.getElementById("collab-sre-overlay");
  var panel = overlay && overlay.querySelector(".collab-sre-overlay__panel");
  if (!overlay || !panel) return;

  var lastDesignEl = null;
  var lastFocus = null;

  function remToPx(rem) {
    var base = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return rem * base;
  }

  function positionPanel(el) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    var w = r.width * 1.5;
    var h = r.height * 2;
    /* Match .sre-chat padding ×2: extra (1.5rem width, 3.2rem height) so content is not squeezed */
    w += remToPx(1.5);
    h += remToPx(3.2);
    /* Reserve height for Chat / Dashboard tab row when it appears (tabs don’t resize panel later) */
    h += remToPx(2.75);
    /* Bottom composer (input + send) — grow panel so scroll area stays usable */
    h += remToPx(5.75);
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    panel.style.left = Math.max(0, cx - w / 2) + "px";
    panel.style.top = Math.max(0, cy - h / 2) + "px";
    panel.style.width = Math.max(0, w) + "px";
    panel.style.height = Math.max(0, h) + "px";
    positionControlPanel();
  }

  function positionControlPanel() {
    if (!sreProtocolControlsEl || sreProtocolControlsEl.hidden) return;
    setTimeout(function () {
      var r = panel.getBoundingClientRect();
      var cpW = sreProtocolControlsEl.offsetWidth || 180;
      var cpH = sreProtocolControlsEl.offsetHeight || 80;
      var left = r.right + 16;
      var top = r.top + r.height / 2 - cpH / 2;
      // Keep within viewport
      if (left + cpW > window.innerWidth - 8) left = r.left - cpW - 16;
      if (top < 8) top = 8;
      if (top + cpH > window.innerHeight - 8) top = window.innerHeight - cpH - 8;
      sreProtocolControlsEl.style.left = left + "px";
      sreProtocolControlsEl.style.top = top + "px";
    }, 120);
  }

  function openFromLink(link) {
    var slide = link.closest(".slide");
    var localDesignEl = slide && slide.querySelector(".collab-hub__design");
    var designEl = localDesignEl || document.querySelector(".collab-hub__design") || link;
    lastDesignEl = designEl;
    var showToggle = link.dataset.chartToggle === "true";
    overlay.classList.toggle("collab-sre-overlay--with-toggle", showToggle);
    overlay.classList.toggle("collab-sre-overlay--centered", !localDesignEl);
    if (sreProtocolControlsEl) {
      sreProtocolControlsEl.hidden = !showToggle;
    }
    lastFocus = document.activeElement;
    var chat = overlay.querySelector(".sre-chat");
    if (chat) {
      chat.classList.remove("sre-chat--animating", "sre-chat--reduced");
      void chat.offsetWidth;
      var reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        chat.classList.add("sre-chat--reduced");
      } else {
        chat.classList.add("sre-chat--animating");
      }
    }
    positionPanel(designEl);
    overlay.classList.add("is-open");
    positionControlPanel();
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("collab-sre-overlay-open");
    var inputFocus = document.getElementById("sre-chat-input");
    if (inputFocus) {
      inputFocus.focus();
    } else {
      var closeBtn = overlay.querySelector(".collab-sre-overlay__close");
      if (closeBtn) closeBtn.focus();
    }
  }

  function close() {
    var chat = overlay.querySelector(".sre-chat");
    if (chat) {
      chat.classList.remove("sre-chat--animating", "sre-chat--reduced");
    }
    var userBox = document.getElementById("sre-chat-user-messages");
    if (userBox) userBox.innerHTML = "";
    var input = document.getElementById("sre-chat-input");
    if (input) input.value = "";
    sreConversationTabsShown = false;
    if (panelBodyEl) panelBodyEl.classList.remove("sre-chat-panel-body--tabs-visible");
    if (tabsEl) tabsEl.setAttribute("hidden", "");
    if (dashboardCpuRootEl) dashboardCpuRootEl.innerHTML = "";
    if (tabChatEl) {
      tabChatEl.setAttribute("aria-selected", "true");
      tabChatEl.tabIndex = 0;
    }
    if (tabDashboardEl) {
      tabDashboardEl.setAttribute("aria-selected", "false");
      tabDashboardEl.tabIndex = -1;
    }
    if (panelChatEl) panelChatEl.hidden = false;
    if (panelDashboardEl) panelDashboardEl.hidden = true;
    overlay.classList.remove("is-open", "collab-sre-overlay--with-toggle", "collab-sre-overlay--centered");
    if (sreProtocolControlsEl) sreProtocolControlsEl.hidden = true;
    // Reset prototype controls to defaults
    if (sreRadiusSliderEl) { sreRadiusSliderEl.value = 10; if (sreRadiusValueEl) sreRadiusValueEl.textContent = "10px"; }
    var defaultColRadio = sreProtocolControlsEl && sreProtocolControlsEl.querySelector("input[name='sre-columns'][value='2']");
    if (defaultColRadio) defaultColRadio.checked = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("collab-sre-overlay-open");
    lastDesignEl = null;
    if (lastFocus && typeof lastFocus.focus === "function") {
      try {
        lastFocus.focus();
      } catch (err) {}
    }
    lastFocus = null;
  }

  window.collabSreOverlayClose = close;

  document.querySelectorAll(".js-collab-view-design").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      openFromLink(a);
    });
  });

  overlay.querySelectorAll(".js-collab-sre-overlay-close").forEach(function (el) {
    el.addEventListener("click", function () {
      close();
    });
  });

  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key !== "Escape") return;
      if (!overlay.classList.contains("is-open")) return;
      e.preventDefault();
      close();
    },
    true
  );

  window.addEventListener("resize", function () {
    if (overlay.classList.contains("is-open") && lastDesignEl) {
      positionPanel(lastDesignEl);
    }
  });

  var userMessagesEl = document.getElementById("sre-chat-user-messages");
  var inputEl = document.getElementById("sre-chat-input");
  var sendBtn = document.getElementById("sre-chat-send");
  var panelBodyEl = document.getElementById("sre-chat-panel-body");
  var tabsEl = document.getElementById("sre-tabs");
  var tabChatEl = document.getElementById("sre-tab-chat");
  var tabDashboardEl = document.getElementById("sre-tab-dashboard");
  var panelChatEl = document.getElementById("sre-panel-chat");
  var panelDashboardEl = document.getElementById("sre-panel-dashboard");
  var dashboardCpuRootEl = document.getElementById("sre-dashboard-cpu-root");
  var sreChartToggleEl = document.getElementById("sre-chart-toggle");
  var sreProtocolControlsEl = document.getElementById("sre-prototype-controls");
  var sreChartMode = "line";
  var sreConversationTabsShown = false;

  function scrollChatToBottom() {
    var sc = overlay.querySelector(".sre-chat");
    if (sc) sc.scrollTop = sc.scrollHeight;
  }

  function appendUserMessage(text) {
    if (!userMessagesEl || !text) return;
    var row = document.createElement("div");
    row.className = "sre-chat__msg sre-chat__msg--user";
    var p = document.createElement("p");
    p.className = "sre-chat__msg-user-text";
    p.textContent = text;
    row.appendChild(p);
    userMessagesEl.appendChild(row);
    scrollChatToBottom();
  }

  function buildSreMetricChartSvg(o) {
    var W = o.W;
    var H = o.H;
    var plotL = o.plotL;
    var plotT = o.plotT;
    var plotW = o.plotW;
    var plotH = o.plotH;
    var titleToChartGap = o.titleToChartGap != null ? o.titleToChartGap : 10;
    var chartTop = plotT + titleToChartGap;
    var plotB = chartTop + plotH;
    var yMax = o.yMax;
    var values = o.values;
    var m = values.length - 1;
    if (m < 1) m = 1;
    var cursorIdx = o.cursorIdx != null ? o.cursorIdx : 4;
    cursorIdx = Math.max(0, Math.min(cursorIdx, values.length - 1));
    var cursorVal = values[cursorIdx];
    var cursorX = plotL + (cursorIdx / m) * plotW;
    var cursorY = plotB - (cursorVal / yMax) * plotH;
    var gridParts = [];
    for (var gi = 0; gi < 5; gi++) {
      var fy = gi / 4;
      var gy = plotB - fy * plotH;
      gridParts.push(
        '<line class="sre-cpu-chart__grid" x1="' +
          plotL +
          '" y1="' +
          gy +
          '" x2="' +
          (plotL + plotW) +
          '" y2="' +
          gy +
          '"/>' +
          '<text class="sre-cpu-chart__y-label" x="' +
          (plotL - 4) +
          '" y="' +
          (gy + 3) +
          '" text-anchor="end">' +
          o.yTickLabels[4 - gi] +
          "</text>"
      );
    }
    var linePts = values
      .map(function (val, i) {
        var x = plotL + (i / m) * plotW;
        var y = plotB - (val / yMax) * plotH;
        return x + "," + y;
      })
      .join(" ");
    var dotsHtml = values
      .map(function (val, i) {
        var x = plotL + (i / m) * plotW;
        var y = plotB - (val / yMax) * plotH;
        return '<circle class="sre-cpu-chart__dot" cx="' + x + '" cy="' + y + '" r="2.5"/>';
      })
      .join("");
    var fxPositions = [0, 1 / 3, 2 / 3, 1];
    var xLabelHtml = fxPositions
      .map(function (fx, i) {
        var x = plotL + fx * plotW;
        var anchor = i === 0 ? "start" : i === 3 ? "end" : "middle";
        return (
          '<text class="sre-cpu-chart__x-label" x="' +
          x +
          '" y="' +
          (plotB + 14) +
          '" text-anchor="' +
          anchor +
          '">' +
          o.xLabels[i] +
          "</text>"
        );
      })
      .join("");
    var lineClass = o.lineClass || "sre-cpu-chart__line";
    var barClass = lineClass.replace("sre-cpu-chart__line", "sre-cpu-chart__bar");
    var chartType = o.chartType || "line";
    var titleY = Math.round(plotT * 0.65);

    var dataHtml;
    if (chartType === "bar") {
      var barCount = values.length;
      var barGap = 3;
      var barW = plotW / barCount - barGap;
      dataHtml = values.map(function (val, i) {
        var bx = plotL + (i / barCount) * plotW + barGap / 2;
        var bh = (val / yMax) * plotH;
        var by = plotB - bh;
        var isActive = i === cursorIdx;
        return '<rect class="sre-cpu-chart__bar' + (isActive ? " sre-cpu-chart__bar--active" : "") + " " + barClass + '" x="' + bx + '" y="' + by + '" width="' + barW + '" height="' + bh + '" rx="2"/>';
      }).join("");
    } else {
      dataHtml =
        '<polyline class="' + lineClass + '" fill="none" points="' + linePts + '" />' +
        dotsHtml +
        '<line class="sre-cpu-chart__cursor" x1="' + cursorX + '" y1="' + chartTop + '" x2="' + cursorX + '" y2="' + plotB + '" />' +
        '<circle class="sre-cpu-chart__cursor-dot" cx="' + cursorX + '" cy="' + cursorY + '" r="3.5"/>';
    }

    return (
      '<svg class="sre-cpu-chart__svg" viewBox="0 0 ' +
      W + " " + H +
      '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect class="sre-cpu-chart__svg-header" x="0" y="0" width="' + W + '" height="' + plotT + '" rx="3"/>' +
      '<text class="sre-cpu-chart__svg-title" x="8" y="' + titleY + '">' + o.title + "</text>" +
      gridParts.join("") +
      dataHtml +
      xLabelHtml +
      "</svg>"
    );
  }

  function buildMetricCard(cfg) {
    var card = document.createElement("div");
    card.className = "sre-metric-chart sre-cpu-chart";
    var barClass = "sre-cpu-chart__summary-bar" + (cfg.summaryBarClass ? " " + cfg.summaryBarClass : "");
    card.innerHTML =
      '<div class="sre-cpu-chart__plot">' +
      buildSreMetricChartSvg(cfg) +
      "</div>" +
      '<div class="sre-cpu-chart__summary">' +
      '<span class="' +
      barClass +
      '" aria-hidden="true"></span>' +
      '<div class="sre-cpu-chart__summary-text">' +
      '<span class="sre-cpu-chart__summary-label">' +
      cfg.summaryLabel +
      "</span>" +
      '<span class="sre-cpu-chart__summary-value">' +
      cfg.summaryValueHtml +
      "</span>" +
      "</div></div>";
    return card;
  }

  function buildDashboardMetricsGrid(chartType) {
    chartType = chartType || "line";
    var wrap = document.createElement("div");
    wrap.className = "sre-dashboard-metrics";
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", "Container metrics: CPU, memory, requests, latency");

    var mini = {
      W: 280,
      H: 168,
      plotL: 36,
      plotT: 31,
      plotW: 232,
      plotH: 74,
      titleToChartGap: 10,
    };

    wrap.appendChild(
      buildMetricCard(
        Object.assign({}, mini, { chartType: chartType }, {
          title: "CPU usage",
          yMax: 100,
          values: [38, 55, 72, 89, 84, 76, 71, 68],
          yTickLabels: ["100%", "75%", "50%", "25%", "0%"],
          xLabels: ["11:30", "11:45", "12:00", "12:15"],
          cursorIdx: 5,
          lineClass: "sre-cpu-chart__line sre-metric-chart__line--cpu",
          summaryLabel: "CPU",
          summaryValueHtml:
            "<strong>71</strong><span class=\"sre-cpu-chart__summary-unit\">%</span>",
          summaryBarClass: "sre-cpu-chart__summary-bar--cpu",
        })
      )
    );
    wrap.appendChild(
      buildMetricCard(
        Object.assign({}, mini, { chartType: chartType }, {
          title: "Memory usage",
          yMax: 4096,
          values: [1480, 2100, 2400, 1980, 1850, 1720, 1760, 1820],
          yTickLabels: ["4 GB", "3 GB", "2 GB", "1 GB", "0"],
          xLabels: ["11:30", "11:45", "12:00", "12:15"],
          cursorIdx: 5,
          lineClass: "sre-cpu-chart__line sre-metric-chart__line--memory",
          summaryLabel: "MEMORY",
          summaryValueHtml:
            "<strong>1.8</strong><span class=\"sre-cpu-chart__summary-unit\"> GB / 4 GB</span>",
          summaryBarClass: "sre-cpu-chart__summary-bar--memory",
        })
      )
    );
    wrap.appendChild(
      buildMetricCard(
        Object.assign({}, mini, { chartType: chartType }, {
          title: "Requests",
          yMax: 400,
          values: [120, 210, 340, 280, 195, 220, 265, 310],
          yTickLabels: ["400", "300", "200", "100", "0"],
          xLabels: ["11:30", "11:45", "12:00", "12:15"],
          cursorIdx: 5,
          lineClass: "sre-cpu-chart__line sre-metric-chart__line--requests",
          summaryLabel: "THROUGHPUT",
          summaryValueHtml:
            "<strong>248</strong><span class=\"sre-cpu-chart__summary-unit\"> req/s</span>",
          summaryBarClass: "sre-cpu-chart__summary-bar--requests",
        })
      )
    );
    wrap.appendChild(
      buildMetricCard(
        Object.assign({}, mini, { chartType: chartType }, {
          title: "Response time",
          yMax: 200,
          values: [118, 95, 82, 156, 142, 68, 74, 88],
          yTickLabels: ["200ms", "150ms", "100ms", "50ms", "0"],
          xLabels: ["11:30", "11:45", "12:00", "12:15"],
          cursorIdx: 5,
          lineClass: "sre-cpu-chart__line sre-metric-chart__line--latency",
          summaryLabel: "P95 LATENCY",
          summaryValueHtml:
            "<strong>88</strong><span class=\"sre-cpu-chart__summary-unit\"> ms</span>",
          summaryBarClass: "sre-cpu-chart__summary-bar--latency",
        })
      )
    );

    return wrap;
  }

  function showConversationTabs() {
    if (!panelBodyEl || !tabsEl) return;
    panelBodyEl.classList.add("sre-chat-panel-body--tabs-visible");
    tabsEl.removeAttribute("hidden");
  }

  function rebuildDashboard() {
    if (!dashboardCpuRootEl) return;
    var existing = dashboardCpuRootEl.querySelector(".sre-dashboard-metrics");
    if (existing) existing.remove();
    dashboardCpuRootEl.appendChild(buildDashboardMetricsGrid(sreChartMode));
    if (sreChartToggleEl) {
      sreChartToggleEl.querySelector(".sre-chart-toggle__opt--line").classList.toggle("sre-chart-toggle__opt--active", sreChartMode === "line");
      sreChartToggleEl.querySelector(".sre-chart-toggle__opt--bar").classList.toggle("sre-chart-toggle__opt--active", sreChartMode === "bar");
    }
    // Re-apply prototype controls state after rebuild
    if (sreRadiusSliderEl) applyCardRadius(parseInt(sreRadiusSliderEl.value, 10));
    if (sreProtocolControlsEl) {
      var colRadio = sreProtocolControlsEl.querySelector("input[name='sre-columns']:checked");
      if (colRadio) applyColumnLayout(parseInt(colRadio.value, 10));
    }
  }

  function ensureDashboardCpuRendered() {
    if (!dashboardCpuRootEl || dashboardCpuRootEl.querySelector(".sre-dashboard-metrics")) return;
    rebuildDashboard();
  }

  if (sreChartToggleEl) {
    sreChartToggleEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".sre-chart-toggle__opt");
      if (!btn) return;
      var mode = btn.dataset.mode;
      if (!mode || mode === sreChartMode) return;
      sreChartMode = mode;
      rebuildDashboard();
    });
  }

  var sreRadiusSliderEl = document.getElementById("sre-radius-slider");
  var sreRadiusValueEl = document.getElementById("sre-radius-value");

  function applyCardRadius(val) {
    var metricsEl = dashboardCpuRootEl && dashboardCpuRootEl.querySelector(".sre-dashboard-metrics");
    if (metricsEl) metricsEl.style.setProperty("--card-radius", val + "px");
    if (sreRadiusValueEl) sreRadiusValueEl.textContent = val + "px";
  }

  if (sreRadiusSliderEl) {
    sreRadiusSliderEl.addEventListener("input", function () {
      applyCardRadius(parseInt(this.value, 10));
    });
  }

  function applyColumnLayout(cols) {
    var metricsEl = dashboardCpuRootEl && dashboardCpuRootEl.querySelector(".sre-dashboard-metrics");
    if (metricsEl) metricsEl.classList.toggle("sre-dashboard-metrics--1col", cols === 1);
  }

  if (sreProtocolControlsEl) {
    sreProtocolControlsEl.addEventListener("change", function (e) {
      if (e.target.name === "sre-columns") {
        applyColumnLayout(parseInt(e.target.value, 10));
      }
    });
  }

  function selectSreTab(which) {
    var chat = which === "chat";
    if (tabChatEl) {
      tabChatEl.setAttribute("aria-selected", chat);
      tabChatEl.tabIndex = chat ? 0 : -1;
    }
    if (tabDashboardEl) {
      tabDashboardEl.setAttribute("aria-selected", !chat);
      tabDashboardEl.tabIndex = chat ? -1 : 0;
    }
    if (panelChatEl) panelChatEl.hidden = !chat;
    if (panelDashboardEl) panelDashboardEl.hidden = chat;
    if (!chat) {
      ensureDashboardCpuRendered();
    }
  }

  function sendUserMessage() {
    if (!inputEl) return;
    var text = inputEl.value.replace(/\r\n/g, "\n").trim();
    if (!text) return;
    appendUserMessage(text);
    inputEl.value = "";
    inputEl.focus();
    window.setTimeout(function () {
      if (sreConversationTabsShown) return;
      sreConversationTabsShown = true;
      showConversationTabs();
    }, 420);
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      sendUserMessage();
    });
  }

  if (inputEl) {
    inputEl.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      if (e.shiftKey) return;
      e.preventDefault();
      sendUserMessage();
    });
  }

  overlay.addEventListener("click", function (e) {
    var t = e.target.closest(".sre-chat__action-btn--like, .sre-chat__action-btn--dislike");
    if (!t || !overlay.contains(t)) return;
    e.preventDefault();
    e.stopPropagation();
    var row = t.closest(".sre-chat__actions");
    if (!row) return;
    var like = row.querySelector(".sre-chat__action-btn--like");
    var dislike = row.querySelector(".sre-chat__action-btn--dislike");
    if (!like || !dislike) return;
    var pressed = t.getAttribute("aria-pressed") === "true";
    if (pressed) {
      t.setAttribute("aria-pressed", "false");
    } else {
      t.setAttribute("aria-pressed", "true");
      if (t.classList.contains("sre-chat__action-btn--like")) {
        dislike.setAttribute("aria-pressed", "false");
      } else {
        like.setAttribute("aria-pressed", "false");
      }
    }
  });

  if (tabChatEl) {
    tabChatEl.addEventListener("click", function () {
      selectSreTab("chat");
    });
  }
  if (tabDashboardEl) {
    tabDashboardEl.addEventListener("click", function () {
      selectSreTab("dashboard");
    });
  }

  var tablistNavEl = overlay.querySelector(".sre-fui-tablist");
  if (tablistNavEl) {
    tablistNavEl.addEventListener(
      "keydown",
      function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.stopPropagation();
        if (e.key === "ArrowRight") {
          selectSreTab("dashboard");
          if (tabDashboardEl) tabDashboardEl.focus();
        } else {
          selectSreTab("chat");
          if (tabChatEl) tabChatEl.focus();
        }
      },
      true
    );
  }
})();

// Slides 12–15 — equal height for process pills per slide (tallest wins on that slide)
(function () {
  var workflowSlides = document.querySelectorAll(".slide-12, .slide-13, .slide-14, .slide-15");
  if (!workflowSlides.length) return;

  var raf = null;
  function equalizePills() {
    workflowSlides.forEach(function (slide) {
      var pills = slide.querySelectorAll(".process-workflow__pill");
      if (!pills.length) return;
      Array.prototype.forEach.call(pills, function (p) {
        p.style.minHeight = "";
      });
      var max = 0;
      Array.prototype.forEach.call(pills, function (p) {
        var h = p.getBoundingClientRect().height;
        if (h > max) max = h;
      });
      if (max <= 0) return;
      Array.prototype.forEach.call(pills, function (p) {
        p.style.minHeight = max + "px";
      });
    });
  }

  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = null;
      equalizePills();
    });
  }

  window.addEventListener("resize", schedule);
  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(schedule);
    workflowSlides.forEach(function (slide) {
      ro.observe(slide);
    });
  }
  if (typeof IntersectionObserver !== "undefined") {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) schedule();
        });
      },
      { threshold: 0.15 }
    );
    workflowSlides.forEach(function (slide) {
      io.observe(slide);
    });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule);
  } else {
    schedule();
  }
})();
