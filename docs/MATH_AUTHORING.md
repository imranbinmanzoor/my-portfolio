# Mathematics authoring and review

## Canonical material and review boundary

Class 10 `content/books/class-10/` holds extracted authoring JSON, textbook metadata,
and the question bank. Do not change IDs, bank versions, provenance or saved-paper
compatibility casually. Class 9 JSON/bank data is extracted, but its reading mathematics
is retained SVG in `src/books/class-9/shell.html`. Its original LaTeX/generator is missing.
Never reconstruct mathematical source from search text without independent review.

Historical editions (`ff3fe31`, `7dcf3a5`) are recovery candidates. Preserve their Git
identity and compare their content before accepting or restoring it. Do not imply
current board approval from an experimental edition or an unverified session.

## Mathematical requirements

- Verify assumptions, domains, nonzero divisors, signs, transformations, and notation.
- Preserve logically necessary intermediate steps, definitions and restrictions.
- Use the math system for mathematical numbers, variables, symbols and expressions
  within prose as appropriate. Interface labels and class names are not equations.
- Display mathematics has no terminal comma, semicolon, colon or period. Preserve
  internal punctuation such as ordered-pair commas and decimal points.
- Renderer success, matching final answers, or AI authorship is not proof of correctness.
- Use standard mathematical typography everywhere, including diagrams and interface
  artifacts: italic mathematical variables, upright numerals, upright named functions
  and operators, and renderer-controlled relation/operator spacing. Complex-plane axes
  use `\mathrm{Re}` and `\mathrm{Im}`, not prose fonts or italic letter pairs. Use
  `\operatorname{...}` when a named operator must supply mathematical operator spacing.
  The portfolio study uses the same pinned KaTeX/LaTeX fonts as the Class 10 book.
- Use genuine italic glyphs, never an oblique/slanted font or synthetic browser skew.
  Do not substitute `\mathsl`/`\textsl` for mathematical or prose italics.
- Review mathematical edits separately from presentation edits and record the evidence.

## Full and compact solutions

Compact means concise professional textbook presentation, never shortened reasoning.
Introduce independent calculations with short prose. Align only equations belonging
to one derivation. Preserve intermediate algebra and appropriate checks. Do not
create one display for each prose sentence or put unrelated calculations in an
equals-sign wall. Full and compact solutions must agree mathematically while remaining
intentionally different presentations.

Hints identify the real transition: the parity rule for powers of minus one, the
conjugate used, the exponent law, collected terms, or the operation on an equation.
Avoid vague sign slogans. Style hints as readable muted-blue text, thin border,
no fill. Review MCQs may remain compact-only; written reviews need full reasoning.

## Practice contract

Preserve Objective and Subjective; Part I short questions and Part II long questions.
Required attempts determine marks, generated instructions, and separate section times.
Both section headers contain Name, Roll number and Date; show total marks.
Subjective starts on a fresh A4 page after Objective. No added writing space or blank
complex planes. Measure MCQ options after typesetting: four only when all fit;
otherwise a/b then c/d. Key letters are lowercase.

Keep search on Practice, visible topics, expandable choices, aligned counts, and
short-set controls alongside enabled short choices. Only Back to paper settings
is sticky in paper view. Randomize precedes the paper; Print/Save/Answer key follow.
Invalid settings retain the current paper. Partial randomization preserves untouched
questions and option order. Six-digit recall numbers are local to a browser; portable
paper files are the cross-device path.

Current preservation checks do not certify all existing solutions. An independent
content review remains a separate workstream after the pilot.
