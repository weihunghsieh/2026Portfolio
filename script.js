// Hero: typewriter multi-line (5 lines), then clear and restart
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

  function pickNext() {
    var available = keywords.filter(function (k) { return usedThisRound.indexOf(k) === -1; });
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

  currentKeyword = keywords[0];
  showThinking(function () {
    isTyping = true;
    typeLine(keywords[0], function () {
      isTyping = false;
      run();
    });
  });
})();

// Smooth scroll for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Dark mode toggle (Claude Code–inspired theme)
(function () {
  var toggle = document.getElementById("theme-toggle");
  var KEY = "portfolio-theme";

  function isDark() {
    return document.body.classList.contains("dark");
  }

  function setDark(dark) {
    document.body.classList.toggle("dark", dark);
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch (e) {}
  }

  function init() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "dark" || saved === "light") {
        setDark(saved === "dark");
        return;
      }
    } catch (e) {}
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }
  }

  init();
  if (toggle) {
    toggle.addEventListener("click", function () {
      setDark(!isDark());
    });
  }
})();

// IA diagram: "View full diagram" opens lightbox with full diagram
(function () {
  var openBtn = document.querySelector(".js-ia-guide-open");
  var lightbox = document.getElementById("ia-lightbox");
  var body = lightbox && lightbox.querySelector(".ia-lightbox__body");
  var figure = document.getElementById("ia-guide-figure");
  var closeBtns = document.querySelectorAll(".js-ia-lightbox-close");

  if (!openBtn || !lightbox || !body || !figure) return;

  function updateScale() {
    if (!lightbox.classList.contains("is-open")) return;
    var wrap = body.querySelector(".ia-lightbox__scale-wrap");
    if (!wrap) return;
    var bw = body.clientWidth;
    var bh = body.clientHeight;
    var cw = wrap.offsetWidth;
    var ch = wrap.offsetHeight;
    if (cw > 0 && ch > 0) {
      var s = Math.min(bw / cw, bh / ch, 1);
      wrap.style.transform = "scale(" + s + ")";
    }
  }

  function openLightbox() {
    body.innerHTML = "";
    var clone = figure.cloneNode(true);
    clone.classList.remove("js-ia-guide-diagram");
    clone.id = "";
    clone.style.transform = "";
    var wrap = document.createElement("div");
    wrap.className = "ia-lightbox__scale-wrap";
    wrap.appendChild(clone);
    body.appendChild(wrap);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(updateScale);
    window.addEventListener("resize", updateScale);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    window.removeEventListener("resize", updateScale);
  }

  openBtn.addEventListener("click", openLightbox);
  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", closeLightbox);
  });
  lightbox.querySelector(".ia-lightbox__backdrop").addEventListener("click", closeLightbox);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
})();

// Nav thumbnail: "View full diagram" opens lightbox with full nav diagram
(function () {
  var openBtn = document.querySelector(".js-nav-thumbnail-open");
  var lightbox = document.getElementById("nav-lightbox");
  var body = lightbox && lightbox.querySelector(".ia-lightbox__body");
  var source = document.getElementById("nav-thumbnail-diagram");
  var closeBtns = document.querySelectorAll(".js-nav-lightbox-close");

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

    /* Stretch wrap to body so .nav-thumbnail isn’t shrink-wrapped to a narrow column width */
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
      // Clamp to 1 so the source bitmap is never upscaled past its
      // intrinsic resolution (which would soften the image on Retina).
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
    document.body.style.overflow = "hidden";
    requestAnimationFrame(updateScale);
    window.addEventListener("resize", updateScale);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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
      closeLightbox();
    }
  });
})();

// Wroom workflow diagram: "View full diagram" opens lightbox (with Adapter / Scene / Shot toggle)
(function () {
  var openBtn = document.querySelector(".js-wroom-workflow-open");
  var lightbox = document.getElementById("wroom-workflow-lightbox");
  var body = lightbox && lightbox.querySelector(".ia-lightbox__body");
  var closeBtns = document.querySelectorAll(".js-wroom-workflow-lightbox-close");
  var carousel = document.getElementById("wroom-layout-carousel");
  var ORDER = ["adapter", "scene", "shot"];
  var TAB_LABELS = { adapter: "Adapter", scene: "Scene", shot: "Shot" };

  if (!openBtn || !lightbox || !body || !carousel) return;

  function getActiveLayoutKey() {
    var activePanel = carousel.querySelector(".wroom-layout-carousel__panel--active");
    return activePanel ? activePanel.getAttribute("data-wroom-layout") : "adapter";
  }

  function cloneDiagram(source) {
    var clone = source.cloneNode(true);
    clone.classList.remove("js-nav-thumbnail-dissolve");
    clone.id = "";
    clone.classList.add("dissolved");
    return clone;
  }

  function getLightboxShell() {
    return body.querySelector(".wroom-layout-lightbox");
  }

  function updateLightboxTabSlider() {
    var tablist = body.querySelector(".wroom-layout-lightbox__tabs");
    if (!tablist) return;
    var slider = tablist.querySelector(".dataviz-tab-slider");
    var active = tablist.querySelector(".dataviz-tab--active");
    if (slider && active) {
      tablist.style.setProperty("--tab-slider-left", active.offsetLeft + "px");
      tablist.style.setProperty("--tab-slider-width", active.offsetWidth + "px");
    }
  }

  function showLightboxLayout(key) {
    if (ORDER.indexOf(key) < 0) return;

    body.querySelectorAll(".wroom-layout-lightbox__panel").forEach(function (panel) {
      var isActive = panel.getAttribute("data-wroom-layout") === key;
      panel.classList.toggle("wroom-layout-lightbox__panel--active", isActive);
      panel.hidden = !isActive;
    });

    body.querySelectorAll(".wroom-layout-lightbox__tabs [role='tab']").forEach(function (tab) {
      var isActive = tab.getAttribute("data-wroom-layout") === key;
      tab.classList.toggle("dataviz-tab--active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    updateLightboxTabSlider();
    requestAnimationFrame(updateScale);
  }

  function updateScale() {
    if (!lightbox.classList.contains("is-open")) return;
    var activePanel = body.querySelector(".wroom-layout-lightbox__panel--active");
    if (!activePanel) return;
    var wrap = activePanel.querySelector(".ia-lightbox__scale-wrap");
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

    var bw = activePanel.clientWidth;
    var bh = activePanel.clientHeight;
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
      var s = Math.min(bw / cw, bh / ch, 1);
      clone.style.transformOrigin = "center center";
      clone.style.transform = "scale(" + s + ")";
    }
  }

  function openLightbox() {
    body.innerHTML = "";

    var shell = document.createElement("div");
    shell.className = "wroom-layout-lightbox";

    var panelsEl = document.createElement("div");
    panelsEl.className = "wroom-layout-lightbox__panels";

    ORDER.forEach(function (key) {
      var sourcePanel = carousel.querySelector('.wroom-layout-carousel__panel[data-wroom-layout="' + key + '"]');
      var source = sourcePanel && sourcePanel.querySelector(".wroom-workflow-diagram");
      if (!source) return;

      var panel = document.createElement("div");
      panel.className = "wroom-layout-lightbox__panel";
      panel.setAttribute("data-wroom-layout", key);
      panel.hidden = true;

      var wrap = document.createElement("div");
      wrap.className = "ia-lightbox__scale-wrap";
      wrap.appendChild(cloneDiagram(source));
      panel.appendChild(wrap);
      panelsEl.appendChild(panel);
    });

    var toolbar = document.createElement("div");
    toolbar.className = "wroom-layout-lightbox__toolbar";

    var tablist = document.createElement("div");
    tablist.className = "wroom-layout-lightbox__tabs dataviz-tabs";
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "Layout workflow views");

    var slider = document.createElement("span");
    slider.className = "dataviz-tab-slider";
    slider.setAttribute("aria-hidden", "true");
    tablist.appendChild(slider);

    ORDER.forEach(function (key) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "dataviz-tab";
      tab.setAttribute("role", "tab");
      tab.setAttribute("data-wroom-layout", key);
      tab.setAttribute("aria-selected", "false");
      tab.textContent = TAB_LABELS[key];
      tab.addEventListener("click", function () {
        showLightboxLayout(key);
      });
      tablist.appendChild(tab);
    });

    toolbar.appendChild(tablist);
    shell.appendChild(panelsEl);
    shell.appendChild(toolbar);
    body.appendChild(shell);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    showLightboxLayout(getActiveLayoutKey());
    window.addEventListener("resize", updateScale);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    window.removeEventListener("resize", updateScale);
    body.innerHTML = "";
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
      closeLightbox();
    }
  });
})();

