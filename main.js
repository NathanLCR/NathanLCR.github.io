(() => {
  "use strict";

  const root = document.documentElement;
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Theme toggle
  const themeBtn = document.getElementById("theme-toggle");
  const applyTheme = (theme) => {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeBtn) {
      themeBtn.textContent = theme === "dark" ? "Light" : "Dark";
      themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
    }
  };
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("nlcr-theme");
  } catch (_) {}
  if (savedTheme === "dark" || (!savedTheme && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("nlcr-theme", next);
      } catch (_) {}
    });
  }

  // Mobile nav drawer
  const menuBtn = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Copy email button
  const copyBtn = document.getElementById("copy-email");
  const copyFeedback = document.getElementById("copy-feedback");
  if (copyBtn && copyFeedback) {
    copyBtn.addEventListener("click", async () => {
      const email = "nathanrochadev@gmail.com";
      let copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(email);
          copied = true;
        } catch (_) {}
      }
      if (!copied) {
        const tmp = document.createElement("textarea");
        tmp.value = email;
        tmp.setAttribute("readonly", "");
        tmp.style.position = "fixed";
        tmp.style.opacity = "0";
        document.body.appendChild(tmp);
        tmp.select();
        try {
          copied = document.execCommand("copy");
        } catch (_) {}
        document.body.removeChild(tmp);
      }
      copyFeedback.textContent = copied ? `Copied ${email}` : email;
      window.setTimeout(() => {
        copyFeedback.textContent = "";
      }, 2600);
    });
  }

  // Case-study screenshot tabs
  document.querySelectorAll("[data-media-group]").forEach((group) => {
    const img = group.querySelector(".media-frame img");
    const caption = group.querySelector(".media-caption");
    const tabs = group.querySelectorAll(".media-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        if (img) {
          img.src = tab.dataset.src || "";
          img.alt = tab.dataset.alt || "";
        }
        if (caption) {
          caption.textContent = tab.dataset.caption || "";
        }
      });
    });
  });

  // Lightbox for full-res inspection
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxClose = document.getElementById("lightbox-close");
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    if (lightboxImg) lightboxImg.src = "";
  };
  document.querySelectorAll(".media-frame img").forEach((img) => {
    img.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      if (lightboxTitle) lightboxTitle.textContent = img.alt || "Screenshot";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // Interactive Local-Model Eval Explorer
  const explorerRoot = document.getElementById("eval-explorer-app");
  if (!explorerRoot) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs = {}, text = null) => {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, String(v));
    }
    if (text !== null) el.textContent = text;
    return el;
  };

  const setupColor = (setup, ucId) => {
    if (!setup.complete) return "var(--warn)";
    if (ucId === "01-tool-agent" && setup.safety_traps_safe < setup.safety_traps_total) return "var(--danger)";
    if (setup.content_only) return "var(--warn)";
    if (setup.setup === "gemma4-nothink" && ucId !== "01-tool-agent") return "var(--win)";
    if (setup.setup === "qwen3.5-9b-nothink" && ucId === "01-tool-agent") return "var(--win)";
    return "var(--accent)";
  };

  const statusBadge = (setup, ucId) => {
    if (!setup.complete) return { label: `partial (${setup.runs - setup.errors}/${setup.runs})`, cls: "badge-warn" };
    if (ucId === "01-tool-agent") {
      if (setup.setup === "qwen3.5-9b-nothink") return { label: "top raw · CI tie", cls: "badge-win" };
      if (setup.setup === "gemma4-nothink") return { label: "CI tie · 2.2x faster", cls: "badge-tie" };
      if (setup.safety_traps_safe < setup.safety_traps_total) return { label: "unsafe trap", cls: "badge-danger" };
      return { label: "CI tie · think on", cls: "badge-muted" };
    }
    if (ucId === "02-pdf-answers") {
      if (setup.setup === "gemma4-nothink") return { label: "winner (CI tie)", cls: "badge-win" };
      if (setup.setup === "gemma4-think") return { label: "runner-up (CI tie)", cls: "badge-tie" };
      return { label: "omitted citations", cls: "badge-danger" };
    }
    if (ucId === "04-voice-desk") {
      if (setup.setup === "gemma4-nothink") return { label: "winner (<1s race)", cls: "badge-win" };
      if (setup.content_only) return { label: "content-only (think)", cls: "badge-warn" };
      return { label: "missed 1s budget", cls: "badge-danger" };
    }
    return { label: "complete", cls: "badge-muted" };
  };

  const renderExplorer = (data) => {
    let activeUcIdx = 0;
    let activeChart = "forest"; // "forest" | "speed" | "ram"
    let selectedSetup = data.use_cases[0].setups[0].setup;

    const ucTabsEl = document.getElementById("eval-uc-tabs");
    const chartTabsEl = document.getElementById("eval-chart-tabs");
    const descEl = document.getElementById("eval-uc-desc");
    const winnerEl = document.getElementById("eval-winner-banner");
    const captionEl = document.getElementById("eval-chart-caption");
    const chartSvg = document.getElementById("eval-svg");
    const tableHead = document.getElementById("eval-table-head");
    const tableBody = document.getElementById("eval-table-body");
    const inspectorEl = document.getElementById("eval-inspector");
    const footnoteEl = document.getElementById("eval-footnote");

    const renderTabs = () => {
      ucTabsEl.replaceChildren();
      data.use_cases.forEach((uc, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tab-btn" + (idx === activeUcIdx ? " is-active" : "");
        btn.textContent = uc.short;
        btn.addEventListener("click", () => {
          activeUcIdx = idx;
          const setups = data.use_cases[activeUcIdx].setups;
          if (!setups.some((s) => s.setup === selectedSetup)) {
            selectedSetup = setups[0].setup;
          }
          draw();
        });
        ucTabsEl.appendChild(btn);
      });

      chartTabsEl.replaceChildren();
      [
        ["forest", "95% CI Forest"],
        ["speed", "vs Speed (tok/s)"],
        ["ram", "vs Peak RAM (GB)"],
      ].forEach(([mode, label]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tab-btn" + (mode === activeChart ? " is-active" : "");
        btn.textContent = label;
        btn.addEventListener("click", () => {
          activeChart = mode;
          draw();
        });
        chartTabsEl.appendChild(btn);
      });
    };

    const drawForestSvg = (uc) => {
      const W = 760;
      const rowH = 52;
      const topPad = 24;
      const leftPad = 170;
      const rightPad = 155;
      const plotW = W - leftPad - rightPad;
      const H = topPad + uc.setups.length * rowH + 34;

      chartSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      chartSvg.replaceChildren();

      const xAt = (pct) => leftPad + (pct / 100) * plotW;

      // Highlight leader CI band for race setups
      const raceLeader = uc.setups
        .filter((s) => s.complete && !s.content_only)
        .sort((a, b) => b.pass_rate - a.pass_rate)[0];
      if (raceLeader) {
        const bx1 = xAt(raceLeader.ci_low_pct);
        const bx2 = xAt(raceLeader.ci_high_pct);
        chartSvg.appendChild(
          svgEl("rect", {
            x: bx1,
            y: topPad - 4,
            width: Math.max(2, bx2 - bx1),
            height: uc.setups.length * rowH + 4,
            fill: "var(--win-soft)",
            rx: 3,
          })
        );
      }

      // Grid lines
      [0, 25, 50, 75, 100].forEach((tick) => {
        const x = xAt(tick);
        chartSvg.appendChild(
          svgEl("line", {
            x1: x,
            y1: topPad - 6,
            x2: x,
            y2: topPad + uc.setups.length * rowH,
            stroke: "var(--rule)",
            "stroke-dasharray": tick === 0 || tick === 100 ? "none" : "3 3",
          })
        );
        chartSvg.appendChild(
          svgEl(
            "text",
            {
              x,
              y: topPad + uc.setups.length * rowH + 18,
              "text-anchor": "middle",
              fill: "var(--ink-faint)",
              "font-family": "var(--font-mono)",
              "font-size": "11",
            },
            `${tick}%`
          )
        );
      });

      uc.setups.forEach((s, i) => {
        const y = topPad + i * rowH + rowH / 2;
        const isSel = s.setup === selectedSetup;
        const color = setupColor(s, uc.id);

        if (isSel) {
          chartSvg.appendChild(
            svgEl("rect", {
              x: 4,
              y: y - 20,
              width: W - 8,
              height: 40,
              rx: 5,
              fill: "var(--accent-soft)",
            })
          );
        }

        // Row label
        chartSvg.appendChild(
          svgEl(
            "text",
            {
              x: leftPad - 12,
              y: y + 4,
              "text-anchor": "end",
              fill: isSel ? "var(--ink)" : "var(--ink-muted)",
              "font-family": "var(--font-mono)",
              "font-size": "12",
              "font-weight": isSel ? "700" : "500",
            },
            s.setup
          )
        );

        const xLo = xAt(s.ci_low_pct);
        const xHi = xAt(s.ci_high_pct);
        const xMid = xAt(s.pass_pct);

        // CI whisker
        chartSvg.appendChild(
          svgEl("line", {
            x1: xLo,
            y1: y,
            x2: xHi,
            y2: y,
            stroke: color,
            "stroke-width": isSel ? 3.5 : 2.5,
            "stroke-dasharray": s.complete ? "none" : "4 3",
          })
        );
        [xLo, xHi].forEach((capX) => {
          chartSvg.appendChild(
            svgEl("line", {
              x1: capX,
              y1: y - 6,
              x2: capX,
              y2: y + 6,
              stroke: color,
              "stroke-width": 2,
            })
          );
        });
        chartSvg.appendChild(
          svgEl("circle", {
            cx: xMid,
            cy: y,
            r: isSel ? 6.5 : 5,
            fill: color,
            stroke: "var(--surface)",
            "stroke-width": 1.5,
          })
        );

        const rightLabel = `${s.pass_pct}% [${s.ci_low_pct}–${s.ci_high_pct}%]` + (s.content_only ? " *" : !s.complete ? " (partial)" : "");
        chartSvg.appendChild(
          svgEl(
            "text",
            {
              x: W - rightPad + 12,
              y: y + 4,
              fill: "var(--ink-muted)",
              "font-family": "var(--font-mono)",
              "font-size": "11.5",
            },
            rightLabel
          )
        );

        const hit = svgEl("rect", {
          x: 0,
          y: y - 22,
          width: W,
          height: 44,
          fill: "transparent",
          style: "cursor:pointer",
        });
        hit.addEventListener("click", () => {
          selectedSetup = s.setup;
          draw();
        });
        chartSvg.appendChild(hit);
      });
    };

    const drawScatterSvg = (uc, axis) => {
      const W = 760;
      const H = 276;
      const pad = { top: 24, right: 44, bottom: 42, left: 56 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;

      chartSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      chartSvg.replaceChildren();

      const valid = uc.setups.filter((s) => (axis === "speed" ? s.med_tok_s != null : s.peak_rss_gb != null));
      const xs = valid.map((s) => (axis === "speed" ? s.med_tok_s : s.peak_rss_gb));
      const minX = axis === "speed" ? Math.max(0, Math.floor(Math.min(...xs) - 2)) : Math.floor(Math.min(...xs) - 0.5);
      const maxX = axis === "speed" ? Math.ceil(Math.max(...xs) + 3) : Math.ceil(Math.max(...xs) + 0.5);

      const xAt = (v) => pad.left + ((v - minX) / Math.max(1, maxX - minX)) * plotW;
      const yAt = (pct) => pad.top + ((100 - pct) / 100) * plotH;

      // Y gridlines
      [0, 25, 50, 75, 100].forEach((tick) => {
        const y = yAt(tick);
        chartSvg.appendChild(
          svgEl("line", {
            x1: pad.left,
            y1: y,
            x2: W - pad.right,
            y2: y,
            stroke: "var(--rule)",
            "stroke-dasharray": tick === 0 ? "none" : "3 3",
          })
        );
        chartSvg.appendChild(
          svgEl(
            "text",
            {
              x: pad.left - 10,
              y: y + 4,
              "text-anchor": "end",
              fill: "var(--ink-faint)",
              "font-family": "var(--font-mono)",
              "font-size": "11",
            },
            `${tick}%`
          )
        );
      });

      // X ticks
      const step = axis === "speed" ? 4 : 1;
      for (let t = Math.ceil(minX); t <= Math.floor(maxX); t += step) {
        const x = xAt(t);
        chartSvg.appendChild(
          svgEl("line", {
            x1: x,
            y1: pad.top,
            x2: x,
            y2: H - pad.bottom,
            stroke: "var(--rule)",
            "stroke-dasharray": "3 3",
          })
        );
        chartSvg.appendChild(
          svgEl(
            "text",
            {
              x,
              y: H - pad.bottom + 18,
              "text-anchor": "middle",
              fill: "var(--ink-faint)",
              "font-family": "var(--font-mono)",
              "font-size": "11",
            },
            axis === "speed" ? `${t} tok/s` : `${t} GB`
          )
        );
      }

      // Axis label
      chartSvg.appendChild(
        svgEl(
          "text",
          {
            x: pad.left + plotW / 2,
            y: H - 6,
            "text-anchor": "middle",
            fill: "var(--ink-faint)",
            "font-family": "var(--font-mono)",
            "font-size": "11",
          },
          axis === "speed" ? "Median generation speed (tok/s, higher is faster)" : "Peak RSS memory on Apple M2 16 GB (GB, lower is lighter)"
        )
      );

      // Plot points + vertical CI error bars
      const placedBoxes = [];
      const dotCoords = valid.map((s) => {
        const xv = axis === "speed" ? s.med_tok_s : s.peak_rss_gb;
        return {
          s,
          cx: xAt(xv),
          cy: yAt(s.pass_pct),
          yHi: yAt(s.ci_high_pct),
          yLo: yAt(s.ci_low_pct),
        };
      });

      const overlaps = (box) => {
        if (box.x1 < pad.left + 4 || box.x2 > W - 4 || box.y1 < 6 || box.y2 > H - pad.bottom - 2) {
          return true;
        }
        for (const p of dotCoords) {
          // Reject any box intersecting a setup's vertical CI whisker [yHi, yLo] or dot
          if (!(box.x2 < p.cx - 8 || box.x1 > p.cx + 8 || box.y2 < p.yHi - 5 || box.y1 > p.yLo + 5)) {
            return true;
          }
        }
        for (const b of placedBoxes) {
          if (!(box.x2 + 6 < b.x1 || box.x1 - 6 > b.x2 || box.y2 + 4 < b.y1 || box.y1 - 4 > b.y2)) {
            return true;
          }
        }
        return false;
      };

      dotCoords.forEach(({ s, cx, cy, yHi, yLo }) => {
        const isSel = s.setup === selectedSetup;
        const color = setupColor(s, uc.id);

        chartSvg.appendChild(
          svgEl("line", {
            x1: cx,
            y1: yLo,
            x2: cx,
            y2: yHi,
            stroke: color,
            "stroke-width": isSel ? 3 : 2,
            opacity: "0.75",
          })
        );
        const dot = svgEl("circle", {
          cx,
          cy,
          r: isSel ? 7 : 5.5,
          fill: color,
          stroke: "var(--surface)",
          "stroke-width": 1.8,
          style: "cursor:pointer",
        });
        dot.addEventListener("click", () => {
          selectedSetup = s.setup;
          draw();
        });
        chartSvg.appendChild(dot);

        const textStr = `${s.setup} (${s.pass_pct}%)`;
        const estW = textStr.length * 6.7;
        const candidates = [
          { dx: 12, dy: -4, anchor: "start" },
          { dx: -12, dy: -4, anchor: "end" },
          { dx: 12, dy: 14, anchor: "start" },
          { dx: -12, dy: 14, anchor: "end" },
          { dx: 14, dy: -22, anchor: "start" },
          { dx: -14, dy: -22, anchor: "end" },
          { dx: 14, dy: 30, anchor: "start" },
          { dx: -14, dy: 30, anchor: "end" },
          { dx: 0, dy: yHi - cy - 10, anchor: "middle" },
          { dx: 0, dy: yLo - cy + 16, anchor: "middle" },
          { dx: 24, dy: -36, anchor: "start" },
          { dx: -24, dy: -36, anchor: "end" },
          { dx: 24, dy: 42, anchor: "start" },
          { dx: -24, dy: 42, anchor: "end" },
        ];

        let chosen = candidates[0];
        let chosenBox = null;
        for (const c of candidates) {
          const lx = cx + c.dx;
          const ly = cy + c.dy;
          const x1 = c.anchor === "start" ? lx : c.anchor === "end" ? lx - estW : lx - estW / 2;
          const box = { x1, y1: ly - 11, x2: x1 + estW, y2: ly + 3 };
          if (!overlaps(box)) {
            chosen = c;
            chosenBox = box;
            break;
          }
        }
        if (!chosenBox) {
          const lx = Math.max(pad.left + 8, Math.min(W - estW - 8, cx - estW - 14));
          const ly = Math.max(18, Math.min(H - pad.bottom - 8, cy));
          chosen = { dx: lx - cx, dy: ly - cy, anchor: "start" };
          chosenBox = { x1: lx, y1: ly - 11, x2: lx + estW, y2: ly + 3 };
        }
        placedBoxes.push(chosenBox);

        const lx = cx + chosen.dx;
        const ly = cy + chosen.dy;
        if (chosen.dx !== 0 && Math.hypot(chosen.dx, chosen.dy) > 20) {
          const targetX = chosen.anchor === "end" ? lx + 2 : chosen.anchor === "start" ? lx - 2 : lx;
          chartSvg.appendChild(
            svgEl("line", {
              x1: cx,
              y1: cy,
              x2: targetX,
              y2: ly - 4,
              stroke: "var(--rule-strong)",
              "stroke-width": 1,
            })
          );
        }

        const label = svgEl(
          "text",
          {
            x: lx,
            y: ly,
            "text-anchor": chosen.anchor,
            fill: isSel ? "var(--ink)" : "var(--ink-muted)",
            "font-family": "var(--font-mono)",
            "font-size": "11",
            "font-weight": isSel ? "700" : "500",
            style: "cursor:pointer",
          },
          textStr
        );
        label.addEventListener("click", () => {
          selectedSetup = s.setup;
          draw();
        });
        chartSvg.appendChild(label);
      });
    };

    const draw = () => {
      const uc = data.use_cases[activeUcIdx];
      renderTabs();

      descEl.textContent = uc.description;
      winnerEl.replaceChildren();
      const strong = document.createElement("strong");
      strong.textContent = `Winner: ${uc.winner_info.winner}`;
      winnerEl.appendChild(strong);
      winnerEl.appendChild(document.createTextNode(` — ${uc.winner_info.summary}`));

      if (activeChart === "forest") {
        captionEl.textContent = "Shaded band = top complete race setup's 95% CI. Overlapping whiskers indicate statistical ties (resolved toward thinking-off, then smaller weights).";
        drawForestSvg(uc);
      } else if (activeChart === "speed") {
        captionEl.textContent = "Pass rate (95% CI vertical bars) against median generation speed (tok/s). Upper-right is faster and more accurate.";
        drawScatterSvg(uc, "speed");
      } else {
        captionEl.textContent = "Pass rate (95% CI) against peak RSS memory on M2 16 GB. Upper-left is lighter and more accurate. (qwen3.5-9b-think omitted where resources.json is incomplete.)";
        drawScatterSvg(uc, "ram");
      }

      // Table header
      tableHead.replaceChildren();
      const headRow = document.createElement("tr");
      const extraCol =
        uc.id === "01-tool-agent"
          ? "Trap Safety"
          : uc.id === "04-voice-desk"
          ? "1st Sentence (med / p90)"
          : "Runs";
      ["Setup", "Status", "Pass Rate (95% CI)", "Speed", "Peak RAM", extraCol].forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col;
        headRow.appendChild(th);
      });
      tableHead.appendChild(headRow);

      // Table body
      tableBody.replaceChildren();
      uc.setups.forEach((s) => {
        const tr = document.createElement("tr");
        if (s.setup === selectedSetup) tr.classList.add("is-selected");
        tr.addEventListener("click", () => {
          selectedSetup = s.setup;
          draw();
        });

        const badge = statusBadge(s, uc.id);
        const ramStr = s.peak_rss_gb ? `${s.peak_rss_gb.toFixed(1)} GB RSS` : "pending";
        let extraStr = `${s.runs - s.errors}/${s.runs}`;
        if (uc.id === "01-tool-agent") {
          extraStr = `${s.safety_traps_safe}/${s.safety_traps_total} traps (${s.safety_pct}%)`;
        } else if (uc.id === "04-voice-desk") {
          const med = s.first_sentence_median_ms >= 1000 ? `${(s.first_sentence_median_ms / 1000).toFixed(1)} s` : `${s.first_sentence_median_ms} ms`;
          const p90 = s.first_sentence_p90_ms >= 1000 ? `${(s.first_sentence_p90_ms / 1000).toFixed(1)} s` : `${s.first_sentence_p90_ms} ms`;
          extraStr = `${med} / ${p90}`;
        }

        const cells = [
          { text: s.setup, mono: true, bold: true },
          { badge },
          { text: `${s.pass_pct}% [${s.ci_low_pct}–${s.ci_high_pct}%]`, mono: true },
          { text: s.med_tok_s != null ? `${s.med_tok_s} tok/s` : "—", mono: true },
          { text: ramStr, mono: true },
          { text: extraStr, mono: true },
        ];

        cells.forEach((c) => {
          const td = document.createElement("td");
          if (c.badge) {
            const sp = document.createElement("span");
            sp.className = `badge ${c.badge.cls}`;
            sp.textContent = c.badge.label;
            td.appendChild(sp);
          } else {
            td.textContent = c.text;
            if (c.mono) td.className = "mono";
            if (c.bold) td.style.fontWeight = "600";
          }
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });

      // Inspector
      const sel = uc.setups.find((s) => s.setup === selectedSetup) || uc.setups[0];
      inspectorEl.replaceChildren();
      const selStrong = document.createElement("strong");
      selStrong.textContent = `${sel.setup} (${sel.candidate}, ${sel.weights_gb} GB GGUF, think=${sel.think}): `;
      inspectorEl.appendChild(selStrong);
      let extraDetail = sel.note;
      if (sel.footprint_note) {
        extraDetail += ` Peak footprint note: ${sel.footprint_note}.`;
      }
      inspectorEl.appendChild(document.createTextNode(extraDetail));

      footnoteEl.textContent = `${data.hardware} · ${data.runtime} · ${data.ci_method} · Pending: Bonsai 2 27B (Q2_0) & Claude baseline.`;
    };

    draw();
  };

  const loadData = async () => {
    if (window.location.protocol !== "file:") {
      try {
        const res = await fetch("assets/data/eval-results.json", { cache: "no-cache" });
        if (res.ok) {
          renderExplorer(await res.json());
          return;
        }
      } catch (_) {}
    }
    const fallbackEl = document.getElementById("eval-data-fallback");
    if (fallbackEl && fallbackEl.textContent) {
      renderExplorer(JSON.parse(fallbackEl.textContent));
    }
  };

  loadData();
})();
