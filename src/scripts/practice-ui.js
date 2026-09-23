      /* Six digits are a local lookup key, not a compressed or global paper code.
       * The exact validated P4 snapshot is stored behind the key. Paper files are the
       * portable alternative, including when browser storage is blocked or cleared.
       * No student name, roll number or other personal information is stored. */
      const PaperShelf = (() => {
        const prefix = "imran.math.paper.v1.";
        function storage() {
          try {
            return globalThis.localStorage;
          } catch {
            throw Error("This browser is not allowing saved papers.");
          }
        }
        function number() {
          if (!globalThis.crypto?.getRandomValues)
            throw Error("Secure random numbers are unavailable.");
          const range = 900000,
            limit = Math.floor(4294967296 / range) * range,
            a = new Uint32Array(1);
          do {
            crypto.getRandomValues(a);
          } while (a[0] >= limit);
          return String(100000 + (a[0] % range));
        }
        function save(code) {
          if (typeof code !== "string" || !code.startsWith("P4-"))
            throw Error("This is not a valid paper snapshot.");
          try {
            const s = storage();
            for (let i = 0; i < s.length; i++) {
              const key = s.key(i);
              if (
                key?.startsWith(prefix) &&
                /^\d{6}$/.test(key.slice(prefix.length)) &&
                s.getItem(key) === code
              )
                return key.slice(prefix.length);
            }
            for (let tries = 0; tries < 100; tries++) {
              const id = number(),
                key = prefix + id;
              if (s.getItem(key) !== null) continue;
              s.setItem(key, code);
              if (s.getItem(key) !== code)
                throw Error("The saved paper could not be verified.");
              return id;
            }
            throw Error("Could not allocate an unused paper number.");
          } catch (e) {
            if (e.name === "QuotaExceededError")
              throw Error("Browser storage is full.");
            if (e.name === "SecurityError" || e instanceof TypeError)
              throw Error("This browser is not allowing saved papers.");
            throw e;
          }
        }
        function get(id) {
          if (!/^\d{6}$/.test(id)) throw Error("Enter a 6-digit paper number.");
          let code;
          try {
            code = storage().getItem(prefix + id);
          } catch {
            throw Error(
              "This browser is not allowing saved papers. Open the paper file instead.",
            );
          }
          if (!code)
            throw Error(
              "That number is not saved in this browser. Open the paper file or use the browser where you saved it.",
            );
          return code;
        }
        return { save, get };
      })();

      /* R7: topic cards, nested optional choices, local short IDs, and answer disclosures. */
      function practiceEscape(s) {
        return escapeHTML(s);
      }
      /* Native select, separately positioned decoration: CSS background resets cannot
       * push this arrow back to the browser's edge. No keyboard or picker emulation. */
      function selectControlHTML(select) {
        return `<span class="select-control">${select}<svg class="select-caret" viewBox="0 0 16 9" aria-hidden="true" focusable="false"><path d="M1 1l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
      }
      function practiceDialog(id, title, body) {
        return `<dialog class="practice-dialog" id="${id}" aria-labelledby="${id}-title"><div class="dialog-head"><h3 id="${id}-title">${title}</h3><button class="icon-button" type="button" data-close-dialog aria-label="Close ${title.toLowerCase()}">${uiIcon("close")}</button></div>${body}</dialog>`;
      }
      function generatorPanel(unit, bank) {
        const u = BOOK.units.find((x) => x.n === unit);
        const names = {
          1.1: "Powers, roots & equality",
          1.2: "Operations & inverses",
          1.3: "Conjugate & modulus",
          1.4: "Powers & systems",
          review: "Mixed review skills",
        };
        const sources = u.exercises
          .concat("review")
          .map(
            (s) =>
              `<label class="source-option"><input class="gen-ex" type="checkbox" value="${s}" checked><span><strong>${s === "review" ? "Review" : "Exercise " + s}</strong><small>${names[s] || "Unit skills"}</small></span></label>`,
          )
          .join("");
        const modes = [
          ["custom", "Practice paper", "Choose topics and questions"],
          ["board", "Unit test", "75 marks · whole unit"],
        ];
        return `<section class="practice" id="generator-form">
    <div id="practice-setup"><header class="practice-heading"><div><h2>Practice</h2></div><button class="quiet-button" id="open-recall" type="button">${uiIcon("save")} Open saved paper</button></header>
    <form id="practice-settings" novalidate>
      <fieldset class="mode-field"><legend class="sr-only">Practice format</legend><div class="practice-modes">${modes.map(([v, n, d]) => `<label class="mode-option"><input type="radio" name="mode" value="${v}" ${v === "custom" ? "checked" : ""}><span><strong>${n}</strong><small>${d}</small></span></label>`).join("")}</div></fieldset>
      <div class="builder-grid"><div class="builder-fields">
        <fieldset id="scope-fields" class="builder-group"><legend>Topics</legend><div class="source-options">${sources}</div><div class="source-shortcuts"><button type="button" class="text-button" id="gen-all">Select all</button><button type="button" class="text-button" id="gen-none">Clear</button></div><p id="scope-fixed-note" class="subtle" hidden>All topics are included in the unit test.</p></fieldset>
        <section id="unit-pattern" class="builder-group" aria-labelledby="unit-pattern-title" hidden><h3 id="unit-pattern-title">Question pattern</h3><dl class="test-pattern"><div><dt>15 MCQs</dt><dd>Attempt all</dd></div><div><dt>27 short questions</dt><dd>Attempt 6 of 9 in each set</dd></div><div><dt>5 two-part long questions</dt><dd>Attempt 2 of Q5–Q7 and 1 of Q8–Q9</dd></div></dl></section>
        <fieldset class="builder-group level-group" aria-describedby="difficulty-help"><legend>Level</legend><div class="level-options">${[
          ["gentle", "Foundations"],
          ["mixed", "Mixed"],
          ["challenging", "Challenge"],
        ]
          .map(
            ([v, n]) =>
              `<label><input type="radio" name="diff" value="${v}" ${v === "mixed" ? "checked" : ""}><span>${n}</span></label>`,
          )
          .join(
            "",
          )}</div><p class="subtle" id="difficulty-help">A range of methods and difficulty.</p></fieldset>
        <fieldset id="lengths" class="builder-group" aria-describedby="length-help"><legend>Question pattern</legend><div class="count-fields">${[
          ["mcq", "MCQs", 1, 30, 5],
          ["short", "Short questions", 2, 30, 3],
          ["long", "Long", 8, 10, 0],
        ]
          .map(
            ([k, l, m, max, n]) =>
              `<div class="count-field"><label for="n-${k}">${l}<small>${m} mark${m === 1 ? "" : "s"} each</small></label><div class="stepper"><button type="button" data-step="-1" data-count="${k}" aria-label="Fewer ${k === "mcq" ? "MCQs" : k === "short" ? "short questions" : "long questions"}">${uiIcon("minus")}</button><input id="n-${k}" type="number" min="0" max="${max}" step="1" inputmode="numeric" value="${n}" aria-describedby="n-${k}-error"><button type="button" data-step="1" data-count="${k}" aria-label="More ${k === "mcq" ? "MCQs" : k === "short" ? "short questions" : "long questions"}">${uiIcon("plus")}</button></div><p class="field-error" id="n-${k}-error"></p></div>`,
          )
          .join(
            "",
          )}</div><p class="subtle" id="length-help">Each long question contains two 4-mark parts.</p>
          </fieldset><details class="builder-group paper-choices" id="choices-fields"><summary><span><strong>Question choices</strong><small id="choices-summary">Set how many questions to attempt</small></span><span class="choice-disclosure-icon" aria-hidden="true">${uiIcon("plus")}</span></summary><div class="choices-body">
            <fieldset class="choice-group"><legend class="sr-only">Short-question choices</legend><label class="choice-toggle"><input id="short-choice" type="checkbox" aria-controls="short-choice-settings"> <span>Give a choice in short questions</span></label>
              <div id="short-choice-settings" class="choice-settings" hidden><div class="choice-set-control"><label for="short-sets">Short-question sets</label>${selectControlHTML(`<select id="short-sets"><option value="1">1 set</option><option value="2">2 sets</option><option value="3">3 sets</option></select>`)}</div><p class="subtle" id="short-split-note"></p><div id="short-attempt-fields" class="attempt-fields"></div></div>
            </fieldset>
            <fieldset class="choice-group"><legend class="sr-only">Long-question choices</legend><label class="choice-toggle"><input id="long-choice" type="checkbox" aria-controls="long-attempt-field"> <span>Give a choice in long questions</span></label><div class="attempt-field choice-settings" id="long-attempt-field" hidden><label for="long-attempt">Questions to attempt</label><input type="number" id="long-attempt" min="1" max="10" step="1" inputmode="numeric" value="1"><span id="long-offered"></span></div></fieldset>
          </div></details>
      </div><aside class="builder-summary" aria-label="Your paper summary"><div id="gen-plan" aria-live="polite" role="status"></div><p class="gen-error" id="gen-errors" role="alert" hidden></p><button class="btn btn-primary create-button" type="submit" id="gen-go">Generate paper ${uiIcon("arrow")}</button><button class="text-button" id="resume-paper" type="button" hidden>Return to current paper</button></aside></div>
    </form></div>
    <p class="practice-status" id="gen-status" role="status" aria-live="polite"></p><div id="practice-workspace" hidden><div id="gen-out"></div></div>
    ${practiceDialog("recall-dialog", "Open a saved paper", `<form id="recall-form" novalidate><label class="dialog-label" for="gen-code">6-digit paper number</label><div class="recall-entry"><input id="gen-code" class="code-field short-paper-number" type="text" maxlength="16000" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="123456" aria-describedby="recall-help recall-error"><button id="gen-restore" type="submit" class="btn btn-primary">Open paper ${uiIcon("arrow")}</button></div><p id="recall-help" class="subtle">For papers saved in this browser. On another device, open the saved paper file.</p><p class="gen-error" id="recall-error" role="alert" hidden></p><div class="dialog-actions"><button type="button" class="btn btn-ghost" id="paper-import-button">Open paper file</button><input id="paper-import" type="file" accept="application/json,.json" hidden></div></form>`)}
    ${practiceDialog("save-dialog", "Save paper", `<label class="dialog-label" for="saved-paper-code">Paper number</label><div class="save-number-row"><input id="saved-paper-code" class="code-field short-paper-number" type="text" readonly><button class="btn btn-ghost" id="gen-copy" type="button">Copy number</button></div><p id="save-note" class="subtle">Saved in this browser. Download the paper file to open it on another device.</p><p id="copy-status" role="status" class="practice-status"></p><div class="dialog-actions"><button class="btn btn-primary" id="paper-export" type="button">${uiIcon("download")} Download paper file</button></div>`)}
    ${practiceDialog(
      "print-dialog",
      "Print your paper",
      `<form id="print-form"><fieldset class="print-options"><legend class="sr-only">What to print</legend>${[
        ["paper", "Questions only", "Question sheet"],
        ["combined", "Questions + answers", "Includes a short answer key"],
        [
          "worked",
          "Questions + full working",
          "Includes every worked solution",
        ],
        ["key", "Answers only", "A separate answer key"],
      ]
        .map(
          ([v, n, d]) =>
            `<label><input type="radio" name="print-choice" value="${v}" ${v === "paper" ? "checked" : ""}><span><strong>${n}</strong><small>${d}</small></span></label>`,
        )
        .join(
          "",
        )}</fieldset><p class="subtle">In your browser’s print dialog, turn off headers and footers to leave out the file path.</p><div class="dialog-actions"><button class="btn btn-ghost" type="button" data-close-dialog>Cancel</button><button class="btn btn-primary" type="submit">${uiIcon("print")} Continue to print</button></div></form>`,
    )}
  </section>`;
      }
      function wireGenerator(unit, bank) {
        const $ = (id) => document.getElementById(id),
          form = $("practice-settings");
        if (!form) return;
        const setup = $("practice-setup"),
          workspace = $("practice-workspace"),
          out = $("gen-out"),
          st = $("gen-status"),
          go = $("gen-go"),
          error = $("gen-errors");
        const boxes = [...$("generator-form").querySelectorAll(".gen-ex")],
          nums = { mcq: $("n-mcq"), short: $("n-short"), long: $("n-long") },
          allSources = boxes.map((b) => b.value);
        const mode = () => form.querySelector('[name="mode"]:checked').value,
          kind = () => (mode() === "board" ? "board" : "practice"),
          mix = () => form.querySelector('[name="diff"]:checked').value;
        const sources = () =>
            kind() === "board"
              ? allSources
              : boxes.filter((b) => b.checked).map((b) => b.value),
          counts = () =>
            Object.fromEntries(
              Object.entries(nums).map(([k, e]) => [k, Number(e.value)]),
            );
        let paper = null,
          previous = null,
          attemptSignature = "",
          topicMode = "practice";
        let customSources = allSources.slice();
        function focusRegion(el) {
          if (!el) return;
          el.tabIndex = -1;
          el.focus({ preventScroll: true });
          el.scrollIntoView({ behavior: motion(), block: "start" });
        }
        function closeDialog(d) {
          d.close();
          document.body.classList.remove("dialog-open");
        }
        function openDialog(id) {
          $(id).showModal();
          document.body.classList.add("dialog-open");
        }
        $("generator-form")
          .querySelectorAll("dialog")
          .forEach((d) => {
            d.addEventListener("close", () =>
              document.body.classList.remove("dialog-open"),
            );
            d.addEventListener("click", (e) => {
              if (e.target.closest("[data-close-dialog]")) closeDialog(d);
            });
            d.addEventListener("keydown", (e) => {
              if (e.key !== "Tab") return;
              const a = [
                ...d.querySelectorAll(
                  'button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]',
                ),
              ].filter((x) => x.getClientRects().length);
              if (e.shiftKey && document.activeElement === a[0]) {
                e.preventDefault();
                a.at(-1)?.focus();
              } else if (!e.shiftKey && document.activeElement === a.at(-1)) {
                e.preventDefault();
                a[0]?.focus();
              }
            });
          });
        $("open-recall").addEventListener("click", () =>
          openDialog("recall-dialog"),
        );
        function clearErrors() {
          error.hidden = true;
          error.textContent = "";
          form
            .querySelectorAll("[aria-invalid]")
            .forEach((e) => e.removeAttribute("aria-invalid"));
          form
            .querySelectorAll(".field-error")
            .forEach((e) => (e.textContent = ""));
        }
        function readOptions() {
          const c = counts(),
            fixed = kind() === "board";
          if (!fixed) {
            const invalid = [...form.querySelectorAll('input[type="number"]')]
              .filter((e) => !e.disabled)
              .find((e) => e.value.trim() === "" || !e.checkValidity());
            if (invalid) {
              invalid.setAttribute("aria-invalid", "true");
              throw Error(
                "Use a whole number within each field’s allowed range.",
              );
            }
          }
          const sets = $("short-choice").checked
              ? Number($("short-sets").value)
              : 1,
            sizes = shortSetSizes(c.short, sets);
          const opts = {
            kind: kind(),
            mix: mix(),
            sources: sources(),
            counts: fixed ? { mcq: 15, short: 27, long: 5 } : c,
          };
          opts.pattern = fixed
            ? normalizedPattern(opts)
            : practicePattern(c, {
                sets,
                shortAttempts: $("short-choice").checked
                  ? [
                      ...$("short-attempt-fields").querySelectorAll("input"),
                    ].map((e) => Number(e.value))
                  : sizes,
                longAttempt: $("long-choice").checked
                  ? Number($("long-attempt").value)
                  : c.long,
              });
          validatePracticeOptions(unit, opts);
          return opts;
        }
        function showError(message) {
          error.textContent = message;
          error.hidden = false;
          const first = form.querySelector('[aria-invalid="true"]');
          if (first) {
            if (first.closest("#choices-fields"))
              $("choices-fields").open = true;
            first.focus();
            first.scrollIntoView({ block: "center", behavior: motion() });
          } else focusRegion(error);
        }
        function attemptControls() {
          const c = counts(),
            n = Number.isInteger(c.short) && c.short >= 0 ? c.short : 0;
          for (const option of $("short-sets").options)
            option.disabled = Number(option.value) > Math.max(1, n);
          if (Number($("short-sets").value) > Math.max(1, n))
            $("short-sets").value = "1";
          $("short-sets").disabled = n === 0 || !$("short-choice").checked;
          $("short-choice").disabled = n === 0;
          if (!n) $("short-choice").checked = false;
          $("long-choice").disabled = !c.long;
          if (!c.long) $("long-choice").checked = false;
          const enabled = $("short-choice").checked,
            sizes = shortSetSizes(
              n,
              enabled ? Number($("short-sets").value) : 1,
            ),
            signature = JSON.stringify([sizes, enabled, c.mcq > 0]);
          $("short-choice-settings").hidden = !enabled;
          $("short-split-note").textContent =
            sizes.length > 1
              ? `${n} short questions split into ${sizes.length} sets (${sizes.join(" + ")}).`
              : `${n} short questions offered.`;
          $("choices-summary").textContent =
            [
              $("short-choice").checked ? "Short choices on" : "",
              $("long-choice").checked ? "Long choices on" : "",
            ]
              .filter(Boolean)
              .join(" · ") || "Set how many questions to attempt";
          if (signature !== attemptSignature) {
            const prior = [
              ...$("short-attempt-fields").querySelectorAll("input"),
            ].map((e) => e.value);
            $("short-attempt-fields").innerHTML = enabled
              ? sizes
                  .map(
                    (size, i) =>
                      `<div class="attempt-field"><label for="short-attempt-${i}">Q${(c.mcq ? 2 : 1) + i}: attempt</label><input id="short-attempt-${i}" type="number" min="1" max="${size}" step="1" inputmode="numeric" value="${prior.length === sizes.length && prior[i] && /^\d+$/.test(prior[i]) ? Math.min(Number(prior[i]), size) : Math.min(6, Math.max(1, size - 1))}"><span>of ${size} questions</span></div>`,
                  )
                  .join("")
              : "";
            $("short-attempt-fields").hidden = !enabled;
            attemptSignature = signature;
          }
          $("long-attempt-field").hidden = !$("long-choice").checked;
          $("long-attempt").disabled = !$("long-choice").checked;
          $("long-attempt").max = Math.max(1, c.long || 1);
          $("long-offered").textContent = "of " + c.long + " questions";
        }
        function sync() {
          clearErrors();
          const fixed = kind() === "board";
          // Show the complete scope in both modes. Switching to a fixed unit test
          // must not discard the user's custom topic selection.
          if (fixed && topicMode !== "board") {
            customSources = boxes.filter((b) => b.checked).map((b) => b.value);
            boxes.forEach((b) => (b.checked = true));
          }
          if (!fixed && topicMode === "board")
            boxes.forEach((b) => (b.checked = customSources.includes(b.value)));
          topicMode = fixed ? "board" : "practice";
          $("scope-fields").disabled = fixed;
          $("scope-fixed-note").hidden = !fixed;
          $("scope-fields").querySelector(".source-shortcuts").hidden = fixed;
          $("unit-pattern").hidden = !fixed;
          for (const id of ["lengths", "choices-fields"]) {
            $(id).hidden = fixed;
            $(id).disabled = fixed;
          }
          attemptControls();
          $("difficulty-help").textContent = {
            gentle: "Direct questions and familiar methods.",
            mixed: "A range of methods and difficulty.",
            challenging: "More multistep questions and reasoning.",
          }[mix()];
          let p,
            total = "—",
            times = null;
          try {
            const o = readOptions();
            p = normalizedPattern(o);
            total =
              p.mcq.ask +
              2 * p.short.attempts.reduce((a, b) => a + b, 0) +
              8 * p.long.attempt;
            times = paperTiming(p.mcq.ask, total - p.mcq.ask);
          } catch {
            form
              .querySelectorAll("[aria-invalid]")
              .forEach((x) => x.removeAttribute("aria-invalid"));
          }
          const c = fixed ? { mcq: 15, short: 27, long: 5 } : counts(),
            takeShort = p?.short.attempts.reduce((a, b) => a + b, 0),
            takeLong = p?.long.attempt;
          const countText = (offered, take) =>
            !Number.isInteger(offered) || offered < 0
              ? "—"
              : take !== undefined && take < offered
                ? `${take} of ${offered}`
                : String(offered);
          $("gen-plan").innerHTML =
            `<h3>${fixed ? "Unit test" : "Practice paper"}</h3><p class="summary-marks"><strong>${total}</strong><span>marks</span></p><dl class="summary-counts"><div><dt>MCQs</dt><dd>${countText(c.mcq, c.mcq)}</dd></div><div><dt>Short questions</dt><dd>${countText(c.short, takeShort)}</dd></div><div><dt>Long questions</dt><dd>${countText(c.long, takeLong)}</dd></div></dl>${times ? `<div class="summary-times"><span>${fixed ? "Time" : "Estimated time"}</span>${times.objective ? `<p>Objective <b>${timeFor(times.objective)}</b></p>` : ""}${times.subjective ? `<p>Subjective <b>${timeFor(times.subjective)}</b></p>` : ""}</div>` : ""}`;
          go.innerHTML =
            (fixed ? "Generate test" : "Generate paper") +
            " " +
            uiIcon("arrow");
          $("resume-paper").hidden = !paper;
          form.querySelectorAll("[data-step]").forEach((b) => {
            const el = nums[b.dataset.count],
              n = Number(el.value);
            b.disabled =
              Number.isFinite(n) &&
              (Number(b.dataset.step) < 0 ? n <= 0 : n >= Number(el.max));
          });
        }
        function setOptions(o) {
          form.querySelector(
            `[name="mode"][value="${o.kind === "board" ? "board" : "custom"}"]`,
          ).checked = true;
          form.querySelector(`[name="diff"][value="${o.mix}"]`).checked = true;
          boxes.forEach((b) => (b.checked = o.sources.includes(b.value)));
          if (o.kind === "board") {
            topicMode = "board";
            boxes.forEach((b) => (b.checked = true));
          } else {
            topicMode = "practice";
            customSources = o.sources.slice();
          }
          if (o.kind !== "board") {
            const p = normalizedPattern(o);
            nums.mcq.value = p.mcq.ask;
            nums.short.value = p.short.ask;
            nums.long.value = p.long.ask;
            $("short-sets").value = p.short.sets;
            $("short-choice").checked =
              p.short.sets > 1 ||
              p.short.attempts.some(
                (n, i) => n < shortSetSizes(p.short.ask, p.short.sets)[i],
              );
            $("long-choice").checked = p.long.attempt < p.long.ask;
            attemptSignature = "";
            attemptControls();
            p.short.attempts.forEach((n, i) => {
              const el = $("short-attempt-" + i);
              if (el) el.value = n;
            });
            $("long-attempt").value = p.long.attempt || 1;
          }
          sync();
        }
        function showWorkspace() {
          setup.hidden = true;
          workspace.hidden = false;
          measureSticky();
          watchStuck();
          typeset(out);
          focusRegion($("paper-wrap"));
        }
        function showSetup() {
          setup.hidden = false;
          workspace.hidden = true;
          st.textContent = "";
          sync();
          measureSticky();
          focusRegion(setup);
        }
        function ensureKey() {
          const key = $("key-wrap");
          if (!key.innerHTML) {
            key.innerHTML = keyHTML(paper);
            $("key-expand").addEventListener("click", () => {
              const nodes = [...key.querySelectorAll(".answer-item")],
                open = nodes.some((d) => !d.open);
              nodes.forEach((d) => (d.open = open));
              $("key-expand").textContent = open
                ? "Collapse all working"
                : "Expand all working";
              $("key-expand").setAttribute("aria-pressed", String(open));
              typeset(key);
            });
            key.addEventListener(
              "toggle",
              () => {
                const all = [...key.querySelectorAll(".answer-item")].every(
                  (d) => d.open,
                );
                $("key-expand").textContent = all
                  ? "Collapse all working"
                  : "Expand all working";
                $("key-expand").setAttribute("aria-pressed", String(all));
              },
              true,
            );
          }
          return key;
        }
        function render() {
          const p = paper;
          out.innerHTML = `<div class="paper-return"><button class="quiet-button" id="gen-edit" type="button">${uiIcon("back")} Back to paper settings</button></div>
    <div class="workspace-top" role="group" aria-label="Randomize questions">
      ${previous ? '<div class="paper-recovery"><button type="button" class="text-button" id="gen-undo">Restore previous paper</button></div>' : ""}
      <div class="randomize-row"><label for="randomize-scope" class="sr-only">Section to randomize</label>${selectControlHTML(
        `<select id="randomize-scope">${[
          ["all", "Whole paper", true],
          ["objective", "Objective", p.times.objective],
          ["subjective", "Subjective", p.times.subjective],
          ["short", "Part I (short)", p.settings.pattern.short.ask],
          ["long", "Part II (long)", p.settings.pattern.long.ask],
        ]
          .filter((x) => x[2])
          .map(([v, n]) => `<option value="${v}">${n}</option>`)
          .join("")}</select>`,
      )}<button type="button" id="gen-new" class="btn btn-ghost" aria-label="Randomize questions">${uiIcon("refresh")} <span>Randomize<span class="randomize-extra"> questions</span></span></button></div>
      <p id="randomize-status" class="practice-status" role="status" aria-live="polite"></p>
    </div>
    <div class="paper-wrap" id="paper-wrap" role="region" aria-label="Question paper">${paperHTML(p)}</div>
    <footer class="paper-controls" id="paper-actions" tabindex="-1"><div class="paper-action-row"><button type="button" id="gen-print" class="btn btn-primary">${uiIcon("print")} Print</button><button type="button" id="open-save" class="btn btn-ghost">${uiIcon("save")} Save</button><button type="button" id="gen-key" class="btn btn-ghost" aria-expanded="false" aria-controls="key-wrap">Answer key ${uiIcon("down")}</button></div></footer>
    <div class="paper-wrap" id="key-wrap" role="region" aria-label="Answer key and worked solutions" hidden></div>`;
          $("gen-edit").addEventListener("click", showSetup);
          $("gen-key").addEventListener("click", () => {
            const key = ensureKey();
            key.hidden = !key.hidden;
            const open = !key.hidden;
            $("gen-key").setAttribute("aria-expanded", String(open));
            $("gen-key").innerHTML =
              (open ? "Hide answer key" : "Answer key") + " " + uiIcon("down");
            if (open) {
              typeset(key);
              focusRegion(key);
            }
          });
          $("open-save").addEventListener("click", async () => {
            $("copy-status").textContent = "";
            try {
              const snapshot = paper.code;
              const n = navigator.locks?.request
                ? await navigator.locks.request("imran-paper-save", () =>
                    PaperShelf.save(snapshot),
                  )
                : PaperShelf.save(snapshot);
              $("saved-paper-code").value = n;
              $("gen-copy").disabled = false;
              $("save-note").textContent =
                "Saved in this browser. Download the paper file to open it on another device.";
            } catch (e) {
              $("saved-paper-code").value = "";
              $("gen-copy").disabled = true;
              $("save-note").textContent =
                e.message + " Download the paper file instead.";
            }
            openDialog("save-dialog");
          });
          $("gen-print").addEventListener("click", () =>
            openDialog("print-dialog"),
          );
          $("gen-new").addEventListener("click", () => {
            const scope = $("randomize-scope").value;
            try {
              const next = randomizePaper(unit, bank, paper, scope);
              commit(next);
              $("randomize-scope").value = scope;
              const target = {
                all: "paper-wrap",
                objective: "paper-objective",
                subjective: "paper-subjective",
                short: "paper-part-i",
                long: "paper-part-ii",
              }[scope];
              focusRegion($(target));
            } catch (e) {
              $("randomize-status").textContent = e.message;
              measureSticky();
            }
          });
          $("gen-undo")?.addEventListener("click", () => {
            const now = paper;
            paper = previous;
            previous = now;
            setOptions(paper.settings);
            render();
            showWorkspace();
          });
        }
        function commit(next) {
          previous = paper;
          paper = next;
          render();
          sync();
          st.textContent = "";
          showWorkspace();
        }
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          clearErrors();
          go.disabled = true;
          try {
            commit(buildPaper(unit, bank, readOptions()));
          } catch (e) {
            showError(e.message);
          } finally {
            go.disabled = false;
          }
        });
        form.addEventListener("input", sync);
        form.addEventListener("change", sync);
        form.querySelectorAll("[data-step]").forEach((b) =>
          b.addEventListener("click", () => {
            const e = nums[b.dataset.count],
              n = Number(e.value) || 0;
            e.value = Math.max(
              Number(e.min),
              Math.min(Number(e.max), Math.trunc(n) + Number(b.dataset.step)),
            );
            sync();
          }),
        );
        $("gen-all").addEventListener("click", () => {
          boxes.forEach((b) => (b.checked = true));
          sync();
        });
        $("gen-none").addEventListener("click", () => {
          boxes.forEach((b) => (b.checked = false));
          sync();
        });
        $("resume-paper").addEventListener("click", showWorkspace);
        function restorePaper(code) {
          const o = decodePaperCode(code, unit),
            next = buildPaper(unit, bank, o);
          setOptions(o);
          closeDialog($("recall-dialog"));
          commit(next);
        }
        function recallError(message) {
          $("recall-error").textContent = message;
          $("recall-error").hidden = false;
          $("gen-code").setAttribute("aria-invalid", "true");
          $("gen-code").focus();
        }
        $("recall-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const input = $("gen-code");
          $("recall-error").hidden = true;
          input.removeAttribute("aria-invalid");
          try {
            const value = input.value.trim();
            if (!value) throw Error("Enter a 6-digit paper number.");
            restorePaper(/^\d{6}$/.test(value) ? PaperShelf.get(value) : value);
          } catch (e) {
            recallError(e.message);
          }
        });
        $("gen-code").addEventListener("input", () => {
          $("recall-error").hidden = true;
          $("gen-code").removeAttribute("aria-invalid");
        });
        $("gen-copy").addEventListener("click", async () => {
          const el = $("saved-paper-code");
          try {
            if (!navigator.clipboard?.writeText) throw Error();
            await navigator.clipboard.writeText(el.value);
            $("copy-status").textContent = "Paper number copied.";
          } catch {
            el.focus();
            el.select();
            $("copy-status").textContent =
              "Number selected. Use your device’s Copy command.";
          }
        });
        $("paper-export").addEventListener("click", () => {
          const file = JSON.stringify(
              { schema: "imran-math-paper/1", unit, code: paper.code },
              null,
              2,
            ),
            blob = new Blob([file], { type: "application/json" }),
            url = URL.createObjectURL(blob),
            a = document.createElement("a");
          a.href = url;
          a.download = `class-10-unit-${unit}-paper.json`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          $("copy-status").textContent = "Paper file prepared.";
        });
        $("paper-import-button").addEventListener("click", () =>
          $("paper-import").click(),
        );
        $("paper-import").addEventListener("change", async () => {
          const file = $("paper-import").files[0];
          if (!file) return;
          try {
            if (file.size > 100000)
              throw Error("This file is too large to be a saved paper.");
            const data = JSON.parse(await file.text());
            if (
              data.schema !== "imran-math-paper/1" ||
              typeof data.code !== "string"
            )
              throw Error("Choose a saved mathematics paper file.");
            restorePaper(data.code);
          } catch (e) {
            recallError(
              e instanceof SyntaxError
                ? "This is not a valid saved paper file."
                : e.message,
            );
          } finally {
            $("paper-import").value = "";
          }
        });
        $("print-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const printMode = $("print-form").querySelector(
            '[name="print-choice"]:checked',
          ).value;
          closeDialog($("print-dialog"));
          printPaper(printMode);
        });
        async function printPaper(printMode) {
          if (!paper) return;
          if (!window.renderMathInElement) {
            st.textContent =
              "Math formatting has not loaded. Reconnect and load the mathematics before printing.";
            return;
          }
          const pw = $("paper-wrap"),
            kw = $("key-wrap"),
            states = [pw.hidden, kw.hidden],
            openDetails = [];
          pw.hidden = false;
          if (printMode !== "paper") {
            ensureKey();
            kw.hidden = false;
            if (printMode === "worked")
              kw.querySelectorAll("details").forEach((d) => {
                openDetails.push([d, d.open]);
                d.open = true;
              });
          }
          typeset(out, { all: printMode === "worked" });
          if (document.fonts) await document.fonts.ready;
          PaperOptionLayout.prepare();
          document.body.classList.add("printing-paper");
          document.body.dataset.printMode = printMode;
          const style = document.createElement("style");
          style.id = "paper-running";
          const q = (s) =>
            '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
          const box = "font-size:8pt;font-family:Inter,'Inter Fallback',Arial,sans-serif;color:#333";
          style.textContent = `@page{size:A4 portrait;@top-left{content:${q(paper.title)};${box}}@top-right{content:${q(paper.marks + " marks")};${box}}@bottom-left{content:'Class 10 Mathematics';${box}}@bottom-right{content:'Page ' counter(page) ' of ' counter(pages);${box}}}`;
          document.head.appendChild(style);
          let cleaned = false;
          const done = () => {
            if (cleaned) return;
            cleaned = true;
            document.body.classList.remove("printing-paper");
            delete document.body.dataset.printMode;
            style.remove();
            pw.hidden = states[0];
            kw.hidden = states[1];
            openDetails.forEach(([d, open]) => (d.open = open));
            removeEventListener("afterprint", done);
            MathLayout.refresh();
          };
          addEventListener("afterprint", done, { once: true });
          try {
            window.print();
          } catch {
            done();
            st.textContent =
              "The print dialog could not open. Please try again.";
          }
        }
        sync();
      }