// Wroom layout workflow: Adapter / Scene / Shot tabs
(function () {
  var root = document.getElementById("wroom-layout-carousel");
  if (!root) return;

  var ORDER = ["adapter", "scene", "shot"];
  var tablist = root.querySelector('[role="tablist"]');
  var tabs = tablist.querySelectorAll('[role="tab"]');
  var slider = tablist.querySelector(".dataviz-tab-slider");
  var panels = {};
  var currentKey = ORDER[0];

  ORDER.forEach(function (key) {
    panels[key] = root.querySelector('[data-wroom-layout="' + key + '"]');
  });

  function updateTabSlider() {
    if (!slider) return;
    var active = tablist.querySelector(".dataviz-tab--active");
    if (active) {
      tablist.style.setProperty("--tab-slider-left", active.offsetLeft + "px");
      tablist.style.setProperty("--tab-slider-width", active.offsetWidth + "px");
    }
  }

  function showLayout(key) {
    if (ORDER.indexOf(key) < 0) return;
    currentKey = key;

    ORDER.forEach(function (k) {
      var panel = panels[k];
      var isActive = k === key;
      if (!panel) return;
      panel.classList.toggle("wroom-layout-carousel__panel--active", isActive);
      panel.hidden = !isActive;
    });

    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-wroom-layout") === key;
      tab.classList.toggle("dataviz-tab--active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    updateTabSlider();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      showLayout(tab.getAttribute("data-wroom-layout"));
    });
  });

  window.addEventListener("resize", updateTabSlider);
  requestAnimationFrame(function () {
    updateTabSlider();
    showLayout(ORDER[0]);
  });
})();

// Design System thumbnail: "View full diagram" opens lightbox (no dissolve animation)
(function () {
  var openBtn = document.querySelector(".js-ds-thumbnail-open");
  var lightbox = document.getElementById("ds-lightbox");
  var body = lightbox && lightbox.querySelector(".ia-lightbox__body");
  var source = document.getElementById("ds-thumbnail-diagram");
  var closeBtns = document.querySelectorAll(".js-ds-lightbox-close");

  if (!openBtn || !lightbox || !body || !source) return;

  function updateScale() {
    if (!lightbox.classList.contains("is-open")) return;
    var wrap = body.querySelector(".ia-lightbox__scale-wrap");
    if (!wrap) return;
    var clone = wrap.firstElementChild;
    if (clone) {
      var tabsEl = clone.querySelector(".viewport-toggle__tabs");
      var activeTab = tabsEl && tabsEl.querySelector(".viewport-toggle__tab--active");
      if (tabsEl && activeTab) {
        tabsEl.style.setProperty("--tab-slider-left", activeTab.offsetLeft + "px");
        tabsEl.style.setProperty("--tab-slider-width", activeTab.offsetWidth + "px");
      }
    }
    var bw = body.clientWidth;
    var bh = body.clientHeight;
    var cw = wrap.offsetWidth;
    var ch = wrap.offsetHeight;
    if (cw > 0 && ch > 0) {
      // Clamp to 1 so the diagram never gets upscaled past its natural size.
      var s = Math.min(bw / cw, bh / ch, 1);
      wrap.style.transform = "scale(" + s + ")";
    }
  }

  function openLightbox() {
    body.innerHTML = "";
    var clone = source.cloneNode(true);
    clone.id = "";
    var wrap = document.createElement("div");
    wrap.className = "ia-lightbox__scale-wrap";
    wrap.appendChild(clone);
    body.appendChild(wrap);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(updateScale);
    window.addEventListener("resize", updateScale);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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
      closeLightbox();
    }
  });
})();

// Viewport toggle: 02 Dashboard — Large / Medium / Small (thumbnail + lightbox)
(function () {
  var VIEWPORT_ORDER = ["large", "medium", "small"];
  var autoIntervalId = null;

  function updateTabSlider(toggle) {
    var tabsEl = toggle && toggle.querySelector(".viewport-toggle__tabs");
    var active = tabsEl && tabsEl.querySelector(".viewport-toggle__tab--active");
    if (tabsEl && active) {
      tabsEl.style.setProperty("--tab-slider-left", active.offsetLeft + "px");
      tabsEl.style.setProperty("--tab-slider-width", active.offsetWidth + "px");
    }
  }

  function switchToViewport(toggle, viewport) {
    var panes = toggle.querySelectorAll(".viewport-toggle__pane");
    var tabs = toggle.querySelectorAll(".viewport-toggle__tab");
    panes.forEach(function (p) {
      p.classList.toggle("viewport-toggle__pane--active", p.getAttribute("data-viewport") === viewport);
    });
    tabs.forEach(function (t) {
      t.classList.toggle("viewport-toggle__tab--active", t.getAttribute("data-viewport") === viewport);
      t.setAttribute("aria-selected", t.getAttribute("data-viewport") === viewport ? "true" : "false");
    });
    updateTabSlider(toggle);
  }

  function getNextViewport(toggle) {
    var active = toggle.querySelector(".viewport-toggle__tab--active");
    var current = active ? active.getAttribute("data-viewport") : "large";
    var idx = VIEWPORT_ORDER.indexOf(current);
    if (idx < 0) idx = 0;
    return VIEWPORT_ORDER[(idx + 1) % VIEWPORT_ORDER.length];
  }

  function stopAutoRotate() {
    if (autoIntervalId) {
      clearInterval(autoIntervalId);
      autoIntervalId = null;
    }
  }

  // 每 2 秒自動切到下一項，第四次換到 large 時停止（多跑一輪）
  var toggle = document.getElementById("ds-thumbnail-diagram");
  var largeCount = 0;
  if (toggle) {
    requestAnimationFrame(function () {
      updateTabSlider(toggle);
    });
    autoIntervalId = setInterval(function () {
      var next = getNextViewport(toggle);
      switchToViewport(toggle, next);
      if (next === "large") {
        largeCount += 1;
        if (largeCount >= 3) {
          stopAutoRotate();
        }
      }
    }, 2000);
  }

  document.addEventListener("click", function (e) {
    var tab = e.target && e.target.closest(".viewport-toggle__tab");
    if (!tab) return;
    var viewport = tab.getAttribute("data-viewport");
    if (!viewport) return;
    var toggle = tab.closest(".viewport-toggle");
    if (!toggle) return;
    e.preventDefault();
    stopAutoRotate();
    switchToViewport(toggle, viewport);
  });
})();

// Structure thumbnail: scroll 到才開始，items 由上到下 dissolve（約 2 秒內全出現）
(function () {
  var guide = document.querySelector(".ia-guide");
  if (!guide) return;

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

// Nav thumbnail (design impact): scroll 到後 1 秒，圖 dissolve 成 solid fill 色塊
(function () {
  var blocks = document.querySelectorAll(".js-nav-thumbnail-dissolve");
  if (!blocks.length) return;

  var delayMs = 1000;

  blocks.forEach(function (block) {
    var timer = null;

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
  });
})();

// Marker underline: 進入 viewport 時觸發底線動畫（只觸發一次）
(function () {
  var markers = document.querySelectorAll(".marker-underline");
  if (!markers.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.3 }
  );

  markers.forEach(function (el) {
    observer.observe(el);
  });
})();

// Marker highlight: draw underline left-to-right when scrolling into view
(function () {
  var highlights = document.querySelectorAll(".marker-highlight");
  if (!highlights.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -80px 0px", threshold: 0.2 }
  );

  highlights.forEach(function (el) {
    observer.observe(el);
  });
})();

// Dataviz gallery: toggle between Healthy / Test failing (viewport-width style + auto-rotate)
(function () {
  var tablist = document.querySelector(".dataviz-tabs");
  if (!tablist) return;

  // Clone each row-track for infinite scroll animation (insight section only)
  var scrollWrappers = document.querySelectorAll(".case-section .impact-item--insight .dataviz-gallery__scroll");
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

  var tabs = tablist.querySelectorAll(".dataviz-tab");
  var panels = document.querySelectorAll(".dataviz-pane");
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

  // Auto-rotate every 6s, stop when landing on "failing" the 2nd time (最後停在 Test failing)
  var failingCount = 0;
  if (tablist) {
    requestAnimationFrame(updateTabSlider);
    autoIntervalId = setInterval(function () {
      var next = getNextDataviz();
      var panelId = next === "healthy" ? "dataviz-panel-healthy" : "dataviz-panel-failing";
      showPanel(panelId);
      if (next === "failing") {
        failingCount += 1;
        if (failingCount >= 3) {
          stopAutoRotate();
        }
      }
    }, 6000);
  }

  tabs = tablist.querySelectorAll(".dataviz-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      stopAutoRotate();
      var id = tab.getAttribute("aria-controls");
      if (id) showPanel(id);
    });
  });

  // keyboard: arrow keys
  tablist.addEventListener("keydown", function (e) {
    var idx = Array.prototype.indexOf.call(tabs, document.activeElement);
    if (idx < 0) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      stopAutoRotate();
      var next = tabs[(idx - 1 + tabs.length) % tabs.length];
      next.focus();
      showPanel(next.getAttribute("aria-controls"));
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      stopAutoRotate();
      var next = tabs[(idx + 1) % tabs.length];
      next.focus();
      showPanel(next.getAttribute("aria-controls"));
    }
  });
})();

