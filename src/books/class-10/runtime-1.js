
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
            edges(shell, scroller);
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
        /* Which sides still hide mathematics: drives the edge fade, the only cue
           visible before a reader touches a wide expression. */
        function edges(shell, s) {
          const wide = shell.classList.contains("is-overflowing");
          shell.classList.toggle("is-at-start", !wide || s.scrollLeft <= 1);
          shell.classList.toggle("is-at-end", !wide || s.scrollLeft + s.clientWidth >= s.scrollWidth - 1);
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
          s.addEventListener("scroll", () => { pulse(s); edges(shell, s); }, { passive: true });
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
@@SOURCE(src/books/class-10/routes.js)@@
      const pathFor = (unit, tab, target) => BookRoutes.path(BOOK,unit,tab,target);
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
      @@SOURCE(src/books/class-10/render.js)@@
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
        tl.setAttribute('role','tablist');
        tl.innerHTML = "";
        const ps = document.getElementById("panels");
        ps.innerHTML = "";

        TABS.forEach((t, i) => {
          const btn = document.createElement("a");
          btn.href = pathFor(n,t.id);
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
                  `<li class="res-item"><a href="${pathFor(CURRENT_UNIT,r.tab,r.id)}" data-i="${i}">
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
            if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
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
        if (writeHistory && location.pathname + location.hash !== next)
          history.pushState(null, "", next);
        syncPageMetadata(id);
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
          if (b && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); selectTab(b.id.replace(/^tab-/, "")); }
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
        let frame = 0,
          lastY = SiteScroll.y,
          goingUp = false;
        const place = () => {
          frame = 0;
          const home = !document.getElementById("view-book").hidden;
          const main = document.getElementById(home ? "book-main" : "main");
          if (!main?.getClientRects().length) return;
          const r = main.getBoundingClientRect(),
            size = b.offsetWidth || 48,
            inset = 16,
            /* Stay inside the rounded desktop frame and clear of a classic scrollbar. */
            frameInset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--frame-inset")) || 0,
            limit = document.documentElement.clientWidth - frameInset - inset - size;
          const inMargin = r.right + inset;
          const x = Math.max(inset, Math.min(inMargin, limit));
          document.documentElement.style.setProperty(
            "--back-top-left",
            Math.round(x) + "px",
          );
          /* With no margin beside the text the button would sit on top of it, so there
             it appears only while the reader scrolls back up, like the mobile header. */
          const y = SiteScroll.y;
          if (Math.abs(y - lastY) > 4) goingUp = y < lastY;
          lastY = y;
          const overlaps = inMargin > limit;
          b.classList.toggle("on", y > 600 && (!overlaps || goingUp));
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
        const state = BookRoutes.resolve(BOOK,CONTENT,location.pathname,location.hash);
        if (!state || !BOOK.units.some(u=>u.n===state.unit) || !CONTENT[state.unit]) {
          stopVideos(); showView('book');
          if(location.pathname!==BookRoutes.root || location.hash) history.replaceState(null,'',BookRoutes.root);
          document.title='Class 10 Mathematics : PECTAA solutions';
          document.querySelector('link[rel=canonical]').href='https://imranbinmanzoor.com'+BookRoutes.root;
          SiteScroll.to({top:0,behavior:'auto'}); return;
        }
        const n=state.unit;
        const rebuilt=CURRENT_UNIT!==n || !document.getElementById('panels').children.length;
        if(rebuilt&&!buildUnit(n)) return;
        showView('unit');document.getElementById('q').value='';runSearch();
        const wanted=TABS.some(t=>t.id===state.tab)?state.tab:TABS[0].id;
        selectTab(wanted,{keepScroll:true,writeHistory:false});
        const destination=pathFor(n,wanted,state.target)+(state.paper?'?paper='+encodeURIComponent(state.paper):'');
        if(location.pathname+location.hash!==destination) history.replaceState(null,'',destination);
        if(rebuilt) wireGenerator(n,BANKS[n]);
        if(state.target) focusTarget(state.target);else SiteScroll.to({top:0,behavior:'auto'});
        if(state.paper){document.getElementById('gen-code').value=state.paper;document.getElementById('gen-restore').click();}
      }

      function syncPageMetadata(tab) {
        const unit=BOOK.units.find(u=>u.n===CURRENT_UNIT),item=TABS.find(t=>t.id===tab);
        if(!unit||!item)return;
        document.title='Class 10 '+item.label+(tab==='generator'?'':' Solutions')+' — '+unit.title+' | PECTAA';
        const canonical='https://imranbinmanzoor.com'+(tab==='generator'?BookRoutes.root:pathFor(CURRENT_UNIT,tab));
        document.querySelector('link[rel=canonical]').href=canonical;
        const og=document.querySelector('meta[property="og:url"]');if(og)og.content=canonical;
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
        document.body.removeAttribute('data-book-pending');
        document.getElementById('q').disabled=false;
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

      function bootBook() {
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
                    "/vendor/katex-0.16.47/katex.min.js",
                  ),
            )
            .then(() =>
              window.renderMathInElement
                ? null
                : load(
                    "/vendor/katex-0.16.47/contrib/auto-render.min.js",
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
      }
      if(document.readyState==="loading")addEventListener("DOMContentLoaded",bootBook);else bootBook();
