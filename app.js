/* ------------------------------------------------------------------
   My Workbench — interactions
   No dependencies. Everything is rendered from data.js.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  const SITE = window.WORKBENCH_SITE || {};
  const ACCENT_NAMES = {
    violet: "Violet",
    blue: "Blue",
    teal: "Teal",
    rose: "Rose",
    amber: "Amber"
  };
  const STATUS_CLASS = {
    "In progress": "status--progress",
    "Planned": "status--planned",
    "Shipped": "status--shipped"
  };
  const FILTERS = ["All", "In progress", "Planned", "Shipped"];
  const SETTINGS_KEY = "workbench.settings";
  const SEEN_KEY = "workbench.changelogSeen";

  const projects = (window.WORKBENCH_PROJECTS || []).map(function (project) {
    return Object.assign({}, project, {
      status: STATUS_CLASS[project.status] ? project.status : "Planned"
    });
  });
  const changelog = window.WORKBENCH_CHANGELOG || [];
  const latestVersion = changelog.length ? String(changelog[0].version) : "";

  const root = document.documentElement;
  const topbar = document.getElementById("topbar");
  const projectGrid = document.getElementById("projectGrid");
  const filtersEl = document.getElementById("filters");
  const filterCount = document.getElementById("filterCount");
  const emptyState = document.getElementById("emptyState");
  const projectsNote = document.getElementById("projectsNote");
  const statusBar = document.getElementById("statusBar");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  const scrim = document.getElementById("scrim");
  const settingsPanel = document.getElementById("settingsPanel");
  const changelogPopover = document.getElementById("changelogPopover");
  const settingsTrigger = document.getElementById("settingsTrigger");
  const changelogTrigger = document.getElementById("changelogTrigger");
  const updateDot = document.getElementById("updateDot");
  const accentName = document.getElementById("accentName");
  const motionToggle = document.getElementById("motionToggle");
  const themeOptions = Array.from(document.querySelectorAll("[data-theme-option]"));
  const accentOptions = Array.from(document.querySelectorAll("[data-accent-option]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

  let activeFilter = "All";
  let openOverlay = null;
  let overlayOpener = null;
  let scrollFrame = 0;

  /* ---------- Small helpers ---------- */

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function storeGet(key) {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  function storeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) { /* private mode */ }
  }

  function storeRemove(key) {
    try { window.localStorage.removeItem(key); } catch (error) { /* private mode */ }
  }

  function prefersReducedMotion() {
    return motionQuery.matches;
  }

  function motionReduced() {
    return settings.reducedMotion || prefersReducedMotion();
  }

  /* ---------- Settings ---------- */

  const defaultSettings = {
    theme: "system",
    accent: "violet",
    reducedMotion: prefersReducedMotion()
  };
  let settings = loadSettings();

  function loadSettings() {
    const next = Object.assign({}, defaultSettings);
    try {
      const saved = JSON.parse(storeGet(SETTINGS_KEY) || "{}");
      if (saved.theme === "dark" || saved.theme === "light" || saved.theme === "system") {
        next.theme = saved.theme;
      }
      if (Object.prototype.hasOwnProperty.call(ACCENT_NAMES, saved.accent)) {
        next.accent = saved.accent;
      }
      if (typeof saved.reducedMotion === "boolean") {
        next.reducedMotion = saved.reducedMotion;
      }
    } catch (error) { /* corrupted storage — use defaults */ }
    return next;
  }

  function saveSettings() {
    storeSet(SETTINGS_KEY, JSON.stringify(settings));
  }

  function resolvedTheme() {
    return settings.theme === "system"
      ? (systemQuery.matches ? "dark" : "light")
      : settings.theme;
  }

  function applySettings(persist) {
    const theme = resolvedTheme();
    const themeChanged = root.getAttribute("data-theme") !== theme;
    const accentChanged = root.getAttribute("data-accent") !== settings.accent;
    const changedAppearance = themeChanged || accentChanged;

    // Skip colour transitions for one frame so switching themes is crisp instead
    // of passing through muddy, low-contrast in-between colours.
    if (changedAppearance) {
      root.classList.add("theme-switching");
      void root.offsetWidth;
    }

    root.setAttribute("data-theme", theme);
    root.setAttribute("data-theme-pref", settings.theme);
    root.setAttribute("data-accent", settings.accent);
    root.setAttribute("data-motion", settings.reducedMotion ? "reduced" : "full");

    if (changedAppearance) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          root.classList.remove("theme-switching");
        });
      });
    }

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", theme === "dark" ? "#09090d" : "#f7f6fa");
    }

    themeOptions.forEach(function (button) {
      button.setAttribute("aria-checked", String(button.dataset.themeOption === settings.theme));
    });
    accentOptions.forEach(function (button) {
      button.setAttribute("aria-checked", String(button.dataset.accentOption === settings.accent));
    });
    if (accentName) {
      accentName.textContent = ACCENT_NAMES[settings.accent] || "Violet";
    }
    motionToggle.setAttribute("aria-checked", String(settings.reducedMotion));

    if (settings.reducedMotion) {
      revealEverything();
    }
    if (persist) saveSettings();
  }

  /* ---------- Site content ---------- */

  if (SITE.name) {
    document.getElementById("heroName").textContent = SITE.name;
    document.getElementById("footerName").textContent = SITE.name;
  }
  if (SITE.updated) {
    document.getElementById("updatedLabel").textContent = "Updated " + SITE.updated;
    projectsNote.textContent = projects.length + (projects.length === 1 ? " project · " : " projects · ") + "updated " + SITE.updated;
  }
  document.getElementById("year").textContent = String(new Date().getFullYear());

  const counts = { total: projects.length, "In progress": 0, Planned: 0, Shipped: 0 };
  projects.forEach(function (project) { counts[project.status] += 1; });

  document.getElementById("statTotal").textContent = String(counts.total);
  document.getElementById("statActive").textContent = String(counts["In progress"]);
  document.getElementById("statPlanned").textContent = String(counts.Planned);

  if (statusBar) {
    const segments = [
      { key: "In progress", className: "progress" },
      { key: "Planned", className: "planned" },
      { key: "Shipped", className: "shipped" }
    ].filter(function (segment) { return counts[segment.key] > 0; });

    statusBar.innerHTML = segments.map(function (segment) {
      return '<span class="status-seg status-seg--' + segment.className +
        '" style="flex:' + counts[segment.key] + '"></span>';
    }).join("");
  }

  /* ---------- Project cards ---------- */

  const ICONS = {
    gamepad: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M6 11h4"/><path d="M8 9v4"/><path d="M15 12h.01"/><path d="M18 10h.01"/>' +
      '<path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59c-.01.05-.01.1-.02.15C2.6 9.42 2 14.46 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.41-1.41A2 2 0 0 1 9.83 16h4.34a2 2 0 0 1 1.41.59L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.54-.6-6.58-.68-7.26A4 4 0 0 0 17.32 5Z"/>' +
      '</svg>',
    pickaxe: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L11 10"/>' +
      '<path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>' +
      '</svg>',
    layout: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>' +
      '</svg>',
    bot: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>' +
      '<path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>' +
      '</svg>',
    palette: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="13.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>' +
      '<circle cx="17.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/>' +
      '<circle cx="8.5" cy="7.5" r=".8" fill="currentColor" stroke="none"/>' +
      '<circle cx="6.5" cy="12.5" r=".8" fill="currentColor" stroke="none"/>' +
      '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2Z"/>' +
      '</svg>',
    cloud: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>' +
      '</svg>',
    fallback: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>' +
      '<path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>' +
      '</svg>'
  };

  const ARROW_UP_RIGHT = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>';

  function projectMarkup(project, index) {
    const status = project.status;
    const statusClass = STATUS_CLASS[status];
    const icon = ICONS[project.icon] || ICONS.fallback;
    const link = project.link
      ? '<a class="card-link" href="' + escapeHtml(project.link) + '" target="_blank" rel="noopener noreferrer">Open ' + ARROW_UP_RIGHT + '</a>'
      : (project.year ? '<span class="card-year">' + escapeHtml(project.year) + '</span>' : "");

    return '<article class="project-card" data-reveal data-status="' + escapeHtml(status) + '"' +
      ' style="--delay:' + Math.min(index * 45, 220) + 'ms">' +
        '<div class="card-top">' +
          '<span class="project-icon" aria-hidden="true">' + icon + '</span>' +
          '<div class="project-info">' +
            '<h3 class="project-title">' + escapeHtml(project.title) + '</h3>' +
            '<span class="status ' + statusClass + '">' + escapeHtml(status) + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="project-desc">' + escapeHtml(project.description) + '</p>' +
        '<div class="card-foot">' +
          '<span class="card-category">' + escapeHtml(project.category) + '</span>' +
          link +
        '</div>' +
      '</article>';
  }

  projectGrid.innerHTML = projects.map(projectMarkup).join("");

  /* ---------- Filters ---------- */

  const visibleFilters = FILTERS.filter(function (filter) {
    return filter === "All" || counts[filter] > 0;
  });

  filtersEl.innerHTML = visibleFilters.map(function (filter) {
    const count = filter === "All" ? projects.length : counts[filter];
    return '<button class="filter" type="button" data-filter="' + escapeHtml(filter) + '"' +
      ' aria-pressed="' + String(filter === activeFilter) + '">' +
      escapeHtml(filter) +
      '<span class="filter-num">' + count + '</span>' +
      '</button>';
  }).join("");

  function applyFilter(filter) {
    activeFilter = filter;
    let shown = 0;

    Array.from(projectGrid.querySelectorAll(".project-card")).forEach(function (card) {
      const matches = filter === "All" || card.dataset.status === filter;
      card.hidden = !matches;
      if (matches) shown += 1;
    });

    filterCount.textContent = "Showing " + shown + " of " + projects.length;
    emptyState.hidden = shown !== 0;

    Array.from(filtersEl.querySelectorAll("[data-filter]")).forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });
  }

  filtersEl.addEventListener("click", function (event) {
    const button = event.target.closest("[data-filter]");
    if (button) applyFilter(button.dataset.filter);
  });

  applyFilter("All");

  /* ---------- Changelog ---------- */

  const changelogList = document.getElementById("changelogList");

  if (changelog.length) {
    changelogList.innerHTML = changelog.map(function (entry, index) {
      const items = (entry.items || []).map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("");

      return '<article class="log-entry">' +
        '<div class="log-meta">' +
          '<span class="log-version">v' + escapeHtml(entry.version) + '</span>' +
          '<time class="log-date">' + escapeHtml(entry.date) + '</time>' +
          (index === 0 ? '<span class="log-latest">Latest</span>' : "") +
        '</div>' +
        '<h3>' + escapeHtml(entry.title) + '</h3>' +
        '<ul>' + items + '</ul>' +
      '</article>';
    }).join("");
  } else {
    changelogList.innerHTML = '<p class="empty-state">No updates logged yet.</p>';
  }

  function changelogUnseen() {
    return Boolean(latestVersion) && storeGet(SEEN_KEY) !== latestVersion;
  }

  function refreshUpdateDot() {
    if (!latestVersion) {
      updateDot.hidden = true;
      changelogTrigger.setAttribute("aria-label", "Open changelog");
      return;
    }
    const unseen = changelogUnseen();
    updateDot.hidden = !unseen;
    changelogTrigger.setAttribute(
      "aria-label",
      unseen ? "Open changelog, new updates available" : "Open changelog"
    );
  }

  function markChangelogSeen() {
    if (!latestVersion) return;
    storeSet(SEEN_KEY, latestVersion);
    refreshUpdateDot();
  }

  refreshUpdateDot();

  /* ---------- Overlays ---------- */

  const overlays = {
    settings: { panel: settingsPanel, trigger: settingsTrigger },
    changelog: { panel: changelogPopover, trigger: changelogTrigger }
  };

  function lockScroll(lock) {
    if (lock) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty("--scrollbar-offset", scrollbar + "px");
      document.body.classList.add("is-locked");
    } else {
      document.body.classList.remove("is-locked");
      document.body.style.removeProperty("--scrollbar-offset");
    }
  }

  function focusableInside(panel) {
    return Array.from(panel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (element) {
      return element.getClientRects().length > 0;
    });
  }

  function openPanel(name) {
    if (!overlays[name]) return;
    if (openOverlay === name) return;

    overlayOpener = document.activeElement;
    openOverlay = name;

    const panel = overlays[name].panel;
    const trigger = overlays[name].trigger;

    panel.inert = false;
    panel.setAttribute("aria-hidden", "false");
    panel.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");

    scrim.classList.toggle("scrim--soft", name === "changelog");
    scrim.classList.add("is-open");
    lockScroll(true);

    if (name === "changelog") markChangelogSeen();

    const focusTarget = panel.querySelector("[data-close-overlay]") || panel;
    window.requestAnimationFrame(function () {
      focusTarget.focus({ preventScroll: true });
    });
  }

  function closePanel(options) {
    if (!openOverlay) return;

    const name = openOverlay;
    const panel = overlays[name].panel;
    const trigger = overlays[name].trigger;
    const restoreFocus = !options || options.restoreFocus !== false;
    const target = overlayOpener && document.contains(overlayOpener) ? overlayOpener : trigger;

    // Move focus out before marking the panel hidden, so nothing stays focused inside it.
    if (restoreFocus) target.focus({ preventScroll: true });

    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    trigger.setAttribute("aria-expanded", "false");
    scrim.classList.remove("is-open");
    lockScroll(false);
    openOverlay = null;
    overlayOpener = null;
  }

  function togglePanel(name) {
    if (openOverlay === name) closePanel();
    else openPanel(name);
  }

  settingsTrigger.addEventListener("click", function () { togglePanel("settings"); });
  changelogTrigger.addEventListener("click", function () { togglePanel("changelog"); });
  scrim.addEventListener("click", function () { closePanel(); });

  Array.from(document.querySelectorAll("[data-open-changelog]")).forEach(function (button) {
    button.addEventListener("click", function () { openPanel("changelog"); });
  });

  Array.from(document.querySelectorAll("[data-close-overlay]")).forEach(function (button) {
    button.addEventListener("click", function () { closePanel(); });
  });

  document.addEventListener("keydown", function (event) {
    if (!openOverlay) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }

    if (event.key !== "Tab") return;

    const panel = overlays[openOverlay].panel;
    const focusable = focusableInside(panel);
    if (!focusable.length) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !panel.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- Settings controls ---------- */

  themeOptions.forEach(function (button) {
    button.addEventListener("click", function () {
      settings.theme = button.dataset.themeOption;
      applySettings(true);
    });
  });

  accentOptions.forEach(function (button) {
    button.addEventListener("click", function () {
      settings.accent = button.dataset.accentOption;
      applySettings(true);
    });
  });

  motionToggle.addEventListener("click", function () {
    settings.reducedMotion = !settings.reducedMotion;
    applySettings(true);
  });

  document.getElementById("resetSettings").addEventListener("click", function () {
    settings = {
      theme: "system",
      accent: "violet",
      reducedMotion: prefersReducedMotion()
    };
    storeRemove(SETTINGS_KEY);
    applySettings(false);
  });

  if (systemQuery.addEventListener) {
    systemQuery.addEventListener("change", function () {
      if (settings.theme === "system") applySettings(false);
    });
  }

  /* ---------- Scroll reveal ---------- */

  let revealObserver = null;

  function revealEverything() {
    Array.from(document.querySelectorAll("[data-reveal]")).forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  function initReveals() {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (motionReduced() || !("IntersectionObserver" in window)) {
      revealEverything();
      return;
    }

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    elements.forEach(function (element) {
      if (element.classList.contains("is-visible")) return;
      revealObserver.observe(element);
    });
  }

  /* ---------- Scroll spy + header state ---------- */

  function updateScrollUI() {
    topbar.classList.toggle("is-scrolled", window.scrollY > 6);

    const projectsSection = document.getElementById("projects");
    const projectsTop = projectsSection.getBoundingClientRect().top;
    const triggerLine = Math.min(window.innerHeight * 0.5, 380);
    const atBottom = window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 24;
    const current = (atBottom || projectsTop <= triggerLine) ? "projects" : "home";

    navLinks.forEach(function (link) {
      if (link.dataset.section === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(function () {
      scrollFrame = 0;
      updateScrollUI();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", updateScrollUI);
  updateScrollUI();

  /* ---------- Start ---------- */

  applySettings(false);
  initReveals();
})();