// Status color system: wipe-in each line chart when its row scrolls into view
(function () {
  var rows = document.querySelectorAll("#status-color-system .color-swatch-group:has(.color-swatch-group__chart-inline)");
  if (!rows.length) return;

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

// Top failing cards: progress bar + % count-up only after scrolling into view
(function () {
  var container = document.querySelector(".top-failing-cards");
  if (!container) return;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function parsePct(el) {
    var m = el.textContent.trim().match(/^(\d+)%$/);
    return m ? parseInt(m[1], 10) : null;
  }

  function runCountUp() {
    var spans = container.querySelectorAll(".top-failing-card__pct");
    spans.forEach(function (el) {
      var target = parsePct(el);
      if (target === null) return;

      if (prefersReduced) {
        return;
      }

      el.textContent = "0%";
      var start = performance.now();
      var duration = 1700;

      function easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
      }

      function tick(now) {
        var t = Math.min(1, (now - start) / duration);
        var val = Math.round(easeOutQuad(t) * target);
        el.textContent = val + "%";
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target + "%";
        }
      }

      requestAnimationFrame(tick);
    });
  }

  function onEnterView() {
    container.classList.add("is-in-view");
    runCountUp();
  }

  if (prefersReduced) {
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        onEnterView();
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  observer.observe(container);
})();

// Problem context gallery: open full-size image in lightbox
(function () {
  var lightbox = document.getElementById("problem-context-lightbox");
  if (!lightbox) return;

  var imgEl = lightbox.querySelector(".js-problem-context-lightbox-img");
  var openBtns = document.querySelectorAll(".js-problem-context-open");
  var closeEls = document.querySelectorAll(".js-problem-context-lightbox-close");

  // Guardrail: never let the lightbox display the bitmap larger than its
  // intrinsic pixel size. Otherwise small (e.g. 1024px wide) PNGs get
  // upscaled by CSS to ~1300+ CSS px and look soft on Retina displays.
  function viewportBudget() {
    var styles = getComputedStyle(lightbox);
    var padX = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
    var padY = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
    return {
      w: Math.max(0, window.innerWidth - padX),
      h: Math.max(0, window.innerHeight - padY),
    };
  }

  function applySizeGuards() {
    if (!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return;
    var cap = viewportBudget();
    imgEl.style.maxWidth = Math.min(imgEl.naturalWidth, cap.w) + "px";
    imgEl.style.maxHeight = Math.min(imgEl.naturalHeight, cap.h) + "px";
  }

  function clearSizeGuards() {
    if (!imgEl) return;
    imgEl.style.maxWidth = "";
    imgEl.style.maxHeight = "";
  }

  function onResize() {
    if (lightbox.classList.contains("is-open")) applySizeGuards();
  }

  function openLightbox(src, alt) {
    if (!imgEl) return;
    clearSizeGuards();
    imgEl.src = src;
    imgEl.alt = alt || "";
    if (typeof imgEl.decode === "function") {
      imgEl.decode().then(applySizeGuards, applySizeGuards);
    } else if (imgEl.complete) {
      applySizeGuards();
    } else {
      imgEl.addEventListener("load", applySizeGuards, { once: true });
    }
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (imgEl) {
      imgEl.removeAttribute("src");
      imgEl.alt = "";
      clearSizeGuards();
    }
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-full-src");
      if (!src) return;
      var innerImg = btn.querySelector("img");
      var alt = innerImg ? innerImg.getAttribute("alt") || "" : "";
      openLightbox(src, alt);
    });
  });

  closeEls.forEach(function (el) {
    el.addEventListener("click", function () {
      closeLightbox();
    });
  });

  window.addEventListener("resize", onResize);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
})();

