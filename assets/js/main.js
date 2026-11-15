"use strict";

(() => {
  /* ========================================================================
     1. Theme Switcher (System / Dark / Light)
     ======================================================================== */
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const themeModes = ["system", "dark", "light"];
  const themeLabels = {
    system: "Theme: Auto",
    dark: "Theme: Dark",
    light: "Theme: Light"
  };

  function applyTheme(mode) {
    if (mode === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
    if (themeBtn) {
      themeBtn.textContent = themeLabels[mode];
      themeBtn.setAttribute("data-mode", mode);
    }
  }

  let currentModeIndex = 0;
  try {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved && themeModes.includes(saved)) {
      currentModeIndex = themeModes.indexOf(saved);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
  applyTheme(themeModes[currentModeIndex]);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      currentModeIndex = (currentModeIndex + 1) % themeModes.length;
      const nextMode = themeModes[currentModeIndex];
      applyTheme(nextMode);
      try {
        localStorage.setItem("portfolio-theme", nextMode);
      } catch {
        // Ignore storage errors
      }
    });
  }

  /* ========================================================================
     2. Native Modal Lightbox (<dialog closedby="any">)
     ======================================================================== */
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxCaption = document.getElementById("lightbox-caption");

  if (lightbox && lightboxImg && lightboxTitle && lightboxCaption) {
    const triggers = document.querySelectorAll("[data-lightbox]");
    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const img = btn.querySelector("img");
        if (!img) return;
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        if (img.naturalWidth && img.naturalHeight) {
          lightboxImg.width = img.naturalWidth;
          lightboxImg.height = img.naturalHeight;
        }
        lightboxTitle.textContent = btn.dataset.title || "Screenshot Preview";
        lightboxCaption.textContent = btn.dataset.caption || img.alt;
        lightbox.showModal();
      });
    });

    lightbox.addEventListener("close", () => {
      lightboxImg.removeAttribute("src");
    });
  }
})();
