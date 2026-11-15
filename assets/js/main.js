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

  /* ========================================================================
     3. AzurePath Interactive Attack Graph & Cut Simulator
     ======================================================================== */
  const scenarios = [
    {
      id: "vm-mi",
      name_en: "1. VM Managed Identity",
      name_id: "1. Managed Identity VM",
      tech: "Managed Identity Execution",
      cutEdgeIndex: 2,
      cutKey: "assignment:vm-mi-owner-sub",
      cli: "az role assignment delete --ids /subscriptions/.../vm-mi-owner",
      desc_en:
        "User can run scripts on a VM (controls), which runs as a System Managed Identity holding Owner on the Subscription.",
      desc_id:
        "User dapat menjalankan skrip di VM (controls), yang berjalan sebagai Managed Identity ber-role Owner di level Subscription.",
      nodes: [
        { label: "Dev User", sub: "Principal", x: 55, y: 105, color: "#3b82f6" },
        { label: "Prod-VM", sub: "Resource", x: 195, y: 105, color: "#8b5cf6" },
        { label: "VM-Sys-MI", sub: "Managed ID", x: 335, y: 105, color: "#06b6d4" },
        { label: "Owner Role", sub: "Subscription", x: 465, y: 55, color: "#f59e0b" },
        { label: "SINK: Owner", sub: "Full Control", x: 525, y: 155, color: "#ef4444" }
      ],
      edges: [
        { from: 0, to: 1, label: "controls" },
        { from: 1, to: 2, label: "runs_as" },
        { from: 2, to: 3, label: "has_role", isCutTarget: true },
        { from: 3, to: 4, label: "grants" }
      ],
      factors: [
        { name_en: "Sink Base: Owner", name_id: "Base Sink: Owner", pts: "+70" },
        { name_en: "Technique: Managed Identity", name_id: "Teknik: Managed Identity", pts: "+12" },
        { name_en: "Length: 4 hops (3-4 range)", name_id: "Panjang: 4 hop (rentang 3-4)", pts: "+4" },
        { name_en: "Scope: Subscription", name_id: "Scope: Subscription", pts: "+4" }
      ],
      total: 90
    },
    {
      id: "nested-grp",
      name_en: "2. Nested Group + PIM",
      name_id: "2. Grup Bersarang + PIM",
      tech: "Transitive Group + PIM",
      cutEdgeIndex: 1,
      cutKey: "membership:sec-ops-to-cloud-admins",
      cli: "az ad group member remove --group CloudAdmins --member-id SecOps",
      desc_en:
        "User inherits User Access Administrator at Management Group via 2 nested groups, but the role requires PIM activation (-20 pts).",
      desc_id:
        "User mewarisi role User Access Administrator melalui 2 grup bersarang, namun berstatus PIM Eligible (-20 poin).",
      nodes: [
        { label: "Analyst", sub: "Principal", x: 50, y: 105, color: "#3b82f6" },
        { label: "SecOps-Grp", sub: "Group 1", x: 175, y: 105, color: "#6366f1" },
        { label: "Cloud-Admins", sub: "Group 2", x: 305, y: 105, color: "#6366f1" },
        { label: "UAA (PIM)", sub: "Mgmt Group", x: 430, y: 55, color: "#f59e0b" },
        { label: "SINK: UAA", sub: "Grant Access", x: 525, y: 155, color: "#ef4444" }
      ],
      edges: [
        { from: 0, to: 1, label: "member_of" },
        { from: 1, to: 2, label: "member_of", isCutTarget: true },
        { from: 2, to: 3, label: "eligible (PIM)" },
        { from: 3, to: 4, label: "grants" }
      ],
      factors: [
        { name_en: "Sink Base: User Access Admin", name_id: "Base Sink: User Access Admin", pts: "+66" },
        { name_en: "Technique: Transitive (Group)", name_id: "Teknik: Transitive (Grup)", pts: "+10" },
        { name_en: "Length: 4 hops (+4) & Mgmt Grp (+10)", name_id: "Panjang: 4 hop (+4) & Mgmt Grp (+10)", pts: "+14" },
        { name_en: "Context: 2+ Nested Groups", name_id: "Konteks: >=2 Grup Bersarang", pts: "+2" },
        { name_en: "PIM Penalty: Inactive Eligible Hop", name_id: "Penalti PIM: Butuh Aktivasi", pts: "-20" }
      ],
      total: 72
    },
    {
      id: "app-own",
      name_en: "3. App Ownership Bridge",
      name_id: "3. Kepemilikan Aplikasi (SP)",
      tech: "Application Control",
      cutEdgeIndex: 0,
      cutKey: "app-owner:user-owns-deploy-sp",
      cli: "az ad app owner remove --id <app-id> --owner-object-id <user-id>",
      desc_en:
        "User owns an Entra Application whose Service Principal holds RBAC Administrator on the Subscription.",
      desc_id:
        "User adalah Owner Aplikasi Entra yang Service Principal-nya memegang role RBAC Admin pada Subscription.",
      nodes: [
        { label: "Junior Dev", sub: "Principal", x: 65, y: 105, color: "#3b82f6" },
        { label: "Deploy-SP", sub: "Service Principal", x: 230, y: 105, color: "#ec4899" },
        { label: "RBAC Admin", sub: "Subscription", x: 390, y: 60, color: "#f59e0b" },
        { label: "SINK: RBAC", sub: "Role Write", x: 520, y: 145, color: "#ef4444" }
      ],
      edges: [
        { from: 0, to: 1, label: "owns_app", isCutTarget: true },
        { from: 1, to: 2, label: "has_role" },
        { from: 2, to: 3, label: "grants" }
      ],
      factors: [
        { name_en: "Sink Base: RBAC Administrator", name_id: "Base Sink: RBAC Administrator", pts: "+62" },
        { name_en: "Technique: Entra / App Bridge", name_id: "Teknik: App / Entra Bridge", pts: "+12" },
        { name_en: "Length: 3 hops (+4) & Sub Scope (+4)", name_id: "Panjang: 3 hop (+4) & Scope Sub (+4)", pts: "+8" },
        { name_en: "Context: App Ownership", name_id: "Konteks: App Ownership", pts: "+4" }
      ],
      total: 86
    },
    {
      id: "neg-contrib",
      name_en: "4. Negative: Contributor (Safe)",
      name_id: "4. Negatif: Contributor (Aman)",
      tech: "Filtered by notActions",
      cutEdgeIndex: -1,
      cutKey: "none (not a sink)",
      cli: "# No remediation needed: Microsoft.Authorization/*/Write is excluded",
      desc_en:
        "Contributor can create resources, but AzurePath subtracts notActions (Microsoft.Authorization/*/Write), so no grants edge reaches a Sink.",
      desc_id:
        "Contributor memiliki izin luas, namun dikurangi notActions (Microsoft.Authorization/*/Write) sehingga tidak mencapai Sink.",
      nodes: [
        { label: "Ops User", sub: "Principal", x: 80, y: 105, color: "#3b82f6" },
        { label: "Contributor", sub: "notActions filtered", x: 280, y: 105, color: "#10b981" },
        { label: "SINK: Owner/UAA", sub: "Unreachable", x: 490, y: 105, color: "#64748b" }
      ],
      edges: [{ from: 0, to: 1, label: "has_role" }],
      factors: [
        { name_en: "Wildcard * matched initially", name_id: "Wildcard * cocok di awal", pts: "--" },
        { name_en: "notActions subtracts roleAssignments/write", name_id: "notActions menghapus roleAssignments/write", pts: "Blocked" },
        { name_en: "Result: 0 Escalation Paths Found", name_id: "Hasil: 0 Jalur Eskalasi (True Negative)", pts: "0" }
      ],
      total: 0
    }
  ];

  const tabsEl = document.getElementById("ap-scenario-tabs");
  const svgEl = document.getElementById("ap-graph-svg");
  const cutBtn = document.getElementById("ap-cut-btn");
  const langBtn = document.getElementById("ap-lang-btn");
  const statusEl = document.getElementById("ap-path-status");
  const cliEl = document.getElementById("ap-cli-preview");
  const scoreBadgeEl = document.getElementById("ap-score-badge");
  const scoreLabelEl = document.getElementById("ap-score-label");
  const factorsEl = document.getElementById("ap-factors-list");
  const descEl = document.getElementById("ap-scenario-desc");

  if (!tabsEl || !svgEl || !cutBtn || !langBtn) return;

  let lang = "en";
  let currentIdx = 0;
  let isCut = false;

  function renderWorkbench() {
    const s = scenarios[currentIdx];

    scoreLabelEl.textContent =
      lang === "id" ? "Skor Explainable (0-100)" : "Explainable Score (0-100)";
    langBtn.textContent = lang === "id" ? "Lang: ID / EN" : "Lang: EN / ID";

    if (s.cutEdgeIndex === -1) {
      cutBtn.disabled = true;
      cutBtn.className = "btn btn-sm";
      cutBtn.textContent = lang === "id" ? "Aman (Bukan Sink)" : "Safe (Not a Sink)";
    } else if (isCut) {
      cutBtn.disabled = false;
      cutBtn.className = "btn btn-sm btn-primary";
      cutBtn.textContent = lang === "id" ? "Pulihkan Jalur" : "Restore Cut Edge";
    } else {
      cutBtn.disabled = false;
      cutBtn.className = "btn btn-sm btn-primary";
      cutBtn.textContent = lang === "id" ? "Simulasikan Cut" : "Simulate Cut";
    }

    // Scenario tabs
    tabsEl.replaceChildren();
    scenarios.forEach((sc, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab-btn";
      btn.setAttribute("aria-pressed", String(idx === currentIdx));
      btn.textContent = lang === "id" ? sc.name_id : sc.name_en;
      btn.addEventListener("click", () => {
        currentIdx = idx;
        isCut = false;
        renderWorkbench();
      });
      tabsEl.appendChild(btn);
    });

    // Build SVG
    const defs = `
      <defs>
        <marker id="ap-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
        </marker>
        <marker id="ap-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
        <marker id="ap-arrow-cut" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
        </marker>
      </defs>
    `;

    let edgesSvg = s.edges
      .map((e) => {
        const n1 = s.nodes[e.from];
        const n2 = s.nodes[e.to];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const r = 34;
        const x1 = n1.x + (dx / len) * r;
        const y1 = n1.y + (dy / len) * r;
        const x2 = n2.x - (dx / len) * (r + 4);
        const y2 = n2.y - (dy / len) * (r + 4);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - 10;

        const cutHere = isCut && e.isCutTarget;
        const stroke = cutHere ? "#ef4444" : isCut || s.total === 0 ? "#64748b" : "#f59e0b";
        const dash = cutHere ? "6,5" : e.label.includes("PIM") ? "4,3" : "none";
        const marker = cutHere
          ? "url(#ap-arrow-cut)"
          : isCut || s.total === 0
            ? "url(#ap-arrow)"
            : "url(#ap-arrow-active)";

        return `
          <g>
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="${dash}" marker-end="${marker}" />
            <rect x="${mx - 44}" y="${my - 11}" width="88" height="18" rx="4" fill="#0f172a" opacity="0.92" />
            <text x="${mx}" y="${my + 2}" text-anchor="middle" fill="${cutHere ? "#fca5a5" : "#e2e8f0"}" font-size="11" font-family="monospace">${cutHere ? "REMOVED" : e.label}</text>
          </g>
        `;
      })
      .join("");

    if (s.total === 0) {
      edgesSvg += `
        <g>
          <line x1="320" y1="105" x2="445" y2="105" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4" />
          <rect x="330" y="80" width="108" height="20" rx="4" fill="#7f1d1d" />
          <text x="384" y="94" text-anchor="middle" fill="#fecaca" font-size="11" font-family="monospace">X notActions</text>
        </g>
      `;
    }

    const nodesSvg = s.nodes
      .map((n, idx) => {
        const dimmed = isCut && idx === s.nodes.length - 1;
        return `
          <g transform="translate(${n.x}, ${n.y})" opacity="${dimmed ? "0.4" : "1"}">
            <circle r="32" fill="${n.color}" fill-opacity="0.18" stroke="${n.color}" stroke-width="2.5" />
            <text y="-2" text-anchor="middle" fill="currentColor" font-size="11.5" font-weight="700">${n.label}</text>
            <text y="13" text-anchor="middle" fill="currentColor" opacity="0.75" font-size="10.5">${n.sub}</text>
          </g>
        `;
      })
      .join("");

    svgEl.innerHTML = defs + edgesSvg + nodesSvg;

    // Footer status & CLI
    if (s.total === 0) {
      statusEl.className = "status-pill-text status-safe";
      statusEl.textContent =
        lang === "id"
          ? "Status: AMAN (Bukan Jalur Eskalasi)"
          : "Status: SAFE (No Escalation Path)";
    } else if (isCut) {
      statusEl.className = "status-pill-text status-safe";
      statusEl.textContent =
        lang === "id"
          ? "Hasil Simulasi: CLOSED (Jalur Tertutup)"
          : "Simulation Result: CLOSED (Path Broken)";
    } else {
      statusEl.className = "status-pill-text status-active";
      statusEl.textContent =
        lang === "id"
          ? `Status: TEMUAN AKTIF (${s.tech})`
          : `Status: ACTIVE FINDING (${s.tech})`;
    }

    cliEl.textContent =
      s.cutKey !== "none (not a sink)" ? `Cut Key: ${s.cutKey}` : s.cli;

    // Score badge
    if (isCut || s.total === 0) {
      scoreBadgeEl.className = "badge badge-success";
      scoreBadgeEl.textContent = isCut
        ? lang === "id"
          ? "0 (Ditutup)"
          : "0 (Closed)"
        : "0 / 100";
    } else {
      scoreBadgeEl.className = "badge badge-high";
      scoreBadgeEl.textContent = `${s.total} / 100`;
    }

    // Score breakdown list
    factorsEl.replaceChildren();
    s.factors.forEach((f) => {
      const li = document.createElement("li");
      li.className = `factor-item${isCut ? " is-cut" : ""}`;

      const nameSpan = document.createElement("span");
      nameSpan.textContent = lang === "id" ? f.name_id : f.name_en;

      const ptsSpan = document.createElement("span");
      const isNeg = f.pts.startsWith("-") || f.pts === "Blocked" || f.pts === "0";
      ptsSpan.className = `factor-pts ${isNeg ? "is-neg" : "is-pos"}`;
      ptsSpan.textContent = f.pts;

      li.appendChild(nameSpan);
      li.appendChild(ptsSpan);
      factorsEl.appendChild(li);
    });

    descEl.textContent = lang === "id" ? s.desc_id : s.desc_en;
  }

  cutBtn.addEventListener("click", () => {
    if (scenarios[currentIdx].cutEdgeIndex === -1) return;
    isCut = !isCut;
    renderWorkbench();
  });

  langBtn.addEventListener("click", () => {
    lang = lang === "en" ? "id" : "en";
    renderWorkbench();
  });

  renderWorkbench();
})();