// §3 static hierarchy: screenshot enlarges in accessible dialog (focus return, Escape)
(function () {
  var openBtn = document.querySelector(".js-case-ia-static-screenshot-open");
  var lightbox = document.querySelector(".js-case-static-screenshot-lightbox");
  if (!openBtn || !lightbox) return;

  var imgEl = lightbox.querySelector(".js-case-static-screenshot-lightbox-img");
  var closeEls = lightbox.querySelectorAll(".js-case-static-screenshot-lightbox-close");
  var closeBtn = lightbox.querySelector(".case-static-screenshot-lightbox__close");
  var lastFocus = null;
  var trapHandler = null;

  function focusablesInDialog() {
    return closeBtn ? [closeBtn] : [];
  }

  function openLightbox() {
    if (!imgEl) return;
    var srcImg =
      openBtn.querySelector(".js-case-static-screenshot-layer.is-active") || openBtn.querySelector("img");
    if (!srcImg) return;
    lastFocus = document.activeElement;
    imgEl.src = srcImg.getAttribute("src") || "";
    imgEl.alt = srcImg.getAttribute("alt") || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";

    requestAnimationFrame(function () {
      if (closeBtn) closeBtn.focus();
    });

    trapHandler = function (e) {
      if (e.key !== "Tab") return;
      var list = focusablesInDialog();
      if (list.length === 0) return;
      /* 僅 Close 可聚焦時須扣住 Tab，否則焦點會回到頁面主內容 */
      if (list.length === 1) {
        e.preventDefault();
        list[0].focus();
        return;
      }
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    lightbox.addEventListener("keydown", trapHandler);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (imgEl) {
      imgEl.removeAttribute("src");
      imgEl.alt = "";
    }
    if (trapHandler) {
      lightbox.removeEventListener("keydown", trapHandler);
      trapHandler = null;
    }
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  openBtn.addEventListener("click", function () {
    if (!lightbox.classList.contains("is-open")) openLightbox();
  });

  closeEls.forEach(function (el) {
    el.addEventListener("click", function () {
      closeLightbox();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
      e.preventDefault();
      closeLightbox();
    }
  });
})();

// IA naming pills: scatter + drift; diagram tabs — Original concepts from PMs / Establishing hierarchy
(function () {
  var diagram = document.querySelector(".js-case-ia-diagram");
  var root = diagram && diagram.querySelector(".case-ia-pills-cloud");
  if (!diagram || !root) return;

  var HIER_ORDER = ["Global setting", "Workspace", "Dashboard", "Test run", "Test case"];
  var HIER_SUBPILL_LABELS = ["Organization", "Team", "Project", "Test run", "Test case"];
  var PILL_ROWS_CLASS = "case-ia-hierarchy-pill-rows";
  var R1_CLASS = "case-ia-hierarchy-pill-rows__r1";
  var R2_CLASS = "case-ia-hierarchy-pill-rows__r2";
  var SEP_CLASS = "case-ia-hierarchy-sep";

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var maxDriftPx = 5;
  /** Min edge-to-edge gap when placing pills so ±maxDriftPx transform never overlaps (≥ 2× drift). */
  var layoutClearance = 12;
  var states = [];
  var rafId = null;
  var t0 = 0;
  var laidOut = false;
  var resizeTimer = null;
  var panelVisible = false;
  var currentView = "original";
  var hierarchyDomReady = false;
  var hierarchyBusy = false;
  var hierarchyCommitDone = false;
  var iaAutoIntervalId = null;
  var iaHierarchyStopCount = 0;

  var originalOrder = Array.from(root.querySelectorAll(".case-ia-pills-cloud__pill"));
  var hierarchyFoot = diagram.querySelector(".case-ia-hierarchy-foot");

  function pillNodes() {
    return root.querySelectorAll(".case-ia-pills-cloud__pill");
  }

  function getDiagramView() {
    return diagram.getAttribute("data-ia-view") || "original";
  }

  function corePillsInOrder() {
    var map = {};
    pillNodes().forEach(function (p) {
      if (p.getAttribute("data-case-ia") === "core") {
        map[p.textContent.trim()] = p;
      }
    });
    return HIER_ORDER.map(function (label) {
      return map[label];
    }).filter(Boolean);
  }

  function extraPills() {
    return Array.from(pillNodes()).filter(function (p) {
      return p.getAttribute("data-case-ia") === "extra";
    });
  }

  function removeHierarchySeparators() {
    root.querySelectorAll("." + SEP_CLASS).forEach(function (n) {
      n.remove();
    });
  }

  function removeHierarchyPillRows() {
    var wrap = root.querySelector("." + PILL_ROWS_CLASS);
    if (!wrap) return;
    wrap.querySelectorAll(".case-ia-pills-cloud__pill").forEach(function (p) {
      root.appendChild(p);
    });
    wrap.remove();
  }

  function appendHierarchySep(parent, isSubrow) {
    var sep = document.createElement("span");
    sep.className = SEP_CLASS + (isSubrow ? " case-ia-hierarchy-sep--subrow" : "");
    sep.setAttribute("aria-hidden", "true");
    sep.textContent = "\u203a";
    parent.appendChild(sep);
  }

  function pillByLabel(label) {
    var found = null;
    pillNodes().forEach(function (p) {
      if (p.textContent.trim() === label) {
        found = p;
      }
    });
    return found;
  }

  function clearIaHierarchyBrackets() {
    if (diagram) {
      diagram.classList.remove("case-ia-diagram--hierarchy-carets-shown");
      diagram.classList.remove("case-ia-diagram--hierarchy-pills-arrows");
      diagram.classList.remove("case-ia-diagram--hierarchy-subpills-visible");
    }
    if (!hierarchyFoot) return;
    hierarchyFoot.classList.remove("case-ia-hierarchy-foot--brackets-visible");
    var groupsEl = hierarchyFoot.querySelector(".case-ia-hierarchy-foot__groups");
    var gSvc = hierarchyFoot.querySelector(".case-ia-hierarchy-group--wide");
    var gOss = hierarchyFoot.querySelector(".case-ia-hierarchy-group--narrow");
    [gSvc, gOss].forEach(function (g) {
      if (!g) return;
      g.style.position = "";
      g.style.left = "";
      g.style.top = "";
      g.style.width = "";
      g.style.boxSizing = "";
    });
    if (groupsEl) {
      groupsEl.style.minHeight = "";
    }
  }

  function scheduleSyncIaHierarchyBrackets() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        syncIaHierarchyBrackets();
      });
    });
  }

  /** Bracket 區淡入完成後：每顆 core pill 下方箭頭動畫 */
  function scheduleHierarchyPillArrowsAfterBrackets() {
    var ARROW_CLASS = "case-ia-diagram--hierarchy-pills-arrows";
    function addArrows() {
      if (getDiagramView() !== "hierarchy" || !hierarchyFoot) return;
      if (!hierarchyFoot.classList.contains("case-ia-hierarchy-foot--brackets-visible")) return;
      diagram.classList.add(ARROW_CLASS);
      /* 晚於單次 0.5s wipe，再淡入第二排，避免與箭頭 animation 重疊造成重算閃爍 */
      var subMs = reduced ? 100 : 560;
      setTimeout(function () {
        if (getDiagramView() !== "hierarchy" || !hierarchyFoot) return;
        if (!hierarchyFoot.classList.contains("case-ia-hierarchy-foot--brackets-visible")) return;
        diagram.classList.add("case-ia-diagram--hierarchy-subpills-visible");
      }, subMs);
    }
    if (reduced) {
      requestAnimationFrame(function () {
        addArrows();
      });
      return;
    }
    var fired = false;
    function tryAdd() {
      if (fired) return;
      fired = true;
      if (hierarchyFoot) {
        hierarchyFoot.removeEventListener("transitionend", onFootTe);
      }
      addArrows();
    }
    function onFootTe(ev) {
      if (!hierarchyFoot || ev.target !== hierarchyFoot) return;
      if (ev.propertyName !== "opacity") return;
      tryAdd();
    }
    hierarchyFoot.addEventListener("transitionend", onFootTe);
    setTimeout(tryAdd, 450);
  }

  /** Pill FLIP 完成後：對齊 bracket，再淡入 foot */
  function revealHierarchyFootAfterPillsSettled() {
    if (getDiagramView() !== "hierarchy" || !hierarchyFoot) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (getDiagramView() !== "hierarchy" || !hierarchyFoot) return;
        diagram.classList.add("case-ia-diagram--hierarchy-carets-shown");
        void root.offsetHeight;
        syncIaHierarchyBrackets();
        hierarchyFoot.classList.add("case-ia-hierarchy-foot--brackets-visible");
        updateAriaPanels();
        scheduleHierarchyPillArrowsAfterBrackets();
      });
    });
  }

  /** 左欄括號對齊 Global setting 左緣—Dashboard 右緣；From open-source 對齊 Test run—Test case */
  function syncIaHierarchyBrackets() {
    if (!hierarchyFoot || getDiagramView() !== "hierarchy") return;
    var groupsEl = hierarchyFoot.querySelector(".case-ia-hierarchy-foot__groups");
    var gSvc = hierarchyFoot.querySelector(".case-ia-hierarchy-group--wide");
    var gOss = hierarchyFoot.querySelector(".case-ia-hierarchy-group--narrow");
    if (!groupsEl || !gSvc || !gOss) return;

    var gs = pillByLabel("Global setting");
    var dash = pillByLabel("Dashboard");
    var tr = pillByLabel("Test run");
    var tc = pillByLabel("Test case");
    if (!gs || !dash || !tr || !tc) return;

    var gr = groupsEl.getBoundingClientRect();
    if (gr.width < 8) return;

    var gl = gs.getBoundingClientRect();
    var dr = dash.getBoundingClientRect();
    var trr = tr.getBoundingClientRect();
    var tcr = tc.getBoundingClientRect();

    var leftSvc = gl.left - gr.left;
    var widthSvc = dr.right - gl.left;
    var leftOss = trr.left - gr.left;
    var widthOss = tcr.right - trr.left;

    gSvc.style.position = "absolute";
    gSvc.style.top = "0";
    gSvc.style.left = Math.round(leftSvc) + "px";
    gSvc.style.width = Math.max(0, Math.round(widthSvc)) + "px";
    gSvc.style.boxSizing = "border-box";

    gOss.style.position = "absolute";
    gOss.style.top = "0";
    gOss.style.left = Math.round(leftOss) + "px";
    gOss.style.width = Math.max(0, Math.round(widthOss)) + "px";
    gOss.style.boxSizing = "border-box";

    var h = Math.max(gSvc.offsetHeight || 0, gOss.offsetHeight || 0);
    if (h > 0) {
      groupsEl.style.minHeight = h + "px";
    }
  }

  function buildHierarchyDom() {
    removeHierarchySeparators();
    removeHierarchyPillRows();
    var ordered = corePillsInOrder();
    if (ordered.length !== HIER_ORDER.length) return;
    if (hierarchyFoot) {
      root.appendChild(hierarchyFoot);
    }
    var rows = document.createElement("div");
    rows.className = PILL_ROWS_CLASS;
    rows.setAttribute("aria-hidden", "true");
    var r1 = document.createElement("div");
    r1.className = R1_CLASS;
    var r2 = document.createElement("div");
    r2.className = R2_CLASS;
    rows.appendChild(r1);
    rows.appendChild(r2);
    ordered.forEach(function (pill, i) {
      r1.appendChild(pill);
      if (i < ordered.length - 1) {
        appendHierarchySep(r1, false);
      }
    });
    HIER_SUBPILL_LABELS.forEach(function (label, i) {
      var s = document.createElement("span");
      s.className = "ia-main-pill case-ia-hierarchy-subpill";
      s.textContent = label;
      r2.appendChild(s);
      if (i < HIER_SUBPILL_LABELS.length - 1) {
        appendHierarchySep(r2, true);
      }
    });
    root.appendChild(rows);
  }

  function restoreOriginalDom() {
    removeHierarchySeparators();
    removeHierarchyPillRows();
    originalOrder.forEach(function (el) {
      root.appendChild(el);
    });
    if (hierarchyFoot) {
      root.appendChild(hierarchyFoot);
    }
    hierarchyDomReady = false;
  }

  function updateTabSlider() {
    var tabsEl = diagram.querySelector(".case-ia-diagram__tabs");
    var active = tabsEl && tabsEl.querySelector(".dataviz-tab--active");
    if (tabsEl && active) {
      tabsEl.style.setProperty("--tab-slider-left", active.offsetLeft + "px");
      tabsEl.style.setProperty("--tab-slider-width", active.offsetWidth + "px");
    }
  }

  function updateTabsUi() {
    diagram.querySelectorAll(".case-ia-diagram__tabs .dataviz-tab").forEach(function (t) {
      var on = t.getAttribute("data-ia-view") === currentView;
      t.classList.toggle("dataviz-tab--active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    requestAnimationFrame(updateTabSlider);
  }

  function updateAriaPanels() {
    var v = currentView;
    if (hierarchyFoot) {
      var footShown =
        v === "hierarchy" && hierarchyFoot.classList.contains("case-ia-hierarchy-foot--brackets-visible");
      hierarchyFoot.setAttribute("aria-hidden", footShown ? "false" : "true");
    }
    if (v === "hierarchy") {
      root.setAttribute(
        "aria-label",
        "Defined hierarchy — New levels to be added across Global setting, Workspace, and Dashboard; Test run and Test case from open-source"
      );
    } else {
      root.setAttribute(
        "aria-label",
        "Product language before alignment — overlapping terms shown as scattered labels"
      );
    }
  }

  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function innerSize() {
    var cs = getComputedStyle(root);
    var pl = parseFloat(cs.paddingLeft) || 0;
    var pr = parseFloat(cs.paddingRight) || 0;
    var pt = parseFloat(cs.paddingTop) || 0;
    var pb = parseFloat(cs.paddingBottom) || 0;
    return {
      w: Math.max(0, root.clientWidth - pl - pr),
      h: Math.max(0, root.clientHeight - pt - pb),
    };
  }

  /** Inflated AABB overlap (each pill grown by layoutClearance/2 per side). */
  function inflatedOverlap(a, b) {
    var g = layoutClearance * 0.5;
    var ax1 = a.x - g;
    var ay1 = a.y - g;
    var ax2 = a.x + a.w + g;
    var ay2 = a.y + a.h + g;
    var bx1 = b.x - g;
    var by1 = b.y - g;
    var bx2 = b.x + b.w + g;
    var by2 = b.y + b.h + g;
    var ox = Math.min(ax2, bx2) - Math.max(ax1, bx1);
    var oy = Math.min(ay2, by2) - Math.max(ay1, by1);
    return ox > 0 && oy > 0;
  }

  function rawOverlapDepth(a, b) {
    var ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    var oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return { ox: ox, oy: oy, hit: ox > 0 && oy > 0 };
  }

  function measurePills() {
    states.length = 0;
    pillNodes().forEach(function (pill) {
      var r = pill.getBoundingClientRect();
      states.push({
        el: pill,
        x: 0,
        y: 0,
        w: Math.max(1, Math.round(r.width)),
        h: Math.max(1, Math.round(r.height)),
        baseX: 0,
        baseY: 0,
        f1x: rnd(0.00085, 0.002),
        f2x: rnd(0.00085, 0.002),
        p1x: rnd(0, Math.PI * 2),
        p2x: rnd(0, Math.PI * 2),
        f1y: rnd(0.00085, 0.002),
        f2y: rnd(0.00085, 0.002),
        p1y: rnd(0, Math.PI * 2),
        p2y: rnd(0, Math.PI * 2),
      });
    });
  }

  function clampAll(inner) {
    states.forEach(function (s) {
      s.x = clamp(s.x, 0, Math.max(0, inner.w - s.w));
      s.y = clamp(s.y, 0, Math.max(0, inner.h - s.h));
    });
  }

  /** One separation pass: resolve raw AABB overlap along shallow axis with full penetration + gap. */
  function separatePass(inner) {
    var moved = false;
    var i;
    var j;
    for (i = 0; i < states.length; i++) {
      for (j = i + 1; j < states.length; j++) {
        var a = states[i];
        var b = states[j];
        var pen = rawOverlapDepth(a, b);
        if (!pen.hit) continue;
        var ox = pen.ox;
        var oy = pen.oy;
        var extra = layoutClearance * 0.5;
        var half;
        if (ox < oy) {
          half = ox * 0.5 + extra;
          if (a.x + a.w * 0.5 <= b.x + b.w * 0.5) {
            a.x -= half;
            b.x += half;
          } else {
            a.x += half;
            b.x -= half;
          }
        } else {
          half = oy * 0.5 + extra;
          if (a.y + a.h * 0.5 <= b.y + b.h * 0.5) {
            a.y -= half;
            b.y += half;
          } else {
            a.y += half;
            b.y -= half;
          }
        }
        moved = true;
      }
    }
    clampAll(inner);
    return moved;
  }

  function separateMany(inner, maxPasses) {
    var k;
    for (k = 0; k < maxPasses; k++) {
      if (!separatePass(inner)) break;
    }
  }

  function anyInflatedOverlap() {
    var i;
    var j;
    for (i = 0; i < states.length; i++) {
      for (j = i + 1; j < states.length; j++) {
        if (inflatedOverlap(states[i], states[j])) return true;
      }
    }
    return false;
  }

  function applyBasePositions() {
    states.forEach(function (s) {
      s.el.style.left = Math.round(s.baseX) + "px";
      s.el.style.top = Math.round(s.baseY) + "px";
      s.el.style.transform = "translate3d(0,0,0)";
    });
  }

  function shuffleOrder(arr) {
    var i = arr.length;
    var j;
    var t;
    while (i > 1) {
      i -= 1;
      j = Math.floor(Math.random() * (i + 1));
      t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  /** Random order, random (x,y) per pill — no reference layout; rejects overlaps. */
  function layoutRandomNonOverlapping(inner) {
    var order = shuffleOrder(states.slice());
    var placed = [];
    var maxAttempts = 1500;
    var step = 4;
    var si;
    for (si = 0; si < order.length; si++) {
      var s = order[si];
      var placedOk = false;
      var attempt;
      for (attempt = 0; attempt < maxAttempts && !placedOk; attempt++) {
        s.x = rnd(0, Math.max(0, inner.w - s.w));
        s.y = rnd(0, Math.max(0, inner.h - s.h));
        var k;
        var clash = false;
        for (k = 0; k < placed.length; k++) {
          if (inflatedOverlap(s, placed[k])) {
            clash = true;
            break;
          }
        }
        if (!clash) placedOk = true;
      }
      if (!placedOk) {
        var sx;
        var sy;
        outer: for (sy = 0; sy <= Math.max(0, inner.h - s.h); sy += step) {
          for (sx = 0; sx <= Math.max(0, inner.w - s.w); sx += step) {
            s.x = sx;
            s.y = sy;
            var k2;
            var clash2 = false;
            for (k2 = 0; k2 < placed.length; k2++) {
              if (inflatedOverlap(s, placed[k2])) {
                clash2 = true;
                break;
              }
            }
            if (!clash2) {
              placedOk = true;
              break outer;
            }
          }
        }
      }
      if (!placedOk) {
        return false;
      }
      placed.push(s);
    }
    return true;
  }

  function layoutGridFallback(inner) {
    var y = 0;
    states.forEach(function (s) {
      s.x = clamp(rnd(0, Math.max(0, inner.w - s.w)), 0, Math.max(0, inner.w - s.w));
      s.y = y;
      y += s.h + layoutClearance;
    });
    clampAll(inner);
    separateMany(inner, 500);
  }

  function layoutOnce() {
    if (getDiagramView() !== "original") return false;
    var inner = innerSize();
    if (inner.w < 40 || inner.h < 40) return false;

    pillNodes().forEach(function (pill) {
      pill.style.left = "0px";
      pill.style.top = "0px";
      pill.style.transform = "";
    });
    void root.offsetHeight;

    measurePills();

    if (!layoutRandomNonOverlapping(inner)) {
      layoutGridFallback(inner);
    }

    separateMany(inner, 320);
    if (anyInflatedOverlap()) {
      layoutGridFallback(inner);
      separateMany(inner, 400);
    }
    var guard = 0;
    while (anyInflatedOverlap() && guard < 5) {
      separateMany(inner, 160);
      guard += 1;
    }

    states.forEach(function (s) {
      s.baseX = s.x;
      s.baseY = s.y;
    });
    applyBasePositions();
    laidOut = true;
    return true;
  }

  function tick(now) {
    var t = now - t0;
    var i;
    for (i = 0; i < states.length; i++) {
      var s = states[i];
      var dx =
        Math.sin(t * s.f1x + s.p1x) * 2.8 + Math.sin(t * s.f2x * 1.63 + s.p2x) * 2.4;
      var dy =
        Math.sin(t * s.f1y + s.p1y) * 2.8 + Math.sin(t * s.f2y * 1.58 + s.p2y) * 2.4;
      dx = clamp(dx, -maxDriftPx, maxDriftPx);
      dy = clamp(dy, -maxDriftPx, maxDriftPx);
      s.el.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (rafId !== null) return;
    if (getDiagramView() !== "original") return;
    t0 = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
    if (laidOut && getDiagramView() === "original") {
      states.forEach(function (s) {
        s.el.style.transform = "translate3d(0,0,0)";
      });
    }
  }

  function stopAndClearWillChange() {
    stop();
    states.forEach(function (s) {
      s.el.style.willChange = "";
    });
  }

  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeTimer = null;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (getDiagramView() === "original") {
        laidOut = false;
        if (!layoutOnce()) return;
        if (!reduced && panelVisible) {
          states.forEach(function (s) {
            s.el.style.willChange = "transform";
          });
          start();
        }
      }
      if (
        getDiagramView() === "hierarchy" &&
        hierarchyFoot &&
        hierarchyFoot.classList.contains("case-ia-hierarchy-foot--brackets-visible")
      ) {
        scheduleSyncIaHierarchyBrackets();
      }
    }, 120);
  }

  function finishFlipCleanup(core) {
    core.forEach(function (p2) {
      p2.style.transition = "";
      p2.style.transform = "";
    });
    hierarchyBusy = false;
    if (getDiagramView() === "hierarchy") {
      revealHierarchyFootAfterPillsSettled();
    }
  }

  function beginHierarchyFromOriginal() {
    if (hierarchyBusy) return;
    if (!laidOut && !layoutOnce()) return;
    hierarchyBusy = true;
    hierarchyCommitDone = false;
    stop();
    states.forEach(function (s) {
      s.el.style.transform = "translate3d(0,0,0)";
    });

    var core = corePillsInOrder();
    var extras = extraPills();
    var cloudRect = root.getBoundingClientRect();

    function rel(el) {
      var r = el.getBoundingClientRect();
      return { left: r.left - cloudRect.left, top: r.top - cloudRect.top };
    }

    var first = core.map(rel);

    function commit() {
      if (currentView !== "hierarchy") {
        hierarchyBusy = false;
        return;
      }
      if (hierarchyFoot) {
        hierarchyFoot.classList.remove("case-ia-hierarchy-foot--brackets-visible");
      }
      diagram.classList.remove("case-ia-diagram--hierarchy-carets-shown");
      diagram.classList.remove("case-ia-diagram--hierarchy-pills-arrows");
      diagram.classList.remove("case-ia-diagram--hierarchy-subpills-visible");
      buildHierarchyDom();
      diagram.setAttribute("data-ia-view", "hierarchy");
      core.forEach(function (p) {
        p.style.left = "";
        p.style.top = "";
        p.style.transform = "";
      });
      void root.offsetHeight;
      /* 先同步 bracket 絕對定位與 foot 高度，再量 last；否則 reveal 時 foot 才從靜態流變 layout 會突變高度、pill 列跳動 */
      syncIaHierarchyBrackets();
      cloudRect = root.getBoundingClientRect();
      var last = core.map(rel);
      hierarchyDomReady = true;

      if (reduced) {
        finishFlipCleanup(core);
        return;
      }

      core.forEach(function (pill, i) {
        var dx = Math.round(first[i].left - last[i].left);
        var dy = Math.round(first[i].top - last[i].top);
        pill.style.transition = "none";
        pill.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
      });
      void root.offsetHeight;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          core.forEach(function (pill) {
            pill.style.transition = "transform 0.55s cubic-bezier(0.25, 0.1, 0.25, 1)";
            pill.style.transform = "translate3d(0,0,0)";
          });
          var done = 0;
          core.forEach(function (pill) {
            function once(e) {
              if (e.propertyName !== "transform") return;
              pill.removeEventListener("transitionend", once);
              done += 1;
              if (done >= core.length) {
                finishFlipCleanup(core);
              }
            }
            pill.addEventListener("transitionend", once);
          });
          setTimeout(function () {
            if (hierarchyBusy) finishFlipCleanup(core);
          }, 900);
        });
      });
    }

    function tryCommit() {
      if (hierarchyCommitDone) return;
      if (currentView !== "hierarchy") {
        extras.forEach(function (p) {
          p.style.transition = "";
          p.style.opacity = "";
        });
        hierarchyBusy = false;
        return;
      }
      hierarchyCommitDone = true;
      extras.forEach(function (p) {
        p.style.transition = "";
        p.style.opacity = "";
      });
      commit();
    }

    if (reduced) {
      hierarchyCommitDone = true;
      commit();
      return;
    }

    extras.forEach(function (p) {
      p.style.transition = "opacity 0.42s ease";
      p.style.opacity = "0";
    });

    var n = 0;
    var total = extras.length;
    if (total === 0) {
      hierarchyCommitDone = true;
      commit();
      return;
    }
    extras.forEach(function (p) {
      function te(ev) {
        if (ev.propertyName !== "opacity") return;
        p.removeEventListener("transitionend", te);
        n += 1;
        if (n >= total) tryCommit();
      }
      p.addEventListener("transitionend", te);
    });
    setTimeout(function () {
      if (n < total) tryCommit();
    }, 520);
  }

  function setView(next) {
    if (next === currentView) return;
    if (hierarchyBusy && next === "hierarchy") return;
    var prev = currentView;
    currentView = next;
    updateTabsUi();

    if (next === "original") {
      hierarchyBusy = false;
      diagram.setAttribute("data-ia-view", "original");
      stopAndClearWillChange();
      clearIaHierarchyBrackets();
      restoreOriginalDom();
      pillNodes().forEach(function (pill) {
        pill.style.left = "";
        pill.style.top = "";
        pill.style.transform = "";
        pill.style.transition = "";
        pill.style.opacity = "";
      });
      laidOut = false;
      if (panelVisible) {
        if (!layoutOnce()) return;
        if (!reduced) {
          states.forEach(function (s) {
            s.el.style.willChange = "transform";
          });
          start();
        }
      }
      updateAriaPanels();
      return;
    }

    stopAndClearWillChange();

    if (next === "hierarchy") {
      beginHierarchyFromOriginal();
    }
    updateAriaPanels();
  }

  function stopIaAutoRotate() {
    if (iaAutoIntervalId) {
      clearInterval(iaAutoIntervalId);
      iaAutoIntervalId = null;
    }
  }

  function getNextIaView() {
    return currentView === "original" ? "hierarchy" : "original";
  }

  /* 與 Insight Status 切換邏輯相同，間隔 4s；第三次切到 hierarchy 後停止（最後停在 Establishing hierarchy） */
  if (!reduced) {
    iaAutoIntervalId = setInterval(function () {
      var next = getNextIaView();
      setView(next);
      if (next === "hierarchy" && currentView === "hierarchy") {
        iaHierarchyStopCount += 1;
        if (iaHierarchyStopCount >= 3) {
          stopIaAutoRotate();
        }
      }
    }, 4000);
  }

  diagram.addEventListener("click", function (e) {
    var tab = e.target && e.target.closest(".case-ia-diagram__tabs .dataviz-tab");
    if (!tab || !diagram.contains(tab)) return;
    var v = tab.getAttribute("data-ia-view");
    if (!v) return;
    e.preventDefault();
    stopIaAutoRotate();
    setView(v);
  });

  requestAnimationFrame(function () {
    updateTabSlider();
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          panelVisible = true;
          if (getDiagramView() === "original") {
            if (!laidOut && !layoutOnce()) return;
            if (!reduced) {
              states.forEach(function (s) {
                s.el.style.willChange = "transform";
              });
              start();
            }
          }
        } else {
          panelVisible = false;
          stopAndClearWillChange();
        }
      });
    },
    { rootMargin: "40px 0px 40px 0px", threshold: 0 }
  );

  observer.observe(diagram);
  window.addEventListener("resize", onResize);
  updateAriaPanels();
})();

