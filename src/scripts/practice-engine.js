      const WORDS = [
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
      ];
      const numWord = (n) => WORDS[n] || String(n);
      const pad2 = (n) => String(n).padStart(2, "0");

      /* Columns are selected after KaTeX has rendered; roots and fractions do not
       * automatically require two columns. The conservative initial layout is 2×2. */
      function optionsHTML(opts) {
        if (!opts) return "";
        return (
          `<ul role="list" class="pq-opts is-c2" data-option-layout>` +
          opts
            .map(
              (o, j) =>
                `<li><span class="pq-option"><span class="pq-k">${KEYS[j]})</span><span class="pq-option-text">${o}</span></span></li>`,
            )
            .join("") +
          `</ul>`
        );
      }

      /* One numbered question. Two shapes, one label.

   A question made of subparts leads with a head line: the number, what to do,
   and what it is worth. A long question is two parts and nothing else, so its
   number sits in the gutter beside part (a) rather than costing a line of its
   own. Both use .q-no, so Q1 and Q5 are the same label wherever they land. */
      /* An authored arithmetic expression is math even when it is only one number.
       * Numeric data remain numeric; this helper only returns the display markup. */
      function inlineQuantity(value) {
        const raw = String(value).trim();
        if (!/^[0-9+\-−×÷=().\s]+$/.test(raw))
          throw Error("Invalid numeric display expression.");
        return (
          "$" +
          raw
            .replace(/×/g, "\\times ")
            .replace(/÷/g, "\\div ")
            .replace(/−/g, "-") +
          "$"
        );
      }

      function questionHTML(q) {
        if (q.parts) {
          return (
            `<div class="pq pq-long"><span class="q-no">${q.qno}</span>` +
            `<div class="pq-body">` +
            q.parts
              .map(
                (p, j) =>
                  `<div class="pq-part">` +
                  `<span class="pq-ab">(${KEYS[j]})</span>` +
                  `<div class="pq-qtext">${p.q}</div>` +
                  `<span class="pq-m">${inlineQuantity(p.marks)}</span></div>`,
              )
              .join("") +
            `</div></div>`
          );
        }
        return (
          `<div class="pq-q"><div class="q-head">` +
          `<span class="q-no">${q.qno}</span>` +
          `<p class="q-note">${q.note}<span class="q-marks">${inlineQuantity(q.arith)}</span></p></div>` +
          q.items
            .map(
              (it, i) =>
                `<div class="pq"><span class="pq-n">(${ROMAN(i)})</span>` +
                `<div class="pq-body">${it.q}${optionsHTML(it.opts)}</div></div>`,
            )
            .join("") +
          `</div>`
        );
      }

      function paperPartHTML(part) {
        const title = part.part
          ? `${part.part} &middot; ${part.label}`
          : part.label;
        return (
          `<div class="pq-part-block"${part.id ? ` id="${part.id}"` : ""}>` +
          (part.label
            ? `<header class="part-head"><h5 class="part-title">${title}</h5>` +
              (part.arith
                ? `<span class="part-marks">${inlineQuantity(part.arith)}</span>`
                : "") +
              (part.note ? `<p class="part-note">${part.note}</p>` : "") +
              `</header>`
            : "") +
          part.questions.map(questionHTML).join("") +
          `</div>`
        );
      }

      /* Each exam section is a separate handout. Identification fields belong to
       * BOTH section headers; neither relies on the first page of the other section. */
      function sectionHeaderHTML(paper, sec) {
        return `<header class="exam-header">
    <div class="exam-heading-line"><div><p class="exam-course">Class ${BOOK.class} · Mathematics</p><h3>${escapeHTML(paper.title)}</h3></div><div class="exam-paper-meta"><span class="exam-kind">${paper.settings.kind === "board" ? "Unit test" : "Practice paper"}</span>${sec === paper.sections[0] ? `<span class="exam-total">Total marks <b>${paper.marks}</b></span>` : ""}</div></div>
    <div class="exam-section-line"><h4>${sec.tag}</h4><div class="exam-metrics"><span>${paper.settings.kind === "board" ? "Time" : "Estimated time"} <b>${timeFor(sec.minutes)}</b></span><span><b>${sec.marks}</b> marks</span></div></div>
    <div class="exam-identity" aria-label="Student details"><span class="identity-name"><span>Name</span><span class="identity-line"></span></span><span><span>Roll number</span><span class="identity-line"></span></span><span><span>Date</span><span class="identity-line"></span></span></div>
  </header>`;
      }
      function paperHTML(paper) {
        return (
          `<article class="paper exam-paper"><div class="paper-body">` +
          paper.sections
            .map(
              (sec) =>
                `<section id="${sec.id}" class="sec${sec.tag === "Subjective" && paper.sections.some((x) => x.tag === "Objective") ? " sec-break" : ""}">${sectionHeaderHTML(paper, sec)}<div class="exam-questions">${sec.parts.map(paperPartHTML).join("")}</div></section>`,
            )
            .join("") +
          `</div></article>`
        );
      }
      function keyAnswer(it) {
        return (
          it.answer_text ||
          it.solution.match(/class="eq">([\s\S]*?)<\/div>/)?.[1] ||
          "See the worked solution."
        );
      }
      /* A checking surface, not a second exam sheet. The answer is always visible
       * within an open key; the question and full working are progressively revealed. */
      function keyRow(label, it, letter) {
        const answer = keyAnswer(it),
          marking = it.marking || [];
        return `<details class="answer-item${letter ? " answer-mcq" : ""}" data-question-ref="${escapeHTML(label)}">
    <summary><span class="answer-ref">${label}</span><span class="answer-result">${letter ? `<span class="answer-letter" aria-label="Correct option ${letter}">${letter.toLowerCase()}</span>` : ""}<span class="answer-value">${answer}</span></span><span class="answer-reveal"><span>Working</span>${uiIcon("chevron")}</span></summary>
    <div class="answer-detail"><div class="answer-question"><span class="answer-question-label">Question</span><div>${it.q}</div></div><div class="key-working">${practiceWorkingHTML(it.solution)}</div>
    ${it.marks > 1 && marking.length ? `<div class="answer-marking"><h6>Marking guide <span>${inlineQuantity(it.marks)} marks</span></h6><ul role="list">${marking.map((m) => `<li><span>${m.label}</span><b>${inlineQuantity(m.marks)}</b></li>`).join("")}</ul><p>Other valid methods are accepted.</p></div>` : ""}</div></details>`;
      }
      function keyHTML(paper) {
        let h = `<article class="paper paper-key answer-sheet"><header class="answer-heading"><div><h3>Answer key</h3><p>${escapeHTML(paper.title)}</p></div><button type="button" class="text-button" id="key-expand" aria-pressed="false">Expand all working</button></header><div class="answer-groups">`;
        paper.sections.forEach((sec) =>
          sec.parts.forEach((part) =>
            part.questions.forEach((q) => {
              const mcq = !!q.items?.[0]?.opts;
              h += `<section class="answer-group"><header class="answer-group-heading"><h4>${q.qno} <span>${mcq ? "Multiple choice" : q.parts ? "Long question" : "Short questions"}</span></h4></header><div class="${mcq ? "answer-grid" : "answer-stack"}">`;
              h += q.parts
                ? q.parts
                    .map((it, j) => keyRow(`${q.qno} (${KEYS[j]})`, it, null))
                    .join("")
                : q.items
                    .map((it, i) =>
                      keyRow(
                        `${q.qno} (${ROMAN(i)})`,
                        it,
                        it.opts ? KEYS[it.answer] : null,
                      ),
                    )
                    .join("");
              h += "</div></section>";
            }),
          ),
        );
        return h + "</div></article>";
      }

      /* R6: explicit choices, two Subjective parts, section timing, frozen-section
       * replacement, and P4 bank-bound snapshots. Random selection in the browser
       * uses Web Crypto; supplied seeds exist only for reproducible automated tests. */
      const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      const CODE_LEN = 5;
      const MIXES = {
        gentle: { easy: 0.6, medium: 0.35, hard: 0.05 },
        mixed: { easy: 0.35, medium: 0.4, hard: 0.25 },
        challenging: { easy: 0.1, medium: 0.4, hard: 0.5 },
      };
      const RANK = { easy: 0, medium: 1, hard: 2 };
      const LONG_PARTS = 2,
        LONG_PART_MARKS = 4;
      const BOARD = {
        time: "2 hours 30 minutes",
        mcq: { ask: 15, marks: 1 },
        short: { sets: 3, ask: 9, attempt: 6, marks: 2 },
        long: { ask: 5, attempt: 3, parts: 2, marks: 4 },
      };
      const BOARD_MARKS = 75;
      const FORMAT_NAMES = {
        mcq: "multiple-choice items",
        short: "short questions",
        long: "long parts",
      };
      function rngFrom(seed) {
        let a = seed >>> 0;
        return () => {
          a = (a + 0x6d2b79f5) >>> 0;
          let t = a;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }
      function shuffled(list, rand) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = rand.int ? rand.int(i + 1) : Math.floor(rand() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      }
      function seedToCode(seed) {
        let s = seed >>> 0,
          out = "";
        for (let i = 0; i < 5; i++) {
          out = CODE_ALPHABET[s % 32] + out;
          s = Math.floor(s / 32);
        }
        return out;
      }
      function codeToSeed(text) {
        const c = String(text).toUpperCase();
        if (c.length !== 5) return null;
        let n = 0;
        for (const ch of c) {
          const i = CODE_ALPHABET.indexOf(ch);
          if (i < 0) return null;
          n = 32 * n + i;
        }
        return n;
      }
      function codeChecksum(text) {
        let n = 2166136261;
        for (const ch of text) {
          n ^= ch.charCodeAt(0);
          n = Math.imul(n, 16777619);
        }
        return (n >>> 0).toString(36).toUpperCase().padStart(7, "0");
      }

      function secureRandom() {
        if (!globalThis.crypto?.getRandomValues)
          throw Error(
            "Secure randomization is unavailable in this browser. Use a current browser; the existing paper is unchanged.",
          );
        const buffer = new Uint32Array(128);
        let at = buffer.length;
        const next = () => {
          if (at === buffer.length) {
            globalThis.crypto.getRandomValues(buffer);
            at = 0;
          }
          return buffer[at++];
        };
        const random = () => next() / 4294967296;
        random.int = (n) => {
          if (!Number.isSafeInteger(n) || n < 1 || n > 4294967296)
            throw Error("Invalid random range.");
          const limit = Math.floor(4294967296 / n) * n;
          let v;
          do {
            v = next();
          } while (v >= limit);
          return v % n;
        };
        return random;
      }
      function shortSetSizes(count, sets = 1) {
        return Array.from(
          { length: sets },
          (_, i) => Math.floor(count / sets) + (i < count % sets ? 1 : 0),
        );
      }
      function practicePattern(counts, choices = {}) {
        const sets = choices.sets ?? 1,
          sizes = shortSetSizes(counts.short, sets);
        return {
          mcq: { ask: counts.mcq, marks: 1 },
          short: {
            ask: counts.short,
            sets,
            attempts: choices.shortAttempts ?? sizes,
            marks: 2,
          },
          long: {
            ask: counts.long,
            attempt: choices.longAttempt ?? counts.long,
            parts: 2,
            marks: 4,
          },
        };
      }
      function normalizedPattern(o) {
        return o.kind === "board"
          ? practicePattern(
              { mcq: 15, short: 27, long: 5 },
              { sets: 3, shortAttempts: [6, 6, 6], longAttempt: 3 },
            )
          : o.pattern;
      }
      function validatePracticeOptions(unit, o) {
        const u = BOOK.units.find((x) => x.n === unit);
        if (!u) throw Error("This unit is not available.");
        const all = u.exercises.concat("review");
        if (
          !Array.isArray(o.sources) ||
          !o.sources.length ||
          new Set(o.sources).size !== o.sources.length ||
          o.sources.some((s) => !all.includes(s))
        )
          throw Error("Choose at least one available exercise area.");
        if (
          !Object.hasOwn(MIXES, o.mix) ||
          !["board", "practice"].includes(o.kind)
        )
          throw Error("Choose an available paper type and level.");
        if (
          o.seed !== undefined &&
          (!Number.isInteger(o.seed) || o.seed < 0 || o.seed > 4294967295)
        )
          throw Error("Invalid test seed.");
        if (o.kind === "board" && o.sources.length !== all.length)
          throw Error("The unit test uses all exercise areas.");
        const p = normalizedPattern(o);
        if (!p?.mcq || !p.short || !p.long)
          throw Error("Choose the number of questions.");
        const n = [p.mcq.ask, p.short.ask, p.long.ask];
        if (
          n.some((v, i) => !Number.isInteger(v) || v < 0 || v > [30, 30, 10][i])
        )
          throw Error(
            "Use whole numbers: 0–30 MCQs, 0–30 short questions, and 0–10 two-part long questions.",
          );
        if (!n.some(Boolean)) throw Error("Ask for at least one question.");
        if (
          p.mcq.marks !== 1 ||
          p.short.marks !== 2 ||
          p.long.marks !== 4 ||
          p.long.parts !== 2
        )
          throw Error("Invalid marks in the paper pattern.");
        if (
          !Number.isInteger(p.short.sets) ||
          p.short.sets < 1 ||
          p.short.sets > 3 ||
          (p.short.ask && p.short.sets > p.short.ask) ||
          (!p.short.ask && p.short.sets !== 1)
        )
          throw Error(
            "Use 1–3 short-question sets, with at least one part in every set.",
          );
        const sizes = shortSetSizes(p.short.ask, p.short.sets);
        if (
          !Array.isArray(p.short.attempts) ||
          p.short.attempts.length !== sizes.length ||
          p.short.attempts.some(
            (n, i) =>
              !Number.isInteger(n) || n > sizes[i] || n < (sizes[i] ? 1 : 0),
          )
        )
          throw Error(
            "Choose at least one part to attempt in each short-question set, and no more than the number offered.",
          );
        if (
          !Number.isInteger(p.long.attempt) ||
          p.long.attempt > p.long.ask ||
          p.long.attempt < (p.long.ask ? 1 : 0)
        )
          throw Error(
            "The long-question attempt count must be between 1 and the number offered (or 0 when no long questions are offered).",
          );
        return { mcq: n[0], short: n[1], long: n[2] * 2 };
      }
      /* Time is a transparent marks-based estimate: the supplied textbook model,
       * printed pp.243–244, allows 20 min for 15 objective marks and 130 min for
       * 60 subjective marks. Each present section rounds UP to 5 min separately. */
      function paperTiming(objectiveMarks, subjectiveMarks) {
        const up = (marks, base, time) =>
          marks ? 5 * Math.ceil((marks * time) / (base * 5)) : 0;
        const objective = up(objectiveMarks, 15, 20),
          subjective = up(subjectiveMarks, 60, 130);
        return { objective, subjective, total: objective + subjective };
      }
      function timeFor(n) {
        if (n === 0) return "0 minutes";
        return n < 60
          ? n + " minutes"
          : Math.floor(n / 60) +
              " hour" +
              (n >= 120 ? "s" : "") +
              (n % 60 ? " " + (n % 60) + " minutes" : "");
      }
      function attemptNote(take, offered, noun = "parts") {
        return take === offered
          ? `Attempt all ${noun}.`
          : `Attempt any ${numWord(take)} of the following ${numWord(offered)} ${noun}.`;
      }
      function questionGroup(x) {
        return x.dedupe_key || x.id;
      }
      function poolCapacity(pool) {
        const formats = ["mcq", "short", "long"],
          groups = new Map();
        for (const x of pool) {
          const i = formats.indexOf(x.type);
          if (i < 0) continue;
          const k = questionGroup(x);
          groups.set(k, (groups.get(k) || 0) | (1 << i));
        }
        const masks = Array(8).fill(0);
        for (const m of groups.values()) masks[m]++;
        return {
          groups,
          masks,
          counts: Object.fromEntries(
            formats.map((t, i) => [
              t,
              [...groups.values()].filter((m) => m & (1 << i)).length,
            ]),
          ),
        };
      }
      function capacityIssue(masks, demand) {
        const types = ["mcq", "short", "long"];
        for (let subset = 1; subset < 8; subset++) {
          const want = types.reduce(
            (n, t, i) => n + (subset & (1 << i) ? demand[t] : 0),
            0,
          );
          let available = 0;
          for (let m = 1; m < 8; m++) if (m & subset) available += masks[m];
          if (available < want)
            return {
              formats: types.filter((_, i) => subset & (1 << i)),
              want,
              available,
            };
        }
        return null;
      }
      function targetMix(n, mix) {
        const entries = Object.keys(RANK).map((d, i) => ({
          d,
          i,
          v: n * mix[d],
        }));
        const out = Object.fromEntries(
          entries.map((x) => [x.d, Math.floor(x.v)]),
        );
        let left = n - Object.values(out).reduce((a, b) => a + b, 0);
        entries.sort(
          (a, b) =>
            b.v - Math.floor(b.v) - (a.v - Math.floor(a.v)) || a.i - b.i,
        );
        for (let i = 0; i < left; i++) out[entries[i].d]++;
        return out;
      }
      function selectPaperItems(pool, demand, mix, rand) {
        const types = ["mcq", "short", "long"],
          cap = poolCapacity(pool),
          remaining = { ...demand };
        const issue = capacityIssue(cap.masks, remaining);
        if (issue) {
          const label = issue.formats.map((t) => FORMAT_NAMES[t]).join(" and ");
          throw Error(
            `These settings need ${issue.want} distinct calculations across ${label}, but this selection has ${issue.available}. Reduce a count or include another exercise area.`,
          );
        }
        const used = new Set(),
          family = new Map(),
          skills = new Map(),
          sources = new Map(),
          out = { mcq: [], short: [], long: [] };
        const need = Object.fromEntries(
          types.map((t) => [t, targetMix(demand[t], mix)]),
        );
        const ranked = shuffled(pool, rand).map((x, i) => ({ x, tie: i }));
        while (Object.values(remaining).some(Boolean)) {
          const t = types
            .filter((t) => remaining[t] > 0)
            .sort((a, b) => {
              const count = (t) =>
                [...cap.groups.entries()].filter(
                  ([k, m]) => !used.has(k) && m & (1 << types.indexOf(t)),
                ).length;
              return count(a) / remaining[a] - count(b) / remaining[b];
            })[0];
          const candidates = ranked.filter(
            (r) => r.x.type === t && !used.has(questionGroup(r.x)),
          );
          candidates.sort((a, b) => {
            const score = (r) => [
              need[t][r.x.difficulty] > 0
                ? 0
                : 1 +
                  Math.min(
                    ...Object.keys(RANK)
                      .filter((d) => need[t][d] > 0)
                      .map((d) => Math.abs(RANK[d] - RANK[r.x.difficulty])),
                  ),
              sources.has(r.x.src) ? 1 : 0,
              family.get(r.x.task_family) || 0,
              skills.get(r.x.skill) || 0,
              sources.get(r.x.src) || 0,
              r.tie,
            ];
            const aa = score(a),
              bb = score(b);
            for (let i = 0; i < aa.length; i++)
              if (aa[i] !== bb[i]) return aa[i] - bb[i];
            return 0;
          });
          let chosen = null;
          for (const { x } of candidates) {
            const key = questionGroup(x),
              mask = cap.groups.get(key);
            cap.masks[mask]--;
            remaining[t]--;
            if (!capacityIssue(cap.masks, remaining)) {
              chosen = x;
              break;
            }
            cap.masks[mask]++;
            remaining[t]++;
          }
          if (!chosen)
            throw Error(
              "No duplicate-free paper could be completed. The existing paper has been kept.",
            );
          used.add(questionGroup(chosen));
          need[t][chosen.difficulty]--;
          for (const [map, key] of [
            [family, chosen.task_family],
            [skills, chosen.skill],
            [sources, chosen.src],
          ])
            map.set(key, (map.get(key) || 0) + 1);
          out[t].push(chosen);
        }
        for (const t of types)
          out[t].sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]);
        return out;
      }
      function pairUp(items, per = 2) {
        if (items.length % per)
          throw Error("A long question is missing a part.");
        const groups = Array.from({ length: items.length / per }, () => []);
        for (const x of items
          .slice()
          .sort((a, b) => b.estimated_minutes - a.estimated_minutes)) {
          const eligible = groups
            .map((g, i) => ({ g, i }))
            .filter(({ g }) => g.length < per);
          eligible.sort(
            (a, b) =>
              Number(a.g.some((v) => v.task_family === x.task_family)) -
                Number(b.g.some((v) => v.task_family === x.task_family)) ||
              a.g.reduce((n, v) => n + v.estimated_minutes, 0) -
                b.g.reduce((n, v) => n + v.estimated_minutes, 0) ||
              a.i - b.i,
          );
          eligible[0].g.push(x);
        }
        return groups;
      }

      function flatPaper(p) {
        return p.sections.flatMap((s) =>
          s.parts.flatMap((t) =>
            t.questions.flatMap((q) => q.parts || q.items),
          ),
        );
      }
      function coverageLabel(unit, sources) {
        const all = BOOK.units
          .find((u) => u.n === unit)
          .exercises.concat("review");
        return sources.length === all.length
          ? "Whole unit"
          : sources
              .map((s) => (s === "review" ? "Review" : "Exercise " + s))
              .join(", ");
      }
      function encodePaperCode(unit, o) {
        validatePracticeOptions(unit, o);
        if (!o.snapshot)
          throw Error("Generate the paper before saving its code.");
        const all = BOOK.units
            .find((x) => x.n === unit)
            .exercises.concat("review"),
          p = normalizedPattern(o);
        const data = [
          o.kind === "board" ? 1 : 0,
          Object.keys(MIXES).indexOf(o.mix),
          all.reduce((n, s, i) => n + (o.sources.includes(s) ? 2 ** i : 0), 0),
          [
            p.mcq.ask,
            p.short.ask,
            p.long.ask,
            p.short.sets,
            ...p.short.attempts,
            p.long.attempt,
          ],
          o.snapshot,
        ];
        const json = JSON.stringify(data); // Only ASCII numbers, punctuation and arrays.
        const payload = btoa(json)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
        const base = `P4-${unit}-${BOOK.bankVersions[unit]}-${payload}`;
        return base + "-" + codeChecksum(base);
      }
      function decodePaperCode(text, unit) {
        const code = String(text).trim().replace(/\s+/g, "");
        if (
          /^P[23]-/i.test(code) ||
          /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}$/i.test(code)
        )
          throw Error(
            "This is an older paper code. Open it in r5 (or the revision that saved it); r6 uses P4 codes with choices and exact section selections.",
          );
        if (code.length > 16000) throw Error("This paper code is too long.");
        const m = code.match(
          /^P4-(\d+)-([A-F0-9]{8})-([A-Za-z0-9_-]+)-([A-Z0-9]{7})$/,
        );
        if (!m || codeChecksum(code.slice(0, code.lastIndexOf("-"))) !== m[4])
          throw Error(
            "The paper code is incomplete or contains a typing error.",
          );
        if (Number(m[1]) !== unit)
          throw Error("This code belongs to a different unit.");
        if (
          m[2] !== BOOK.bankVersions[unit] &&
          !(BOOK.bankVersionAliases?.[unit] || []).includes(m[2])
        )
          throw Error(
            "This code uses a different question bank. Open the saved revision that created it.",
          );
        let v;
        try {
          v = JSON.parse(atob(m[3].replace(/-/g, "+").replace(/_/g, "/")));
        } catch {
          throw Error("Invalid data in the paper code.");
        }
        const all = BOOK.units
          .find((x) => x.n === unit)
          .exercises.concat("review");
        if (
          !Array.isArray(v) ||
          v.length !== 5 ||
          ![0, 1].includes(v[0]) ||
          !Number.isInteger(v[1]) ||
          v[1] < 0 ||
          v[1] > 2 ||
          !Number.isInteger(v[2]) ||
          v[2] < 1 ||
          v[2] >= 2 ** all.length ||
          !Array.isArray(v[3]) ||
          v[3].length !== v[3][3] + 5
        )
          throw Error("Invalid settings in the paper code.");
        const c = { mcq: v[3][0], short: v[3][1], long: v[3][2] },
          o = {
            kind: v[0] ? "board" : "practice",
            mix: Object.keys(MIXES)[v[1]],
            sources: all.filter((_, i) => v[2] & (1 << i)),
            counts: c,
            pattern: practicePattern(c, {
              sets: v[3][3],
              shortAttempts: v[3].slice(4, -1),
              longAttempt: v[3].at(-1),
            }),
            snapshot: v[4],
          };
        validatePracticeOptions(unit, o);
        if (
          o.kind === "board" &&
          JSON.stringify(o.pattern) !== JSON.stringify(normalizedPattern(o))
        )
          throw Error("Invalid fixed-test settings in the paper code.");
        return o;
      }
      function makeSnapshot(bank, picked, rand) {
        const index = new Map(bank.map((x, i) => [x.id, i]));
        return [
          picked.mcq.map((x) => [
            index.get(x.id),
            ...shuffled([0, 1, 2, 3], rand),
          ]),
          picked.short.map((x) => index.get(x.id)),
          pairUp(picked.long).map((g) => g.map((x) => index.get(x.id))),
        ];
      }
      function snapshotItems(bank, snapshot, demand, sources) {
        if (
          !Array.isArray(snapshot) ||
          snapshot.length !== 3 ||
          snapshot.some((x) => !Array.isArray(x)) ||
          snapshot[0].length !== demand.mcq ||
          snapshot[1].length !== demand.short ||
          snapshot[2].length * 2 !== demand.long
        )
          throw Error("The saved question counts do not match the paper.");
        const used = new Set();
        const item = (idx, type) => {
          if (!Number.isInteger(idx) || idx < 0 || idx >= bank.length)
            throw Error("Unknown question in this paper code.");
          const x = bank[idx];
          if (x.type !== type || !sources.includes(x.src))
            throw Error(
              "A saved question does not match the selected format or topics.",
            );
          const k = questionGroup(x);
          if (used.has(k))
            throw Error("A calculation is repeated in this paper code.");
          used.add(k);
          return x;
        };
        const mcq = snapshot[0].map((row) => {
          if (
            !Array.isArray(row) ||
            row.length !== 5 ||
            row.slice(1).some((x) => !Number.isInteger(x) || x < 0 || x > 3) ||
            new Set(row.slice(1)).size !== 4
          )
            throw Error("Invalid MCQ option order.");
          return item(row[0], "mcq");
        });
        const short = snapshot[1].map((i) => item(i, "short")),
          pairs = snapshot[2].map((g) => {
            if (!Array.isArray(g) || g.length !== 2)
              throw Error("A long question needs parts (a) and (b).");
            return g.map((i) => item(i, "long"));
          });
        return { mcq, short, long: pairs.flat(), pairs };
      }
      function buildPaper(unit, bank, o) {
        const demand = validatePracticeOptions(unit, o),
          order = BOOK.units
            .find((x) => x.n === unit)
            .exercises.concat("review");
        o = { ...o, sources: order.filter((s) => o.sources.includes(s)) };
        if (!o.snapshot) {
          const rand = o.seed === undefined ? secureRandom() : rngFrom(o.seed);
          const picked = selectPaperItems(
            bank.filter((x) => o.sources.includes(x.src)),
            demand,
            MIXES[o.mix],
            rand,
          );
          o.snapshot = makeSnapshot(bank, picked, rand);
        }
        const snapshot = JSON.parse(JSON.stringify(o.snapshot)),
          picked = snapshotItems(bank, snapshot, demand, o.sources),
          p = normalizedPattern(o),
          board = o.kind === "board";
        const present = (x, perm) => {
          const r = {
            id: x.id,
            q: x.q,
            solution: x.solution,
            answer_text: x.answer_text,
            marks: x.marks,
            src: x.src,
            skill: x.skill,
            task_family: x.task_family,
            dedupe_key: questionGroup(x),
            difficulty: x.difficulty,
            estimated_minutes: x.estimated_minutes,
            marking: x.marking,
          };
          if (perm) {
            r.opts = perm.map((i) => x.opts[i]);
            r.answer = perm.indexOf(x.answer);
          }
          return r;
        };
        let number = 1;
        const sections = [];
        if (picked.mcq.length)
          sections.push({
            tag: "Objective",
            id: "paper-objective",
            marks: picked.mcq.length,
            parts: [
              {
                questions: [
                  {
                    qno: "Q" + number++,
                    note:
                      attemptNote(
                        picked.mcq.length,
                        picked.mcq.length,
                        "questions",
                      ) + " Choose one option for each.",
                    arith: `1 × ${picked.mcq.length} = ${picked.mcq.length}`,
                    items: picked.mcq.map((x, i) =>
                      present(x, snapshot[0][i].slice(1)),
                    ),
                  },
                ],
              },
            ],
          });
        const parts = [];
        let subjective = 0;
        if (picked.short.length) {
          const questions = [];
          for (let i = 0; i < p.short.sets; i++) {
            const it = picked.short.filter((_, j) => j % p.short.sets === i),
              take = p.short.attempts[i];
            subjective += 2 * take;
            questions.push({
              qno: "Q" + number++,
              note: attemptNote(take, it.length, "questions"),
              attempt: take,
              arith: `2 × ${take} = ${2 * take}`,
              items: it.map((x) => present(x)),
            });
          }
          parts.push({
            part: "Part I",
            id: "paper-part-i",
            label: "Short-answer questions",
            questions,
          });
        }
        if (picked.pairs.length) {
          const take = p.long.attempt,
            start = number;
          subjective += 8 * take;
          const note = board
            ? `Attempt any two questions from Q${start}–Q${start + 2} and any one from Q${start + 3}–Q${start + 4}. Answer both parts of every chosen question.`
            : attemptNote(take, picked.pairs.length, "questions") +
              " Answer both parts of every chosen question.";
          parts.push({
            part: "Part II",
            id: "paper-part-ii",
            label: "Long-answer questions",
            arith: `${take} × 8 = ${take * 8}`,
            note,
            attempt: take,
            questions: picked.pairs.map((g) => ({
              qno: "Q" + number++,
              parts: g.map((x) => present(x)),
            })),
          });
        }
        if (parts.length)
          sections.push({
            tag: "Subjective",
            id: "paper-subjective",
            marks: subjective,
            newPage: !!picked.mcq.length,
            parts,
          });
        const all = [...picked.mcq, ...picked.short, ...picked.long],
          levels = { easy: 0, medium: 0, hard: 0 };
        for (const x of all) levels[x.difficulty]++;
        const counts = { mcq: p.mcq.ask, short: p.short.ask, long: p.long.ask },
          settings = {
            kind: o.kind,
            mix: o.mix,
            sources: o.sources,
            counts,
            pattern: p,
            snapshot,
          };
        const times = paperTiming(picked.mcq.length, subjective);
        sections.forEach((s) => (s.minutes = times[s.tag.toLowerCase()]));
        const choices =
          p.short.attempts.some(
            (n, i) => n < shortSetSizes(p.short.ask, p.short.sets)[i],
          ) || p.long.attempt < p.long.ask;
        return {
          title: `Unit ${unit} · ${BOOK.units.find((x) => x.n === unit).title}`,
          subtitle: board ? "Unit test" : "Practice paper",
          marks: picked.mcq.length + subjective,
          time: timeFor(times.total),
          times,
          code: encodePaperCode(unit, settings),
          coverage: coverageLabel(unit, o.sources),
          sections,
          shortfall: { mcq: 0, short: 0, long: 0 },
          settings,
          profile: {
            kind: o.kind,
            mix: o.mix,
            requested: counts,
            levels,
            skills: [...new Set(all.map((x) => x.skill))].sort(),
            representedSources: [...new Set(all.map((x) => x.src))].sort(),
            selectedSources: o.sources.slice(),
            totalItems: all.length,
            attemptItems:
              picked.mcq.length +
              p.short.attempts.reduce((a, b) => a + b, 0) +
              2 * p.long.attempt,
            hasChoices: choices,
            repeatedLongFamilyPairs: picked.pairs.filter(
              (g) => g[0].task_family === g[1].task_family,
            ).length,
          },
        };
      }
      /* Replace only selected formats. Frozen formats are excluded before capacity
       * checking, so no cross-format duplicate is introduced. Prefer fresh tasks;
       * when the pool is small, reuse is allowed, but a no-op is never reported as new. */
      function randomizePaper(
        unit,
        bank,
        paper,
        scope = "all",
        rand = secureRandom(),
      ) {
        const targets = {
          all: [0, 1, 2],
          objective: [0],
          subjective: [1, 2],
          short: [1],
          long: [2],
        }[scope];
        if (!targets) throw Error("Choose which section to randomize.");
        const before = paper.settings.snapshot,
          snapshot = JSON.parse(JSON.stringify(before)),
          o = paper.settings,
          demand = validatePracticeOptions(unit, o),
          types = ["mcq", "short", "long"];
        const indices = (snap, i) =>
          i === 0
            ? snap[0].map((r) => r[0])
            : i === 1
              ? snap[1]
              : snap[2].flat();
        if (!targets.some((i) => indices(before, i).length))
          throw Error("There are no questions in that section.");
        const frozen = new Set(
          types.flatMap((_, i) =>
            targets.includes(i)
              ? []
              : indices(before, i).map((n) => questionGroup(bank[n])),
          ),
        );
        const old = new Set(
          targets.flatMap((i) =>
            indices(before, i).map((n) => questionGroup(bank[n])),
          ),
        );
        const wanted = Object.fromEntries(
          types.map((t, i) => [t, targets.includes(i) ? demand[t] : 0]),
        );
        const pool = bank.filter(
            (x) => o.sources.includes(x.src) && !frozen.has(questionGroup(x)),
          ),
          fresh = pool.filter((x) => !old.has(questionGroup(x)));
        const eligible = capacityIssue(poolCapacity(fresh).masks, wanted)
          ? pool
          : fresh;
        for (let attempt = 0; attempt < 12; attempt++) {
          const picked = selectPaperItems(eligible, wanted, MIXES[o.mix], rand),
            next = makeSnapshot(bank, picked, rand);
          targets.forEach((i) => (snapshot[i] = next[i]));
          if (
            targets.some(
              (i) => JSON.stringify(snapshot[i]) !== JSON.stringify(before[i]),
            )
          )
            return buildPaper(unit, bank, { ...o, snapshot });
        }
        throw Error(
          "No different selection is available for that section. Add topics or reduce the question count. The paper is unchanged.",
        );
      }
