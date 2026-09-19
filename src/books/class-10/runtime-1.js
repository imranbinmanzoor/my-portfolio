
      "use strict";
      /* Math layout enhancement, shared by the preview and static reading edition.
       * Native scrolling remains the source of truth. No wheel/touch interception,
       * cloned math, scaled type, or dragging that prevents text selection.
       * CSS alone handles fit/overflow; JS adds accurate focus and transient bars.
       */
      const MathLayout = (() => {
        const known = new Set(),
          pending = new Set(),
          timers = new WeakMap();
        let observer = null,
          frame = 0,
          started = false;
        const isVisible = (el) =>
          !!el.getClientRects().length && el.clientWidth > 0;

        function schedule(shell) {
          if (shell) pending.add(shell);
          if (!frame) frame = requestAnimationFrame(flush);
        }
        function flush() {
          frame = 0;
          const writes = [];
          for (const shell of pending) {
            if (!shell.isConnected) {
              known.delete(shell);
              observer?.unobserve(shell.firstElementChild);
              observer?.unobserve(shell.firstElementChild.firstElementChild);
              continue;
            }
            const scroller = shell.firstElementChild;
            if (!isVisible(scroller)) continue;
            // A one-pixel allowance is for integer rounding, not to hide real content.
            writes.push([
              shell,
              scroller,
              scroller.scrollWidth > scroller.clientWidth + 1,
            ]);
          }
          pending.clear();
          for (const [shell, scroller, wide] of writes) {
            shell.classList.toggle("is-overflowing", wide);
            const control = shell.closest("button,a");
            if (wide && !control) {
              scroller.tabIndex = 0;
              scroller.setAttribute("role", "group");
              scroller.setAttribute("aria-label", "Scrollable mathematics");
              scroller.setAttribute("aria-describedby", "math-scroll-help");
            } else {
              scroller.removeAttribute("tabindex");
              scroller.removeAttribute("role");
              scroller.removeAttribute("aria-label");
              scroller.removeAttribute("aria-describedby");
            }
            if (!wide) {
              scroller.classList.remove("is-scrolling");
              clearTimeout(timers.get(scroller));
            }
          }
        }
        function pulse(scroller) {
          if (!scroller.parentElement.classList.contains("is-overflowing"))
            return;
          scroller.classList.add("is-scrolling");
          clearTimeout(timers.get(scroller));
          timers.set(
            scroller,
            setTimeout(() => scroller.classList.remove("is-scrolling"), 850),
          );
        }
        function bind(shell) {
          if (known.has(shell)) {
            schedule(shell);
            return;
          }
          known.add(shell);
          const s = shell.firstElementChild;
          s.addEventListener("scroll", () => pulse(s), { passive: true });
          s.addEventListener("pointerdown", () => pulse(s), { passive: true });
          s.addEventListener("pointerup", () => pulse(s), { passive: true });
          s.addEventListener("keydown", (event) => {
            if (
              event.target !== s ||
              !shell.classList.contains("is-overflowing")
            )
              return;
            const distance = Math.max(48, s.clientWidth * 0.65);
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const target =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? s.scrollWidth
                  : s.scrollLeft +
                    (event.key === "ArrowLeft" ? -distance : distance);
            s.scrollTo({ left: target, behavior: "auto" });
            pulse(s);
          });
          observer?.observe(s);
          observer?.observe(s.firstElementChild);
          schedule(shell);
        }
        function wrap(node, kind) {
          const shell = document.createElement("span");
          shell.className = "math-" + kind;
          const scroll = document.createElement("span");
          scroll.className = "math-scroll";
          node.replaceWith(shell);
          shell.append(scroll);
          scroll.append(node);
          return shell;
        }
        function enhance(root) {
          if (!root) return;
          init();
          // Never alter KaTeX's internal spans, SVG radicals, or accessibility MathML.
          root.querySelectorAll(".katex-display").forEach((display) => {
            if (!display.parentElement.classList.contains("math-scroll"))
              wrap(display, "display");
          });
          root.querySelectorAll(".katex").forEach((math) => {
            if (
              math.parentElement.closest(".katex,.katex-display,.math-scroll")
            )
              return;
            wrap(math, "inline");
          });
          root.querySelectorAll(".math-display,.math-inline").forEach(bind);
        }
        function refresh() {
          for (const shell of known) schedule(shell);
        }
        function init() {
          if (started) return;
          started = true;
          document.documentElement.classList.add("math-enhanced");
          if (!document.getElementById("math-scroll-help")) {
            const help = document.createElement("span");
            help.id = "math-scroll-help";
            help.className = "visually-hidden";
            help.textContent =
              "Swipe or scroll sideways to read the full expression. With keyboard focus, use Left and Right, or Home and End. Click the expression to reveal its scrollbar.";
            document.body.append(help);
          }
          if (typeof ResizeObserver !== "undefined")
            observer = new ResizeObserver((entries) => {
              for (const entry of entries) {
                const shell = entry.target.closest(
                  ".math-display,.math-inline",
                );
                if (shell) schedule(shell);
              }
            });
          addEventListener("resize", refresh, { passive: true });
          document.fonts?.ready.then(refresh);
          document.fonts?.addEventListener("loadingdone", refresh);
          addEventListener("afterprint", refresh);
        }
        return { enhance, refresh };
      })();

      /* R7.1 — choose four or two columns from rendered option widths, never from
       * TeX source length. Screen and A4 layouts have separate measurements.
       * The off-screen A4 probe uses the same font, gutter and gap rules as print.
       * It is aria-hidden, never interactive, and is removed in the same task.
       */
      const PaperOptionLayout = (() => {
        const watched = new Set();
        let observer,
          frame = 0,
          needPrint = false,
          started = false;
        const visible = (e) =>
          e.isConnected && e.getClientRects().length && e.clientWidth > 0;
        const px = (n) => `${Math.ceil(n * 100) / 100}px`;
        function tracks(widths, available, gap) {
          // One four-track grid for every question. In the two-row layout each option
          // spans two tracks, so b/d begin exactly where c begins in a four-option row.
          // An option must fit ITS quarter, not merely fit in the summed row width.
          const quarter = (available - 3 * gap) / 4;
          const fits = widths.every((width) => width + 3 <= quarter);
          return { count: fits ? 4 : 2, columns: "repeat(4,minmax(0,1fr))" };
        }
        function measure(list) {
          const available = list.getBoundingClientRect().width;
          if (!available) return null;
          const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
          list.classList.add("mcq-measuring");
          const widths = [...list.children].map((li) =>
            Math.max(
              li.querySelector(".pq-option").getBoundingClientRect().width,
              li.querySelector(".pq-option").scrollWidth,
            ),
          );
          list.classList.remove("mcq-measuring");
          if (widths.length !== 4) return null;
          return { ...tracks(widths, available, gap), widths, available, gap };
        }
        function apply(list, result, medium) {
          if (!result) return;
          list.style.setProperty(`--mcq-${medium}-columns`, result.columns);
          list.style.setProperty(
            `--mcq-${medium}-span`,
            result.count === 4 ? "1" : "2",
          );
          list.dataset[medium + "Columns"] = String(result.count);
          if (medium === "screen") {
            list.classList.toggle("is-c4", result.count === 4);
            list.classList.toggle("is-c2", result.count === 2);
          }
        }
        function fitLabelGutters(medium, probe) {
          const values = new Map();
          document.querySelectorAll("#paper-wrap .pq-q").forEach((group) => {
            if (!visible(group)) return;
            const labels = [...group.querySelectorAll(".pq > .pq-n")];
            const floor =
              medium === "print"
                ? 26.6
                : parseFloat(
                    getComputedStyle(group.querySelector(".pq")).fontSize,
                  ) * 1.9;
            let widest = 0;
            for (const label of labels) {
              let measured = label;
              if (probe) {
                measured = document.createElement("span");
                measured.className = "pq-n print-label-measure";
                measured.textContent = label.textContent;
                probe.append(measured);
              }
              const range = document.createRange();
              range.selectNodeContents(measured);
              widest = Math.max(widest, range.getBoundingClientRect().width);
              if (probe) measured.remove();
            }
            const width = px(Math.max(floor, widest + 3));
            values.set(group, width);
            group.style.setProperty("--question-" + medium + "-gutter", width);
          });
          return values;
        }
        function screen(lists) {
          fitLabelGutters("screen");
          for (const list of lists)
            if (visible(list)) apply(list, measure(list), "screen");
        }
        function print(lists) {
          if (!lists.length) return;
          const probe = document.createElement("div");
          probe.className = "practice mcq-print-probe";
          probe.setAttribute("aria-hidden", "true");
          probe.inert = true;
          const paper = document.createElement("div");
          paper.className = "paper";
          probe.append(paper);
          const copies = lists.map((list) => {
            const row = document.createElement("div");
            row.className = "pq";
            const label = document.createElement("span");
            label.className = "pq-n";
            label.textContent = "(i)";
            const body = document.createElement("div");
            body.className = "pq-body";
            const copy = list.cloneNode(true);
            copy.removeAttribute("style");
            copy.removeAttribute("id");
            copy.querySelectorAll("[tabindex],[id]").forEach((e) => {
              e.removeAttribute("tabindex");
              e.removeAttribute("id");
            });
            row.append(label, body);
            body.append(copy);
            paper.append(row);
            return copy;
          });
          document.body.append(probe);
          if (getComputedStyle(probe).display === "none") {
            probe.remove();
            return;
          }
          const gutters = fitLabelGutters("print", probe);
          copies.forEach((copy, i) => {
            const width = gutters.get(lists[i].closest(".pq-q"));
            if (width)
              copy
                .closest(".pq")
                .style.setProperty("--question-print-gutter", width);
          });
          try {
            copies.forEach((copy, i) =>
              apply(lists[i], measure(copy), "print"),
            );
          } finally {
            probe.remove();
          }
        }
        function liveLists() {
          for (const list of watched)
            if (!list.isConnected) {
              observer?.unobserve(list);
              watched.delete(list);
            }
          return [...watched].filter(visible);
        }
        function flush() {
          frame = 0;
          const lists = liveLists();
          screen(lists);
          if (needPrint) {
            needPrint = false;
            print(lists);
          }
          MathLayout.refresh();
        }
        function schedule(withPrint = false) {
          needPrint = needPrint || withPrint;
          if (!frame) frame = requestAnimationFrame(flush);
        }
        function init() {
          if (started) return;
          started = true;
          if (typeof ResizeObserver !== "undefined")
            observer = new ResizeObserver(() => schedule());
          addEventListener("resize", () => schedule(), { passive: true });
          document.fonts?.ready.then(() => schedule(true));
          document.fonts?.addEventListener("loadingdone", () => schedule(true));
          addEventListener("beforeprint", () => print(liveLists()));
          addEventListener("afterprint", () => schedule(true));
        }
        function enhance(root) {
          if (!root?.querySelectorAll) return;
          init();
          root
            .querySelectorAll(".pq-opts[data-option-layout]")
            .forEach((list) => {
              if (list.closest(".mcq-print-probe")) return;
              if (!watched.has(list)) {
                watched.add(list);
                observer?.observe(list);
              }
            });
          schedule(true);
        }
        // Synchronous preparation is used after fonts load, just before window.print.
        function prepare() {
          const lists = liveLists();
          screen(lists);
          print(lists);
        }
        return { enhance, prepare, refresh: () => schedule(true) };
      })();

      const BOOK = JSON.parse(document.getElementById("book-data").textContent);
      const CONTENT = JSON.parse(
        document.getElementById("content-data").textContent,
      );
      const BANKS = JSON.parse(
        document.getElementById("banks-data").textContent,
      );

      let TABS = []; /* tabs for the unit currently open */
      let CURRENT_UNIT = null;
      let updateFade = () => {};
      const motion = () =>
        matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth";
      const escapeHTML = (value) =>
        String(value ?? "").replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[c],
        );
      const pathFor = (unit, tab, target) =>
        `#/unit-${unit}/${tab}` +
        (target ? `/${encodeURIComponent(target)}` : "");
      function stopVideos(root = document) {
        root.querySelectorAll("details.vid[open]").forEach((d) => {
          d.open = false;
          d.querySelector(".vid-frame").replaceChildren();
        });
      }
      function focusTarget(id) {
        const el = document.getElementById(id);
        if (!el) return;
        for (let p = el.parentElement; p; p = p.parentElement)
          if (p.matches("details")) p.open = true;
        typeset(el.closest(".flow-section") || el);
        requestAnimationFrame(() => {
          measureSticky();
          el.tabIndex = -1;
          el.focus({ preventScroll: true });
          el.scrollIntoView({ block: "start", behavior: motion() });
        });
      }

      /* ======================================================================
   BOOK VIEW
   ====================================================================== */
      /* Student-facing contents. Publication state is not learner progress. */
      function uiIcon(name) {
        const paths = {
          down: '<path d="M12 4v15m-6-6 6 6 6-6"/>',
          plus: '<path d="M5 12h14"/><path class="icon-vertical" d="M12 5v14"/>',
          minus: '<path d="M5 12h14"/>',
          arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
          back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
          book: '<path d="M12 6v15m0-15C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2Z"/>',
          print:
            '<path d="M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v8H6Z"/><path d="M17 11h1"/>',
          code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/>',
          close: '<path d="m6 6 12 12M18 6 6 18"/>',
          refresh:
            '<path d="M20 7v5h-5M4 17v-5h5M5.5 7a7 7 0 0 1 11.5-2L20 8M4 16l3 3a7 7 0 0 0 11.5-2"/>',
          search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
          check: '<path d="m5 12 4 4L19 6"/>',
          chevron: '<path d="m6 9 6 6 6-6"/>',
          save: '<path d="M5 3h12l3 3v15H4V3Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
          download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
        };
        return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.arrow}</svg>`;
      }
      function homeHTML() { return document.getElementById("book-overview").innerHTML; }
      function renderBook() {
        document.getElementById("book-main").innerHTML = homeHTML();
        const main = document.getElementById("book-main"),
          head = main.querySelector(".library-top");
        let mast = document.getElementById("book-masthead");
        if (!mast) {
          mast = document.createElement("div");
          mast.id = "book-masthead";
          mast.className = "library-masthead";
          main.before(mast);
        }
        head.classList.add("wrap");
        mast.replaceChildren(head);
        const input = document.getElementById("unit-filter"),
          clear = document.getElementById("unit-filter-clear");
        const filter = () => {
          const term = input.value.trim().toLowerCase();
          let found = 0;
          document.querySelectorAll("[data-unit-search]").forEach((el) => {
            el.hidden = !el.dataset.unitSearch.toLowerCase().includes(term);
            if (!el.hidden) found++;
          });
          document.getElementById("unit-empty").hidden = found > 0;
          document.getElementById("unit-filter-status").textContent = term
            ? `${found} matching unit${found === 1 ? "" : "s"}.`
            : "";
          clear.hidden = !input.value;
        };
        input.addEventListener("input", filter);
        clear.addEventListener("click", () => {
          input.value = "";
          filter();
          input.focus();
        });
      }
      /* Recolor mathematical annotations only at presentation time. Content, bank
       * signatures and P4 snapshots retain their R6 identity. */
      function themeMath(text) {
        const colors = {
          "#115442": "#2447A8",
          "#fffdf8": "#FFFFFF",
          "#186b53": "#2447A8",
          "#0c3f31": "#18367F",
          "#a8501c": "#6741A5",
          "#7d3910": "#53318C",
          "#fdf8ef": "#F6F8FC",
          "#f8f1e4": "#F2F5FA",
        };
        return reasonStyle(
          String(text).replace(/(\$\$?)([\s\S]*?)\1/g, (match, delimiter, tex) =>
            delimiter + tex.replace(/\b(Re|Im)(?=\s*\()/g, "\\operatorname{$1}") + delimiter,
          ).replace(
            /#[0-9a-fA-F]{6}\b/g,
            (c) => colors[c.toLowerCase()] || c,
          ),
        );
      }
      /* R7: a single TeX \small declaration, a thin pale-blue frame, no fill.
       * Balanced groups preserve the actual formula and nested explanatory math.
       * Handles R5 author output and R6 boxes; the operation is idempotent. */
      function reasonStyle(text) {
        function group(s, start) {
          while (/\s/.test(s[start] || "") && start < s.length) start++;
          if (s[start] !== "{") return null;
          let depth = 1,
            j = start + 1;
          for (; j < s.length; j++) {
            if (s[j] === "\\") {
              j++;
              continue;
            }
            if (s[j] === "{") depth++;
            if (s[j] === "}" && --depth === 0)
              return [s.slice(start + 1, j), j + 1];
          }
          return null;
        }
        const pattern = /&&\s*\\(fcolorbox|textcolor)\s*/g;
        let out = "",
          from = 0,
          m;
        while ((m = pattern.exec(text))) {
          let at = pattern.lastIndex,
            g = group(text, at);
          if (!g) continue;
          at = g[1];
          if (m[1] === "fcolorbox") {
            g = group(text, at);
            if (!g) continue;
            at = g[1];
          }
          g = group(text, at);
          if (!g) continue;
          let body = g[0],
            end = g[1];
          body = body.replace(
            /^\s*\\(?:tiny|scriptsize|footnotesize|small|normalsize)\s*/,
            "",
          );
          if (body.startsWith("\\textcolor")) {
            const color = group(body, "\\textcolor".length),
              value = color && group(body, color[1]);
            if (value && !body.slice(value[1]).trim()) body = value[0];
          }
          body = body.trim().replace(/^\$(.*)\$$/s, "$1");
          out +=
            text.slice(from, m.index) +
            "&& \\fcolorbox{#9BB0DE}{transparent}{\\small\\textcolor{#4F6FAE}{$" +
            body +
            "$}}";
          from = end;
          pattern.lastIndex = end;
        }
        return out + text.slice(from);
      }

      /* Display-math punctuation is authored, not automatically inserted at runtime.
       * Old stored keys may carry terminal punctuation. Remove only a terminal mark,
       * including one just before the final alignment close; never alter decimals,
       * coordinate separators, conditions or inline sentence punctuation. */
      function practiceWorkingHTML(html) {
        return String(html).replace(/\$\$([\s\S]*?)\$\$/g, (_, raw) => {
          const math = raw
            .replace(/\\mathrm\{(Re|Im)\}/g, "\\operatorname{$1}")
            .replace(
              /[.,;:]\s*(?=(?:\\end\{(?:aligned|gathered)\})?\s*$)/g,
              "",
            );
          return "$$" + math + "$$";
        });
      }

      /* ======================================================================
   UNIT VIEW : content rendering
   ====================================================================== */
      function stepsHTML(list) {
        return (
          `<ol class="steps">` +
          list
            .map(
              (s) =>
                `<li><div class="swhy">${s.why}</div><div class="smath">$$${s.math}$$</div></li>`,
            )
            .join("") +
          `</ol>`
        );
      }
      /* A working stage couples its introduction to the calculation it explains.
       * The content validator requires a meaningful introduction for each display.
       * Alignment is local to a mathematical task; this renderer never merges arrays. */
      function writtenHTML(blocks, id = "") {
        if (!blocks?.length) return "";
        const stages = [];
        let stage = [];
        const flush = () => {
          if (stage.length) {
            stages.push(`<div class="working-stage">${stage.join("")}</div>`);
            stage = [];
          }
        };
        for (const b of blocks) {
          if (b.say) {
            flush();
            stage.push(`<p class="w-say">${b.say}</p>`);
          } else if (b.math)
            stage.push(
              `<div class="w-math" data-working-role="${b.role || "authored"}">$$${b.math}$$</div>`,
            );
        }
        flush();
        return `<div class="written"${id ? ` id="${id}"` : ""}>
    <div class="written-head">Compact solution</div>
    <div class="written-body">${stages.join("")}</div></div>`;
      }
      function notesHTML(n) {
        if (!n) return "";
        const bits = [],
          labels = [];
        if (n.check) {
          bits.push(`<div class="note"><span class="lbl">Check the answer</span>
      <div class="smath">$$${n.check.math}$$</div><div>${n.check.why}</div></div>`);
          labels.push("check");
        }
        if (n.watchOut) {
          bits.push(
            `<div class="note watch"><span class="lbl">Watch out</span>${n.watchOut}</div>`,
          );
          labels.push("common mistake");
        }
        if (n.shortcut) {
          bits.push(
            `<div class="note"><span class="lbl">Alternative method</span>${n.shortcut}</div>`,
          );
          labels.push("shortcut");
        }
        if (n.alsoAcceptable) {
          bits.push(
            `<div class="note"><span class="lbl">Also correct</span>${n.alsoAcceptable}</div>`,
          );
          labels.push("other forms");
        }
        if (n.insight) {
          bits.push(
            `<div class="note"><span class="lbl">Observation</span>${n.insight}</div>`,
          );
          labels.push("insight");
        }
        if (!bits.length) return "";
        return `<details class="notes"><summary>${labels.map((x) => ({ check: "Check", "common mistake": "Common mistake", shortcut: "Alternative method", "other forms": "Other forms", insight: "Observation" })[x]).join(" · ")}</summary>
          <div class="notesin">${bits.join("")}</div></details>`;
      }
      /* The video lives INSIDE the solution, at the bottom, under the working it
   repeats. Beside the solution it wins every time: a video is one click and no
   effort, so the written steps stop being read at all. Underneath, the reading
   comes first and the video is what a student reaches for when the reading did
   not land. Same content, opposite habit.
   The content file stores the bare video id, never an embed URL and never a
   pasted <iframe>. Building the player here is what keeps privacy mode, the
   aspect ratio, the accessible name and lazy loading in one place. */
      const VIDEO = {
        youtube: {
          site: "YouTube",
          embed: (v) =>
            `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?rel=0&modestbranding=1${v.start ? `&start=${encodeURIComponent(v.start)}` : ""}`,
          page: (v) =>
            `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`,
        },
        vimeo: {
          site: "Vimeo",
          embed: (v) =>
            `https://player.vimeo.com/video/${encodeURIComponent(v.id)}${v.start ? `#t=${encodeURIComponent(v.start)}s` : ""}`,
          page: (v) => `https://vimeo.com/${encodeURIComponent(v.id)}`,
        },
      };
      /* Not every video is sixteen by nine. A screen recording from a sixteen by ten
   laptop is not, and the player letterboxes anything whose box is the wrong
   shape, which is where black bars come from. `aspect` is the video's own
   shape, so the box can be cut to fit it and the picture fills the box exactly.
   Nothing is scaled and nothing is cropped. Default sixteen by nine. */
      function videoFit(v) {
        const a = v.aspect;
        if (!Array.isArray(a) || a.length !== 2 || !(a[0] > 0) || !(a[1] > 0))
          return "";
        return ` style="aspect-ratio:${a[0]}/${a[1]}"`;
      }
      function videoHTML(v) {
        if (!v || !v.id) return "";
        const host = VIDEO[v.kind] || VIDEO.youtube;
        const label = v.title || "Video solution";
        /* The summary is typeset, so its title may carry LaTeX. An iframe title is
     an attribute and is never typeset, so it gets the delimiters stripped. */
        const name = label.replace(/[$\\{}]/g, "").replace(/"/g, "&quot;");
        return `<details class="vid">
    <summary><span class="vid-play" aria-hidden="true"></span>
      <span class="vid-lab">${label}</span>
      ${v.duration ? `<span class="vid-dur">${v.duration}</span>` : ""}</summary>
    <div class="vidin">
      <div class="vid-frame"${videoFit(v)} data-src="${host.embed(v).replace(/&/g, "&amp;")}" data-title="${name}"></div>
      <p class="vid-alt"><a href="${host.page(v)}" target="_blank" rel="noopener">Open this video on ${host.site}</a> if it does not play here.</p>
    </div></details>`;
      }
      /* The player is created when the panel opens and destroyed when it closes.
   Forty parts therefore cost nothing until a student asks for one, and
   shutting the panel stops the sound, which is what shutting it means.
   Closing the whole solution has to stop it too. Now that the video sits
   inside the solution, collapsing the solution would otherwise leave a player
   running out of sight, and a student hears a voice with nothing on screen. */
      function wireVideos(root) {
        root.querySelectorAll("details.vid").forEach((d) => {
          const box = d.querySelector(".vid-frame");
          const sol = d.closest("details.sol");
          if (sol)
            sol.addEventListener("toggle", () => {
              if (!sol.open) d.open = false;
            });
          d.addEventListener("toggle", () => {
            if (!d.open) {
              box.textContent = "";
              return;
            }
            if (box.firstChild) return;
            const f = document.createElement("iframe");
            f.src = box.dataset.src;
            f.title = box.dataset.title;
            f.loading = "lazy";
            f.allow =
              "clipboard-write; encrypted-media; picture-in-picture; web-share";
            f.referrerPolicy = "strict-origin-when-cross-origin";
            f.allowFullscreen = true;
            box.appendChild(f);
          });
        });
      }
      function partHTML(p) {
        const q = p.question
          ? `<div class="qline"><span class="plabel">${p.label || ""}</span><span>${p.question}</span></div>`
          : "";
        return `<article class="part"${p.id ? ` id="${p.id}"` : ""}>${q}
    <details class="sol"><summary>Solution</summary><div class="solin">
      ${p.givens ? `<div class="given-system"><p>The given equations are</p><div class="smath">$$${p.givens}$$</div></div>` : ""}
      ${p.written?.length ? `<div class="solution-tools"><a href="${pathFor(CURRENT_UNIT, PART_TABS[p.id] || currentTabId(), p.id + "-compact")}" data-focus-target="${p.id}-compact">Compact solution ${uiIcon("down")}</a></div>` : ""}
      ${stepsHTML(p.steps)}
      <div class="ans"><b>Answer</b><span>${p.answer}</span></div>
      ${writtenHTML(p.written, p.id ? p.id + "-compact" : "")}
      ${videoHTML(p.video)}
      ${notesHTML(p.notes)}
    </div></details></article>`;
      }
      function blockHTML(label, stem, parts, isExample, id = "") {
        return `<section class="qblock"${id ? ` id="${id}" aria-labelledby="${id}-heading"` : ""}>
    <div class="grp"><h3 class="qn${isExample ? " is-example" : ""}"${id ? ` id="${id}-heading"` : ""}>${label}</h3></div>
    ${stem ? `<p class="stem">${stem}</p>` : ""}
    ${parts.map(partHTML).join("")}</section>`;
      }

      /* Concepts is ONE section: definitions, then explanations, then the extras. */
      function conceptsHTML(d, pid) {
        let h = `<section class="flow-section" id="${pid}-concepts"><header class="flow-head"><h2>Concepts</h2>
    </header>`;
        (d.definitions || []).forEach((def) => {
          h += `<div class="defn" id="${def.id}"><span class="defn-tag">${def.kind || (def.term.includes("Properties") || def.term.includes("parts of") || def.term.includes("Adding") || def.term.includes("Multiplying") || def.term.includes("Dividing") ? "Rule" : "Definition")}</span>
      <h3>${def.term}</h3>
      <div class="defn-body"><p>${def.statement}</p></div>
      ${def.notes && def.notes.length ? `<div class="defn-note">${def.notes.map((n) => `<p>${n}</p>`).join("")}</div>` : ""}
      ${
        def.examples && def.examples.length
          ? `<div class="eg"><span class="lbl">Examples</span>
        <ul role="list">${def.examples.map((e) => `<li>${e}</li>`).join("")}</ul></div>`
          : ""
      }</div>`;
        });
        /* Why it works holds the derivations AND the history. Both are theory, so
     they belong in one place rather than two separate disclosures. Closed by
     default, with a prominent full-width trigger. */
        const deep = (d.whyItWorks || []).concat(d.history || []);
        if (deep.length) {
          h +=
            `<details class="deep"><summary>
        <span class="deep-txt">
          <span class="deep-t">Deep understanding</span>

        </span>
        <span class="deep-x" aria-hidden="true">${uiIcon("plus")}</span>
      </summary><div class="deep-in">` +
            deep
              .map(
                (u) =>
                  `<section class="deep-section" id="${u.id}"><h3>${u.title}</h3>` +
                  u.body.map((b) => `<p>${b}</p>`).join("") +
                  (u.rule
                    ? `<div class="rule"><b>Rule.</b> ${u.rule.statement}<br>${u.rule.example}</div>`
                    : "") +
                  `</section>`,
              )
              .join("") +
            `</div></details>`;
        }
        return h + `</section>`;
      }

      function exercisePanel(d, pid) {
        let h = `<nav class="local-jump" aria-label="Inside Exercise ${d.exercise}">
      <div class="seg">
        <a href="${pathFor(CURRENT_UNIT, pid, pid + "-concepts")}" data-target="${pid}-concepts">Concepts</a>
        <a href="${pathFor(CURRENT_UNIT, pid, pid + "-examples")}" data-target="${pid}-examples">Examples</a>
        <a href="${pathFor(CURRENT_UNIT, pid, pid + "-exercise")}" data-target="${pid}-exercise">Exercise</a>
      </div></nav>`;
        h += conceptsHTML(d, pid);
        h += `<section class="flow-section" id="${pid}-examples"><header class="flow-head"><h2>Examples</h2>
        </header>`;
        d.examples.forEach((e) => {
          h += blockHTML(e.label, e.stem, e.parts, true, e.id);
        });
        h += `</section><section class="flow-section" id="${pid}-exercise"><header class="flow-head"><h2>Exercise ${d.exercise}</h2></header>`;
        d.questions.forEach((q) => {
          h += blockHTML("Question " + q.number, q.stem, q.parts, false, q.id);
        });
        return h + `</section>`;
      }

      /* ======================================================================
   REVIEW EXERCISE
   ====================================================================== */
      const ROMAN_UC = (n) => ["I", "II", "III", "IV"][n] || String(n + 1);
      const ROMAN = (n) => {
        let v = n + 1,
          out = "";
        for (const [a, b] of [
          [1000, "m"],
          [900, "cm"],
          [500, "d"],
          [400, "cd"],
          [100, "c"],
          [90, "xc"],
          [50, "l"],
          [40, "xl"],
          [10, "x"],
          [9, "ix"],
          [5, "v"],
          [4, "iv"],
          [1, "i"],
        ])
          while (v >= a) {
            out += b;
            v -= a;
          }
        return out;
      };
      const KEYS = ["a", "b", "c", "d"];

      /* An MCQ behaves like an online test: tap an option and it answers back at
   once, marking your choice and showing the correct one. The solution below
   holds the working and nothing else. There is no separate answer box, because
   the marked option already is the answer, and no list of why the other three
   fail: the working shows what the right method is, and three paragraphs of
   wrong method after it is the last thing a student needs to read. */
      function mcqHTML(pt, n) {
        const opts = pt.options
          .map(
            (o, i) =>
              `<li><button type="button" data-q="${pt.id}" data-i="${i}">
        <span class="mcq-k">${KEYS[i]}</span><span>${o}</span></button></li>`,
          )
          .join("");
        return `<article class="part" id="${pt.id}" data-correct="${pt.correct}">
    <div class="qline"><span class="plabel">(${n})</span><span>${pt.question}</span></div>
    ${pt.sourceNote ? `<p class="source-note">${pt.sourceNote}</p>` : ""}
    <ul role="list" class="mcq-opts">${opts}</ul>
    <div class="mcq-verdict" role="status" aria-live="polite" hidden>
      <span class="mcq-msg"></span>
      <button type="button" class="mcq-retry">Clear selection</button>
    </div>
    <details class="sol" hidden><summary>Solution</summary><div class="solin">
      ${writtenHTML(pt.written, pt.id + "-compact")}
      ${videoHTML(pt.video)}
      ${notesHTML(pt.notes)}
    </div></details></article>`;
      }

      function wireMCQs(root) {
        root.querySelectorAll(".part[data-correct]").forEach((part) => {
          const opts = [...part.querySelectorAll(".mcq-opts button")];
          const correct = Number(part.dataset.correct);
          const verdict = part.querySelector(".mcq-verdict");
          const msg = part.querySelector(".mcq-msg");
          const sol = part.querySelector("details.sol");

          /* The solution stays out of sight until a choice is made, so the student
       cannot read the working before committing to an answer. The video is
       inside it, so it is covered by the same rule with no extra code. */
          const clear = () => {
            opts.forEach((b) => {
              b.disabled = false;
              b.classList.remove("right", "wrong");
            });
            verdict.hidden = true;
            verdict.className = "mcq-verdict";
            msg.textContent = "";
            sol.hidden = true;
            sol.open = false;
          };

          opts.forEach((btn, picked) =>
            btn.addEventListener("click", () => {
              opts.forEach((b, i) => {
                b.disabled = true;
                b.classList.remove("right", "wrong");
                if (i === correct) b.classList.add("right");
                else if (i === picked) b.classList.add("wrong");
              });
              verdict.hidden = false;
              verdict.className =
                "mcq-verdict " + (picked === correct ? "ok" : "no");
              msg.textContent =
                picked === correct
                  ? "Correct."
                  : `Not correct. The right answer is (${KEYS[correct]}).`;
              sol.hidden = false;
            }),
          );

          part.querySelector(".mcq-retry").addEventListener("click", () => {
            clear();
            opts[0]?.focus();
          });
        });
      }

      function reviewPanel(d, pid) {
        const roman = ROMAN;
        let h = `<nav class="local-jump" aria-label="Inside the review exercise">
      <div class="seg">
        <a href="${pathFor(CURRENT_UNIT, pid, pid + "-mcq")}" data-target="${pid}-mcq">Multiple choice</a>
        <a href="${pathFor(CURRENT_UNIT, pid, pid + "-written")}" data-target="${pid}-written">Written</a>
      </div></nav>`;

        h += `<section class="flow-section" id="${pid}-mcq"><header class="flow-head"><h2>Multiple choice</h2>
        <p class="lede">${d.intro}</p></header>`;
        const mcqSet = d.questions.find((q) => q.type === "mcq-set");
        if (mcqSet) {
          /* Same heading shape as every other question block. Building it by hand
       here is what made Question 1 look different from Questions 2 and 3. */
          h += `<section class="qblock" id="${mcqSet.id}" aria-labelledby="${mcqSet.id}-heading">
      <div class="grp"><h3 class="qn" id="${mcqSet.id}-heading">Question ${mcqSet.number}</h3></div>
      <p class="stem">${mcqSet.stem}</p>
      ${mcqSet.parts.map((pt, i) => mcqHTML(pt, roman(i))).join("")}</section>`;
        }
        h += `</section><section class="flow-section" id="${pid}-written"><header class="flow-head"><h2>Written questions</h2></header>`;
        d.questions
          .filter((q) => q.type !== "mcq-set")
          .forEach((q) => {
            h += blockHTML(
              "Question " + q.number,
              q.stem,
              q.parts,
              false,
              q.id,
            );
          });
        (d.stubs || []).forEach((st) => {
          h += `<section class="qblock">
      <div class="grp"><span class="qn">Question ${st.number}</span></div>
      <article class="part"><div class="qline"><span>${st.stem}</span></div>
        <div class="placeholder" style="margin-top:var(--space-3);padding:var(--space-4)">
          <p style="margin:0">Solution not written yet.</p></div></article></section>`;
        });
        return h + `</section>`;
      }

      /* ======================================================================
   PAPER
   A paper is one plain object: a head, then a list of sections. The question
   paper and the marking key are two renderings of that same object, so the
   key cannot drift out of step with the questions it marks.
   ====================================================================== */
@@SOURCE(src/scripts/practice-engine.js)@@
@@SOURCE(src/scripts/practice-ui.js)@@
      /* ======================================================================
   UNIT VIEW : assembly
   ====================================================================== */
      function buildUnit(n) {
        const u = BOOK.units.find((x) => x.n === n);
        if (!u) return false;
        CURRENT_UNIT = n;

        document.title = `Unit ${n} · ${u.title} : Class 10 Mathematics`;
        document.getElementById("crumb-unit").textContent =
          `Unit ${n} · ${u.title}`;
        document.getElementById("unit-title").innerHTML =
          `<span class="u-n">Unit ${n}</span> &middot; ${u.title}`;
        const first = u.exercises[0],
          last = u.exercises[u.exercises.length - 1];
        document.getElementById("q-help").textContent =
          `Search concepts, examples, and solutions across this unit.`;
        document.getElementById("q").value = "";
        document.getElementById("q-count").textContent = "";
        document.getElementById("q-clear").hidden = true;

        buildIndex(n);
        document.getElementById("results").hidden = true;
        document.getElementById("results").replaceChildren();
        document.getElementById("panels").hidden = false;
        document.getElementById("tabsWrap").hidden = false;
        TABS = u.exercises
          .map((e) => ({
            id: "ex" + e.replace(".", ""),
            label: "Exercise " + e,
            ex: e,
          }))
          .concat([
            { id: "review", label: "Review Exercise" },
            { id: "generator", label: "Practice" },
          ]);

        const tl = document.getElementById("tablist");
        tl.innerHTML = "";
        const ps = document.getElementById("panels");
        ps.innerHTML = "";

        TABS.forEach((t, i) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.setAttribute("role", "tab");
          btn.id = `tab-${t.id}`;
          btn.setAttribute("aria-controls", `panel-${t.id}`);
          btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
          btn.tabIndex = i === 0 ? 0 : -1;
          btn.textContent = t.label;
          tl.appendChild(btn);

          const panel = document.createElement("div");
          panel.setAttribute("role", "tabpanel");
          panel.id = `panel-${t.id}`;
          panel.setAttribute("aria-labelledby", `tab-${t.id}`);
          panel.tabIndex = 0;
          if (i !== 0) panel.hidden = true;
          const per = CONTENT[n] || {};
          let html;
          if (t.ex && per[t.ex]) html = exercisePanel(per[t.ex], t.id);
          else if (t.id === "review" && per["Review " + n])
            html = reviewPanel(per["Review " + n], t.id);
          else if (t.id === "generator") html = generatorPanel(n, BANKS[n]);
          else
            html = `<div class="placeholder"><h3>${t.label}</h3>
         <p>Not written yet. This panel is wired and will fill in as the content is authored.</p></div>`;
          panel.innerHTML = html;
          wireMCQs(panel);
          wireVideos(panel);
          wireDisclosures(panel);
          ps.appendChild(panel);
        });
        return true;
      }

      /* ======================================================================
   Sticky measurement, stuck shadows, fade, scrollspy, search
   ====================================================================== */
      function measureSticky() {
        const tabs = document.getElementById("tabsWrap");
        document.documentElement.style.setProperty(
          "--sticky-tabs",
          (tabs.offsetParent === null
            ? 0
            : Math.ceil(tabs.getBoundingClientRect().height)) + "px",
        );
        const jump =
          document.querySelector(
            '[role="tabpanel"]:not([hidden]) .local-jump',
          ) ||
          document.querySelector(
            "#practice-workspace:not([hidden]) .paper-return",
          );
        /* Round up. A fractional height leaves a hairline gap and content shows
     through between the two sticky bars. */
        document.documentElement.style.setProperty(
          "--sticky-jump",
          jump ? Math.ceil(jump.getBoundingClientRect().height) + "px" : "0px",
        );
      }

      let observers = [];
      function watchStuck() {
        observers.forEach((o) => o.disconnect());
        observers = [];
        const cs = getComputedStyle(document.body);
        const tabsH = parseInt(cs.getPropertyValue("--sticky-tabs")) || 0;
        const jumpH = parseInt(cs.getPropertyValue("--sticky-jump")) || 0;
        document.querySelectorAll(".local-jump, .grp").forEach((el) => {
          const offset = SiteScroll.top + (parseFloat(cs.getPropertyValue("--breadcrumb-height")) || 0) + tabsH + (el.classList.contains("grp") ? jumpH : 0);
          const io = new IntersectionObserver(
            ([e]) => {
              /* intersectionRatio < 1 alone also fires for anything still below the
         fold, so require the element to have passed the sticky line too. */
              const passed =
                e.rootBounds && e.boundingClientRect.top <= e.rootBounds.top;
              el.classList.toggle(
                "is-stuck",
                e.intersectionRatio < 1 && !!passed,
              );
            },
            { rootMargin: `-${offset + 1}px 0px 0px 0px`, threshold: [1] },
          );
          io.observe(el);
          observers.push(io);
        });
      }

      function wireTabFade() {
        const shell = document.getElementById("tabsShell");
        const strip = document.getElementById("tablist");
        const update = () => {
          const max = strip.scrollWidth - strip.clientWidth;
          shell.classList.toggle("more-left", strip.scrollLeft > 2);
          shell.classList.toggle("more-right", strip.scrollLeft < max - 2);
        };
        strip.addEventListener("scroll", update, { passive: true });
        addEventListener("resize", update, { passive: true });
        update();
        return update;
      }

      let spyHandler = null;
      function wireScrollSpy() {
        if (spyHandler) SiteScroll.off(spyHandler);
        const panel = document.querySelector('[role="tabpanel"]:not([hidden])');
        if (!panel) return;
        const links = [...panel.querySelectorAll(".local-jump a")];
        const sections = links
          .map((a) => document.getElementById(a.dataset.target))
          .filter(Boolean);
        if (!sections.length) return;
        spyHandler = () => {
          const cs = getComputedStyle(document.body);
          /* The line must match where an anchored section actually lands, which is
       the sticky height plus its own scroll-margin-top. */
          const margin =
            parseInt(getComputedStyle(sections[0]).scrollMarginTop) || 0;
          const line = SiteScroll.top + Math.max(
            (parseInt(cs.getPropertyValue("--sticky-tabs")) || 0) +
              (parseInt(cs.getPropertyValue("--sticky-jump")) || 0) +
              8,
            margin + 4,
          );
          let current = sections[0];
          for (const s of sections)
            if (s.getBoundingClientRect().top <= line) current = s;
          if (
            SiteScroll.height + SiteScroll.y >=
            SiteScroll.extent - 4
          )
            current = sections[sections.length - 1];
          links.forEach((a) =>
            a.setAttribute(
              "aria-current",
              a.dataset.target === current.id ? "true" : "false",
            ),
          );
        };
        SiteScroll.on(spyHandler);
        spyHandler();
      }

      /* ======================================================================
   SEARCH
   Builds an index once per unit from the authored content, so it finds items
   in exercises that are not the panel currently open. Scope is every exercise
   plus the review exercise. Generated papers are excluded on purpose: those
   are assessment, and searching them would leak answers.
   ====================================================================== */
      let INDEX = [];

      function searchPreview(html) {
        const d = document.createElement("div"); d.innerHTML = String(html || "");
        return d.textContent.replace(/\s+/g, " ").trim();
      }

      function plain(html) {
        const d = document.createElement("div");
        d.innerHTML = String(html || "").replace(/\$\$?/g, " ");
        return d.textContent.replace(/\s+/g, " ").trim();
      }

      const PART_TABS = {};
      function buildIndex(unit) {
        INDEX = [];
        const perUnit = CONTENT[unit] || {};
        for (const [ex, d] of Object.entries(perUnit)) {
          const tabId =
            d.kind === "review" ? "review" : "ex" + ex.replace(".", "");
          const where =
            d.kind === "review" ? "Review Exercise" : "Exercise " + ex;

          (d.definitions || []).forEach((def) =>
            INDEX.push({
              tab: tabId,
              where: `${where} · Concepts`,
              id: def.id,
              text: `${def.term} ${plain(def.statement)} ${(def.notes || []).map(plain).join(" ")} ${(def.examples || []).map(plain).join(" ")}`,
              show: def.term,
            }),
          );

          (d.whyItWorks || []).forEach((u) =>
            INDEX.push({
              tab: tabId,
              where: `${where} · Concepts`,
              id: u.id,
              text: `${u.title} ${u.body.map(plain).join(" ")}`,
              show: u.title,
            }),
          );

          ["examples", "questions"].forEach((g) =>
            (d[g] || []).forEach((q) => {
              const label = g === "examples" ? q.label : "Question " + q.number;
              (q.parts || []).forEach((pt) => {
                PART_TABS[pt.id] = tabId;
                const body =
                  `${label} ${pt.label || ""} ${plain(q.stem)} ${plain(pt.question)} ${plain(pt.answer)} ` +
                  (pt.type === "mcq" ? [] : pt.steps || [])
                    .map((st) => plain(st.why) + " " + st.math)
                    .join(" ") +
                  " " +
                  (pt.options || []).map(plain).join(" ") +
                  " " +
                  plain(JSON.stringify(pt.notes || {})) +
                  " " +
                  plain(JSON.stringify(pt.written || []));
                INDEX.push({
                  tab: tabId,
                  where: `${where} · ${label}`,
                  id: pt.id || null,
                  text: body,
                  show: `${label} ${pt.label || ""} ${searchPreview(pt.question) || searchPreview(q.stem)}`.trim(),
                });
              });
            }),
          );
        }
      }

      function runSearch() {
        const input = document.getElementById("q");
        const clear = document.getElementById("q-clear");
        const count = document.getElementById("q-count");
        const box = document.getElementById("results");
        const panels = document.getElementById("panels");
        const term = input.value.trim().toLowerCase();

        clear.hidden = !input.value;
        if (term.length < 2) {
          box.hidden = true;
          box.innerHTML = "";
          panels.hidden = false;
          document.getElementById("tabsWrap").hidden = false;
          count.textContent = "";
          return;
        }
        const normalize = (t) =>
          String(t)
            .toLowerCase()
            .replace(/[{}\s$]/g, "")
            .replace(/−/g, "-");
        const matches = INDEX.filter(
          (r) =>
            r.text.toLowerCase().includes(term) ||
            normalize(r.text).includes(normalize(term)),
        );
        const hits = matches.slice(0, 60);
        count.textContent =
          hits.length === 0
            ? "Nothing found in this unit."
            : hits.length === 1
              ? "1 result"
              : `${matches.length} results${matches.length > 60 ? " (showing the first 60)" : ""}`;
        stopVideos();
        panels.hidden = true;
        document.getElementById("tabsWrap").hidden =
          true; /* results are not inside a tab */
        box.hidden = false;
        box.innerHTML = hits.length
          ? `<div class="res-head"><h2>Results for &ldquo;${escapeHTML(input.value)}&rdquo;</h2>
         <button class="res-clear" type="button" id="res-back">Back to the unit</button></div>
       <ul role="list" class="res-list">` +
            hits
              .map(
                (r, i) =>
                  `<li class="res-item"><a href="#" data-i="${i}">
           <span class="res-where">${escapeHTML(r.where)}</span>
           <span class="res-text">${escapeHTML(r.show)}</span></a></li>`,
              )
              .join("") +
            `</ul>`
          : `<div class="res-head"><h2>No results</h2>
         <button class="res-clear" type="button" id="res-back">Back to the unit</button></div>
       <div class="res-none">Nothing in this unit matches that. Try a shorter word,
       or a symbol such as <code>sqrt</code> or <code>conjugate</code>.</div>`;

        typeset(box);
        const back = document.getElementById("res-back");
        if (back)
          back.addEventListener("click", () => {
            input.value = "";
            runSearch();
            input.focus();
          });
        box.querySelectorAll(".res-item a").forEach((a) =>
          a.addEventListener("click", (e) => {
            e.preventDefault();
            const r = hits[Number(a.dataset.i)];
            input.value = "";
            runSearch();
            selectTab(r.tab, { target: r.id });
            if (r.id) focusTarget(r.id);
          }),
        );
      }

      function wireSearch() {
        const input = document.getElementById("q");
        const clear = document.getElementById("q-clear");
        let t;
        input.addEventListener("input", () => {
          clear.hidden = !input.value;
          clearTimeout(t);
          t = setTimeout(runSearch, 140);
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            input.value = "";
            runSearch();
          }
        });
        clear.addEventListener("click", () => {
          input.value = "";
          runSearch();
          input.focus();
        });
      }

      function markWideCompacts() {
        MathLayout.refresh();
      }

      /* ======================================================================
   Tabs
   ====================================================================== */
      /* Where the reader lands after switching exercise.

   If the unit heading was still on screen when they clicked, they were at the
   top of the unit, not deep inside an exercise. Leave the page where it is:
   jumping them down to Concepts would be an unasked-for move.

   If they were reading deep inside an exercise, put the new exercise's first
   section directly under the sticky bars, so the nav stays put and they land at
   Concepts rather than back beside the unit heading. */
      function landOnPanel(panel, wasAtTop) {
        if (wasAtTop || !panel) return;
        markWideCompacts();
        const cs = getComputedStyle(document.body);
        const stuck =
          (parseFloat(cs.getPropertyValue("--breadcrumb-height")) || 0) +
          (parseFloat(cs.getPropertyValue("--sticky-tabs")) || 0) +
          (parseFloat(cs.getPropertyValue("--sticky-jump")) || 0);
        const first = panel.querySelector(".flow-section") || panel;
        const y =
          SiteScroll.y + first.getBoundingClientRect().top - SiteScroll.top - stuck - 8;
        SiteScroll.to({ top: Math.max(0, y), behavior: "auto" });
      }

      function keepSelectedTabVisible() {
        const strip = document.getElementById("tablist"),
          btn = strip?.querySelector('[aria-selected="true"]');
        if (!btn || !strip.clientWidth) return;
        const br = btn.getBoundingClientRect(),
          sr = strip.getBoundingClientRect();
        if (br.left < sr.left) strip.scrollLeft += br.left - sr.left - 12;
        else if (br.right > sr.right)
          strip.scrollLeft += br.right - sr.right + 12;
      }

      function selectTab(
        id,
        {
          focus = false,
          keepScroll = false,
          writeHistory = true,
          target = null,
        } = {},
      ) {
        if (!TABS.some((t) => t.id === id)) return;
        stopVideos();
        /* Read the position BEFORE the swap. Hiding one panel and showing another
     changes the document height, and the browser clamps the scroll position, so
     afterwards everybody looks as though they were at the top. */
        const mast = document.querySelector(".masthead");
        const wasAtTop = !mast || mast.getBoundingClientRect().bottom > 0;

        TABS.forEach((t) => {
          const btn = document.getElementById(`tab-${t.id}`);
          const panel = document.getElementById(`panel-${t.id}`);
          const on = t.id === id;
          btn.setAttribute("aria-selected", on ? "true" : "false");
          btn.tabIndex = on ? 0 : -1;
          panel.hidden = !on;
        });
        document.body.classList.toggle("practice-mode", id === "generator");
        const btn = document.getElementById(`tab-${id}`);
        if (focus) btn.focus();
        /* Bring the tab into view by scrolling the STRIP sideways only.
     scrollIntoView also moves the page vertically, which undoes the landing
     below and drops the reader back beside the unit heading. */
        keepSelectedTabVisible();

        const next = pathFor(CURRENT_UNIT, id, target);
        if (writeHistory && location.hash !== next)
          history.pushState(null, "", next);
        typeset(document.getElementById(`panel-${id}`));
        refreshUnitChrome();
        landOnPanel(
          document.getElementById(`panel-${id}`),
          keepScroll ? true : wasAtTop,
        );
      }

      function wireTabs() {
        const tl = document.getElementById("tablist");
        tl.addEventListener("click", (e) => {
          const b = e.target.closest('[role="tab"]');
          if (b) selectTab(b.id.replace(/^tab-/, ""));
        });
        tl.addEventListener("keydown", (e) => {
          if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key))
            return;
          e.preventDefault();
          const idx = TABS.findIndex(
            (t) =>
              document
                .getElementById(`tab-${t.id}`)
                .getAttribute("aria-selected") === "true",
          );
          let n = idx;
          if (e.key === "ArrowRight") n = (idx + 1) % TABS.length;
          if (e.key === "ArrowLeft") n = (idx - 1 + TABS.length) % TABS.length;
          if (e.key === "Home") n = 0;
          if (e.key === "End") n = TABS.length - 1;
          selectTab(TABS[n].id, { focus: true });
        });
      }

      function wireToTop() {
        const b = document.getElementById("toTop");
        let frame = 0;
        const place = () => {
          frame = 0;
          const home = !document.getElementById("view-book").hidden;
          const main = document.getElementById(home ? "book-main" : "main");
          if (!main?.getClientRects().length) return;
          const r = main.getBoundingClientRect(),
            size = b.offsetWidth || 48,
            inset = 16;
          const inMargin = r.right + inset;
          const x = Math.max(
            inset,
            Math.min(inMargin, innerWidth - inset - size),
          );
          document.documentElement.style.setProperty(
            "--back-top-left",
            Math.round(x) + "px",
          );
          b.classList.toggle("on", SiteScroll.y > 600);
        };
        const schedule = () => {
          if (!frame) frame = requestAnimationFrame(place);
        };
        addEventListener("resize", schedule, { passive: true });
        SiteScroll.on(schedule);
        addEventListener("hashchange", schedule);
        document.fonts?.ready.then(schedule);
        place();
        b.addEventListener("click", () => {
          const home = !document.getElementById("view-book").hidden;
          const t = home
            ? document.getElementById("book-main")
            : document.querySelector('[role="tab"][aria-selected="true"]');
          t?.focus({ preventScroll: true });
          SiteScroll.to({ top: 0, behavior: motion() });
        });
      }

      function typeset(root, { all = false } = {}) {
        if (!root || !window.renderMathInElement) return;
        const blocked = (node) => {
          if (
            node.parentElement.closest(".katex,script,style,code,pre,textarea")
          )
            return true;
          if (all) return false;
          if (node.parentElement.closest("[hidden]")) return true;
          for (let p = node.parentElement; p; p = p.parentElement) {
            if (p.matches("details:not([open])")) {
              const summary = p.querySelector(":scope > summary");
              if (!summary || !summary.contains(node)) return true;
            }
          }
          return false;
        };
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode())
          if (
            walker.currentNode.nodeValue.includes("$") &&
            !blocked(walker.currentNode)
          )
            nodes.push(walker.currentNode);
        nodes.forEach((node) => {
          node.nodeValue = themeMath(node.nodeValue);
          const span = document.createElement("span");
          span.className = "math-fragment";
          node.replaceWith(span);
          span.appendChild(node);
          renderMathInElement(span, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
            strict: false,
            trust: false,
          });
        });
        MathLayout.enhance(root);
        PaperOptionLayout.enhance(root);
      }
      function wireDisclosures(root) {
        root.addEventListener(
          "toggle",
          (e) => {
            if (e.target.matches("details[open]")) {
              typeset(e.target);
              markWideCompacts();
            }
          },
          true,
        );
      }
      function currentTabId() {
        return (
          document
            .querySelector('[role="tab"][aria-selected="true"]')
            ?.id.replace("tab-", "") ||
          TABS[0]?.id ||
          "ex11"
        );
      }

      function refreshUnitChrome() {
        measureSticky();
        watchStuck();
        markWideCompacts();
        updateFade();
        wireScrollSpy();
      }

      /* ======================================================================
   Routing.  #/ is the book, #/unit-N is a unit, #/unit-N/tab opens a tab.
   ====================================================================== */
      function showView(which) {
        if (which !== "unit") document.body.classList.remove("practice-mode");
        document.getElementById("view-book").hidden = which !== "book";
        document.getElementById("view-unit").hidden = which !== "unit";
      }

      function safeDecode(text) {
        try {
          return decodeURIComponent(text);
        } catch {
          return "";
        }
      }
      function route() {
        document.querySelectorAll("dialog[open]").forEach((d) => d.close());
        document.body.classList.remove("dialog-open");
        let hash = location.hash;
        if (/^#unit-\d+$/.test(hash)) { hash = "#/" + hash.slice(1); history.replaceState(null, "", hash); }
        if (hash && !hash.startsWith("#/")) {
          const target = safeDecode(hash.slice(1));
          for (const [unit, per] of Object.entries(CONTENT))
            for (const [ex, d] of Object.entries(per)) {
              const tab =
                d.kind === "review" ? "review" : "ex" + ex.replace(".", "");
              const ids = [
                ...(d.definitions || []),
                ...(d.whyItWorks || []),
                ...(d.history || []),
                ...(d.examples || []),
                ...(d.examples || []).flatMap((q) => q.parts),
                ...d.questions,
                ...d.questions.flatMap((q) => q.parts),
              ].map((x) => x.id);
              if (
                target.startsWith(tab + "-") ||
                ids.includes(target) ||
                ids.includes(target.replace(/-compact$/, ""))
              ) {
                hash = pathFor(unit, tab, target);
                history.replaceState(null, "", hash);
                break;
              }
            }
        }
        const m = hash.match(
          /^#\/unit-(\d+)(?:\/([\w.]+))?(?:\/([^?]+))?(?:\?paper=([^&]+))?$/,
        );
        if (!m) {
          stopVideos();
          showView("book");
          document.title = "Class 10 Mathematics : PECTAA solutions";
          SiteScroll.to({ top: 0, behavior: "auto" });
          return;
        }
        const n = Number(m[1]);
        if (!BOOK.units.some((x) => x.n === n) || !CONTENT[n]) {
          history.replaceState(null, "", "#/");
          showView("book");
          return;
        }
        const rebuilt =
          CURRENT_UNIT !== n ||
          !document.getElementById("panels").children.length;
        if (rebuilt && !buildUnit(n)) return;
        showView("unit");
        document.title = `Unit ${n} · ${BOOK.units.find((x) => x.n === n).title} : Class 10 Mathematics`;
        document.getElementById("q").value = "";
        runSearch();
        const wanted = TABS.some((t) => t.id === m[2]) ? m[2] : TABS[0].id;
        selectTab(wanted, { keepScroll: true, writeHistory: false });
        if (rebuilt) wireGenerator(n, BANKS[n]);
        if (m[3]) focusTarget(safeDecode(m[3]));
        else SiteScroll.to({ top: 0, behavior: "auto" });
        if (m[4]) {
          document.getElementById("gen-code").value = safeDecode(m[4]);
          document.getElementById("gen-restore").click();
        }
      }

      let printDisclosureState = [];
      function preparePrint() {
        stopVideos();
        if (document.body.classList.contains("printing-paper")) return;
        const scope = document.querySelector(".view:not([hidden])");
        if (!scope) return;
        const panel =
          scope.querySelector('[role="tabpanel"]:not([hidden])') || scope;
        printDisclosureState = [
          ...panel.querySelectorAll("details:not([open]):not(.vid)"),
        ];
        printDisclosureState.forEach((d) => (d.open = true));
        typeset(panel);
      }
      function restoreAfterPrint() {
        printDisclosureState.forEach((d) => (d.open = false));
        printDisclosureState = [];
      }
      function start() {
        addEventListener("beforeprint", preparePrint);
        addEventListener("afterprint", restoreAfterPrint);
        renderBook();
        typeset(document.getElementById("view-book"));
        wireSearch();
        wireToTop();
        wireTabs();
        updateFade = wireTabFade();
        document.querySelector(".skip").addEventListener("click", (e) => {
          e.preventDefault();
          const el = document.getElementById(
            document.getElementById("view-book").hidden ? "main" : "book-main",
          );
          el.focus();
          el.scrollIntoView({ behavior: motion() });
        });

        addEventListener(
          "resize",
          () => {
            measureSticky();
            keepSelectedTabVisible();
          },
          { passive: true },
        );
        document.fonts?.ready.then(keepSelectedTabVisible);
        addEventListener("popstate", route);
        addEventListener("hashchange", route);
        route();
      }

      addEventListener("DOMContentLoaded", () => {
        start();
        const status = document.getElementById("math-status");
        status.hidden = !!window.renderMathInElement;
        document.getElementById("math-retry").addEventListener("click", () => {
          const load = (src) =>
            new Promise((resolve, reject) => {
              const el = document.createElement("script");
              el.src = src;
              el.onload = resolve;
              el.onerror = reject;
              document.head.append(el);
            });
          Promise.resolve()
            .then(() =>
              window.katex
                ? null
                : load(
                    "https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.js",
                  ),
            )
            .then(() =>
              window.renderMathInElement
                ? null
                : load(
                    "https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/contrib/auto-render.min.js",
                  ),
            )
            .then(() => {
              status.hidden = true;
              typeset(document.querySelector(".view:not([hidden])"));
            })
            .catch(() => {
              status.hidden = false;
            });
        });
      });