// §3 static hierarchy diagram: Side navigation on Project vs Test run — bracket placement + screenshot swap
(function () {
  var root = document.querySelector(".js-case-static-hierarchy-diagram");
  var tablist = root && root.querySelector(".js-case-static-side-nav-tabs");
  var options = root ? root.querySelectorAll(".js-case-static-side-nav-option") : [];
  /** After bracket opacity fades out (~220ms in CSS); then swap layout mid-transition. */
  var BRACKET_LAYOUT_SWAP_MS = 260;

  /** Pair with thumbnails in microsoft-playwright-testing.html (toggle “Side navigation on”). */
  var SCREENSHOT_BY_LEVEL = {
    project: {
      src: "assets/ms-playwright-project-level.png",
      alt:
        "Microsoft Playwright Testing — Employee Portal project dashboard with Project selected in the side navigation",
    },
    "test-run": {
      src: "assets/ms-playwright-test-run-level.png",
      alt:
        "Microsoft Playwright Testing — test run detail for testRunID_001 with Test run selected in the side navigation",
    },
  };

  var screenshotLayers =
    root && root.querySelectorAll(".js-case-static-screenshot-layer[data-static-screenshot-level]");
  var screenshotOpenBtn = root && root.querySelector(".js-case-ia-static-screenshot-open");

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }

  function screenshotTriggerAriaLabel(level) {
    return level === "project"
      ? "Open enlarged screenshot: project-level dashboard view"
      : "Open enlarged screenshot: test run level detail view";
  }

  /** Thumbnail opacity crossfade — independent from bracket grid (see syncBracketGrid). */
  function applyStaticScreenshot(level) {
    var cfg = SCREENSHOT_BY_LEVEL[level];
    if (!cfg || !screenshotLayers || !screenshotLayers.length) return;
    screenshotLayers.forEach(function (img) {
      var lev = img.getAttribute("data-static-screenshot-level");
      var on = lev === level;
      img.classList.toggle("is-active", on);
      img.setAttribute("aria-hidden", on ? "false" : "true");
    });
    if (screenshotOpenBtn) {
      screenshotOpenBtn.setAttribute("aria-label", screenshotTriggerAriaLabel(level));
    }
  }

  function preloadStaticScreenshots() {
    Object.keys(SCREENSHOT_BY_LEVEL).forEach(function (key) {
      var uri = SCREENSHOT_BY_LEVEL[key].src;
      var im = new Image();
      im.src = uri;
    });
  }

  function updateSlider() {
    if (!tablist) return;
    var active = tablist.querySelector(".dataviz-tab--active");
    if (active) {
      tablist.style.setProperty("--tab-slider-left", active.offsetLeft + "px");
      tablist.style.setProperty("--tab-slider-width", active.offsetWidth + "px");
    }
  }

  function syncSideNavRadios(level, focusedEl) {
    options.forEach(function (btn) {
      var on = btn.getAttribute("data-side-nav-level") === level;
      btn.classList.toggle("dataviz-tab--active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.setAttribute("tabindex", on ? "0" : "-1");
    });
    if (focusedEl) focusedEl.focus();
    requestAnimationFrame(updateSlider);
  }

  /** Bracket/grid layout only — thumbnails follow tabs immediately via applyStaticScreenshot. */
  function syncBracketGrid(level) {
    if (!root) return;
    root.setAttribute("data-side-nav-level", level);
  }

  function applySideNavUi(level, focusedEl) {
    syncSideNavRadios(level, focusedEl);
    syncBracketGrid(level);
    applyStaticScreenshot(level);
  }

  function setSideNavLevel(level, focusedEl) {
    if (!root) return;
    var prev = root.getAttribute("data-side-nav-level");
    var nav = root.querySelector(".case-ia-hierarchy-static");
    var reduced = prefersReducedMotion();

    syncSideNavRadios(level, focusedEl);
    applyStaticScreenshot(level);

    if (reduced || !nav || level === prev) {
      syncBracketGrid(level);
      return;
    }

    nav.classList.add("case-ia-hierarchy-static--brackets-hide");
    window.setTimeout(function () {
      syncBracketGrid(level);
      nav.classList.remove("case-ia-hierarchy-static--brackets-hide");
    }, BRACKET_LAYOUT_SWAP_MS);
  }

  if (!root || !tablist || !options.length) return;

  preloadStaticScreenshots();

  var initialLevel = root.getAttribute("data-side-nav-level");
  if (initialLevel) applyStaticScreenshot(initialLevel);

  requestAnimationFrame(updateSlider);
  window.addEventListener(
    "resize",
    function () {
      requestAnimationFrame(updateSlider);
    },
    { passive: true }
  );

  options.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var level = btn.getAttribute("data-side-nav-level");
      if (!level) return;
      setSideNavLevel(level, btn);
    });
  });

  tablist.addEventListener("keydown", function (e) {
    var list = tablist.querySelectorAll(".js-case-static-side-nav-option");
    var idx = Array.prototype.indexOf.call(list, document.activeElement);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      var ni = Math.min(list.length - 1, idx + 1);
      var next = list[ni];
      var lev = next ? next.getAttribute("data-side-nav-level") : null;
      if (lev) setSideNavLevel(lev, next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      var pi = Math.max(0, idx - 1);
      var prev = list[pi];
      var plev = prev ? prev.getAttribute("data-side-nav-level") : null;
      if (plev) setSideNavLevel(plev, prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      var fb = list[0];
      var hlev = fb && fb.getAttribute("data-side-nav-level");
      if (hlev) setSideNavLevel(hlev, fb);
    } else if (e.key === "End") {
      e.preventDefault();
      var lb = list[list.length - 1];
      var elev = lb && lb.getAttribute("data-side-nav-level");
      if (elev) setSideNavLevel(elev, lb);
    } else if (e.key === " " || e.key === "Enter") {
      var cur = document.activeElement;
      if (!cur || !cur.matches(".js-case-static-side-nav-option")) return;
      e.preventDefault();
      var lev = cur.getAttribute("data-side-nav-level");
      if (lev) setSideNavLevel(cur, cur);
    }
  });
})();

