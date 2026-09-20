/* Shared authored-content renderer: used by the browser and the static build. */
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
        (d.examples || []).forEach((e) => {
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
      ${pt.steps?.length ? stepsHTML(pt.steps) : ""}
      ${pt.answer ? `<div class="ans"><b>Answer</b><span>${pt.answer}</span></div>` : ""}
      ${writtenHTML(pt.written, pt.id + "-compact")}
      ${videoHTML(pt.video)}
      ${notesHTML(pt.notes)}
    </div></details></article>`;
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