// §4 Insights: Dashboard level vs Test run level — dual-layer crossfade + tab slider (mirrors §3 static side-nav pattern)
(function () {
  var root = document.querySelector(".js-case-insight-new");
  var tablist = root && root.querySelector(".js-case-insight-new-tabs");
  var options = root ? root.querySelectorAll(".js-case-insight-new-option") : [];
  var layers = root && root.querySelectorAll(".js-case-insight-new-layer[data-insight-level]");

  function updateSlider() {
    if (!tablist) return;
    var active = tablist.querySelector(".dataviz-tab--active");
    if (active) {
      tablist.style.setProperty("--tab-slider-left", active.offsetLeft + "px");
      tablist.style.setProperty("--tab-slider-width", active.offsetWidth + "px");
    }
  }

  function applyLayers(view) {
    if (!layers || !layers.length) return;
    layers.forEach(function (img) {
      var lev = img.getAttribute("data-insight-level");
      var on = lev === view;
      img.classList.toggle("is-active", on);
      img.setAttribute("aria-hidden", on ? "false" : "true");
    });
  }

  function syncRadios(view, focusedEl) {
    options.forEach(function (btn) {
      var on = btn.getAttribute("data-insight-view") === view;
      btn.classList.toggle("dataviz-tab--active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.setAttribute("tabindex", on ? "0" : "-1");
    });
    if (focusedEl) focusedEl.focus();
    requestAnimationFrame(updateSlider);
  }

  function setInsightView(view, focusedEl) {
    if (!root || !view) return;
    root.setAttribute("data-insight-view", view);
    syncRadios(view, focusedEl);
    applyLayers(view);
  }

  function preloadInsightImages() {
    ["assets/insight-new-dashboard-level.png", "assets/insight-new-test-run-level.png"].forEach(function (uri) {
      var im = new Image();
      im.src = uri;
    });
  }

  if (!root || !tablist || !options.length) return;

  preloadInsightImages();

  var initial = root.getAttribute("data-insight-view") || "dashboard";
  applyLayers(initial);

  requestAnimationFrame(updateSlider);
  window.addEventListener(
    "resize",
    function () {
      requestAnimationFrame(updateSlider);
    },
    { passive: true }
  );

  options.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var view = btn.getAttribute("data-insight-view");
      if (!view) return;
      setInsightView(view, btn);
    });
  });

  tablist.addEventListener("keydown", function (e) {
    var list = tablist.querySelectorAll(".js-case-insight-new-option");
    var idx = Array.prototype.indexOf.call(list, document.activeElement);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      var ni = Math.min(list.length - 1, idx + 1);
      var next = list[ni];
      var v = next && next.getAttribute("data-insight-view");
      if (v) setInsightView(v, next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      var pi = Math.max(0, idx - 1);
      var prev = list[pi];
      var pv = prev && prev.getAttribute("data-insight-view");
      if (pv) setInsightView(pv, prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      var fb = list[0];
      var hv = fb && fb.getAttribute("data-insight-view");
      if (hv) setInsightView(hv, fb);
    } else if (e.key === "End") {
      e.preventDefault();
      var lb = list[list.length - 1];
      var ev = lb && lb.getAttribute("data-insight-view");
      if (ev) setInsightView(ev, lb);
    } else if (e.key === " " || e.key === "Enter") {
      var cur = document.activeElement;
      if (!cur || !cur.matches(".js-case-insight-new-option")) return;
      e.preventDefault();
      var lev = cur.getAttribute("data-insight-view");
      if (lev) setInsightView(lev, cur);
    }
  });
})();

// §5 Fluent widget block: iteration combobox — sets data-selected-iteration on the stack
(function () {
  var root = document.querySelector("[data-iteration-combobox]");
  if (!root) return;
  var stack = root.closest(".case-fluent-widget-stack");
  if (!stack) return;
  var trigger = root.querySelector(".dataviz-combobox__trigger");
  var listbox = root.querySelector('[role="listbox"]');
  var labelEl = root.querySelector(".dataviz-combobox__label");
  var options = Array.prototype.slice.call(root.querySelectorAll('[role="option"]'));
  if (!trigger || !listbox || !options.length) return;

  function listboxOpen() {
    return root.classList.contains("dataviz-combobox--open");
  }

  function openListbox() {
    root.classList.add("dataviz-combobox--open");
    listbox.removeAttribute("hidden");
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeListbox() {
    root.classList.remove("dataviz-combobox--open");
    listbox.setAttribute("hidden", "");
    trigger.setAttribute("aria-expanded", "false");
  }

  function toggleListbox() {
    if (listboxOpen()) closeListbox();
    else openListbox();
  }

  function optionValue(opt) {
    return opt.getAttribute("data-value") || (opt.textContent || "").trim();
  }

  function isFinalDesign(value) {
    return value === "Final design";
  }

  function refreshTriggerIcon() {
    var triggerIcon = labelEl && labelEl.querySelector(".case-iteration-trigger-icon");
    if (!triggerIcon || !labelEl) return;
    var pick = isFinalDesign(stack.getAttribute("data-selected-iteration") || "");
    labelEl.classList.toggle("case-status-label--pick", pick);
    labelEl.classList.toggle("case-status-label--reject", !pick);
    triggerIcon.setAttribute("data-lucide", pick ? "circle-check" : "circle-x");
    if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
      lucide.createIcons();
    }
  }

  function setSelected(value) {
    if (!value) return;
    stack.setAttribute("data-selected-iteration", value);
    var labelTextEl = labelEl && labelEl.querySelector(".dataviz-combobox__label-text");
    if (labelTextEl) labelTextEl.textContent = value;
    else if (labelEl) labelEl.textContent = value;
    options.forEach(function (opt) {
      opt.setAttribute("aria-selected", optionValue(opt) === value ? "true" : "false");
    });
    refreshTriggerIcon();
  }

  function optionIndex(el) {
    return options.indexOf(el);
  }

  function focusOptionAt(index) {
    if (index < 0 || index >= options.length) return;
    options[index].focus();
  }

  var initial = stack.getAttribute("data-selected-iteration") || optionValue(options[0]);
  setSelected(initial);

  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleListbox();
  });

  options.forEach(function (opt) {
    opt.addEventListener("click", function (e) {
      e.stopPropagation();
      var v = optionValue(opt);
      setSelected(v);
      closeListbox();
      trigger.focus();
    });
  });

  function onDocumentDismissPointerDown(e) {
    if (!listboxOpen()) return;
    var t = e.target;
    if (t && typeof t.closest === "function" && t.closest("[data-iteration-combobox]")) return;
    closeListbox();
  }
  document.addEventListener("mousedown", onDocumentDismissPointerDown, true);

  document.addEventListener("keydown", function (e) {
    if (!listboxOpen()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeListbox();
      trigger.focus();
      return;
    }
    var active = document.activeElement;
    if (!active || !root.contains(active)) return;
    var isOpt = active.getAttribute("role") === "option";
    var isTrigger = active === trigger;
    if (e.key === "Enter" && isOpt) {
      e.preventDefault();
      setSelected(optionValue(active));
      closeListbox();
      trigger.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isTrigger) focusOptionAt(0);
      else if (isOpt) {
        var i = optionIndex(active);
        if (i >= 0 && i < options.length - 1) focusOptionAt(i + 1);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isTrigger) focusOptionAt(options.length - 1);
      else if (isOpt) {
        var j = optionIndex(active);
        if (j > 0) focusOptionAt(j - 1);
        else trigger.focus();
      }
      return;
    }
    if (e.key === "Home" && isOpt) {
      e.preventDefault();
      focusOptionAt(0);
      return;
    }
    if (e.key === "End" && isOpt) {
      e.preventDefault();
      focusOptionAt(options.length - 1);
    }
  });

  trigger.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" && !listboxOpen()) {
      e.preventDefault();
      openListbox();
      focusOptionAt(0);
    } else if (e.key === "ArrowUp" && !listboxOpen()) {
      e.preventDefault();
      openListbox();
      focusOptionAt(options.length - 1);
    }
  });
})();

// Wroom case study: hero video tabs + auto-advance on video end
(function () {
  var root = document.getElementById("wroom-hero-carousel");
  if (!root) return;

  var ORDER = ["adapter", "augment", "scenegraph", "shot-exporting"];
  var tablist = root.querySelector('[role="tablist"]');
  var tabs = tablist.querySelectorAll('[role="tab"]');
  var slider = tablist.querySelector(".dataviz-tab-slider");
  var videos = {};
  var currentKey = ORDER[0];

  ORDER.forEach(function (key) {
    videos[key] = root.querySelector('[data-wroom-video="' + key + '"]');
  });

  function updateTabSlider() {
    if (!slider) return;
    var active = tablist.querySelector(".dataviz-tab--active");
    if (active) {
      tablist.style.setProperty("--tab-slider-left", active.offsetLeft + "px");
      tablist.style.setProperty("--tab-slider-width", active.offsetWidth + "px");
    }
  }

  function playTab(key) {
    if (ORDER.indexOf(key) < 0) return;
    currentKey = key;

    ORDER.forEach(function (k) {
      var video = videos[k];
      var isActive = k === key;
      video.classList.toggle("wroom-hero-carousel__video--active", isActive);
      video.hidden = !isActive;
      if (!isActive) {
        video.pause();
        video.currentTime = 0;
      }
    });

    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-wroom-hero") === key;
      tab.classList.toggle("dataviz-tab--active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    updateTabSlider();

    var activeVideo = videos[key];
    var playPromise = activeVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function playNextTab() {
    var idx = ORDER.indexOf(currentKey);
    playTab(ORDER[(idx + 1) % ORDER.length]);
  }

  ORDER.forEach(function (key) {
    videos[key].addEventListener("ended", playNextTab);
  });

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      playTab(tab.getAttribute("data-wroom-hero"));
    });
  });

  window.addEventListener("resize", updateTabSlider);
  requestAnimationFrame(function () {
    updateTabSlider();
    playTab(ORDER[0]);
  });
})();


// Wroom design system showcase: state tabs control component grid state
(function () {
  document.querySelectorAll('.ds-showcase').forEach(function (root) {
    var tabs = root.querySelectorAll('.ds-state-tab');
    var grid = root.querySelector('.ds-controls-grid');
    if (!grid || !tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var state = tab.getAttribute('data-state');
        if (!state) return;
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        grid.setAttribute('data-ds-state', state);
      });
    });
  });
})();

// Wroom ComfyUI image lightbox
(function () {
  var trigger = document.querySelector('.js-wroom-comfy-open');
  var lightbox = document.getElementById('wroom-comfy-lightbox');
  if (!trigger || !lightbox) return;
  var closers = lightbox.querySelectorAll('.js-wroom-comfy-close');

  function open() {
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  trigger.addEventListener('click', open);
  closers.forEach(function (el) { el.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
})();

// Wroom Before-section: auto-scrolling chains viewport
(function () {
  var viewport = document.querySelector('.js-workflow-chains-viewport');
  if (!viewport) return;
  var track = viewport.querySelector('.workflow-chains-track');
  var firstSet = viewport.querySelector('.js-workflow-chains-set');
  var image = document.querySelector('.workflow-pipeline__image img');
  if (!track || !firstSet || !image) return;

  // Duplicate chain set for seamless loop
  var clone = firstSet.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.classList.remove('js-workflow-chains-set');
  track.appendChild(clone);

  // Sync viewport height with the ComfyUI image
  function syncHeight() {
    var h = image.clientHeight;
    if (h > 0) viewport.style.setProperty('--ws-h', h + 'px');
  }
  if (image.complete) syncHeight();
  image.addEventListener('load', syncHeight);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncHeight).observe(image);
  }
  window.addEventListener('resize', syncHeight);

  // Press to speed up; release to resume normal speed
  function speedUp() { viewport.classList.add('is-fast'); }
  function normalSpeed() { viewport.classList.remove('is-fast'); }
  viewport.addEventListener('mousedown', speedUp);
  viewport.addEventListener('mouseup', normalSpeed);
  viewport.addEventListener('mouseleave', normalSpeed);
  viewport.addEventListener('touchstart', speedUp, { passive: true });
  viewport.addEventListener('touchend', normalSpeed);
  viewport.addEventListener('touchcancel', normalSpeed);
})();

// Wroom feedback-loop video lightbox
(function () {
  var trigger = document.querySelector('.js-wroom-feedback-open');
  var lightbox = document.getElementById('wroom-feedback-lightbox');
  if (!trigger || !lightbox) return;
  var closers = lightbox.querySelectorAll('.js-wroom-feedback-close');
  var video = lightbox.querySelector('video');

  function open() {
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (video) { video.currentTime = 0; video.play().catch(function(){}); }
  }
  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (video) video.pause();
  }
  trigger.addEventListener('click', open);
  closers.forEach(function (el) { el.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
})();

// Homepage: Other products thumbnail lightbox
(function () {
  var lightbox = document.getElementById('other-product-lightbox');
  if (!lightbox) return;

  var imgEl = lightbox.querySelector('.js-other-product-lightbox-img');
  var videoEl = lightbox.querySelector('.js-other-product-lightbox-video');
  var triggers = document.querySelectorAll('.js-other-product-thumb-open');
  var closers = lightbox.querySelectorAll('.js-other-product-lightbox-close');
  if (!triggers.length) return;

  function hideImage() {
    if (!imgEl) return;
    imgEl.setAttribute('hidden', '');
    imgEl.removeAttribute('src');
    imgEl.alt = '';
  }

  function hideVideo() {
    if (!videoEl) return;
    videoEl.setAttribute('hidden', '');
    videoEl.pause();
  }

  function showImage(src, alt, label) {
    hideVideo();
    if (!imgEl) return;
    imgEl.removeAttribute('hidden');
    imgEl.src = src;
    imgEl.alt = alt || label || '';
    lightbox.setAttribute('aria-label', (label || 'Product screenshot') + ', full size');
  }

  function showVideoFromThumb(thumbVideo, label) {
    hideImage();
    if (!videoEl) return;
    var src = thumbVideo.getAttribute('src') || thumbVideo.currentSrc || thumbVideo.src;
    if (src && videoEl.getAttribute('src') !== src) {
      videoEl.setAttribute('src', src);
    }
    videoEl.removeAttribute('hidden');
    lightbox.setAttribute('aria-label', (label || 'Product video') + ', full size');
    videoEl.currentTime = 0;
    var playWhenReady = function () {
      videoEl.play().catch(function () {});
    };
    if (videoEl.readyState >= 2) {
      playWhenReady();
    } else {
      videoEl.addEventListener('canplay', playWhenReady, { once: true });
      videoEl.load();
    }
  }

  function openFromThumb(btn, label) {
    var video = btn.querySelector('.other-product__thumb-video');
    var img = btn.querySelector('img.other-product__thumb-img');
    if (video) {
      showVideoFromThumb(video, label);
    } else if (img) {
      showImage(img.currentSrc || img.src, img.alt, label);
    } else {
      return;
    }
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hideImage();
    hideVideo();
  }

  triggers.forEach(function (btn) {
    var titleEl = btn.closest('.other-product') && btn.closest('.other-product').querySelector('.other-product__title');
    var label = titleEl ? titleEl.textContent.trim() : 'Product screenshot';
    var isVideo = !!btn.querySelector('.other-product__thumb-video');
    btn.setAttribute('aria-label', 'View ' + label + (isVideo ? ' video' : ' screenshot') + ', full size');

    btn.addEventListener('click', function () {
      openFromThumb(btn, label);
    });
  });

  closers.forEach(function (el) { el.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
})();
