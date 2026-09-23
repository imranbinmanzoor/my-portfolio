# Mathematics correction log

Findings from an independent correctness audit (September 2026). **No correction has been applied to the mathematics.**
The affected files are locked sources (`tests/locked-sources.json`): Class 9 exists only as
rendered SVG with no recoverable authoring source, and Class 10 content is extracted data.
Correct them in the authoring source, then update the recorded hash in the same commit.

Method: every Class 10 final answer (130 parts, 388 bank items) was recomputed independently
with SymPy; ~6,600 relations in worked solutions were checked automatically or by hand; every
MCQ was checked for exactly one correct option at the keyed index. The Class 9 bank (367 items)
was decoded from its MathJax SVG and checked by item family. The Class 9 reading pages (SVG in
`src/books/class-9/shell.html`) were **not** part of this audit.

## Class 10 — Unit 1, Complex Numbers

No wrong answers, wrong keys or false steps were found.

| ID | Kind | Finding | Suggested action |
|---|---|---|---|
| `d-1.4-1` (note) | Doubtful wording | "For n=−1 the imaginary part carries a minus sign." Im((x+iy)⁻¹) = −y/(x²+y²): the *formula* has a minus sign, but the value's sign depends on y (the book's own `ex14-q1-iii` answer is +5/41). | Reword, e.g. "…the imaginary part is −y/(x²+y²); its sign is opposite to the sign of y." |
| `ex13-q4` (stem) | Doubtful | Verifies \|z̄̄\| (double conjugate), which is trivially \|z\|; related items `d-1.3-5` and bank `u1-long-027` use \|z̄\|. | Compare with the printed textbook; likely \|z̄\|. |
| `rev1-q9` (check note) | Notation | The check reuses the unknowns' letters ("a=3 and b=4i") while the answer is a=3/25, b=4/25. | Use different letters in the check. |

## Class 9 — Unit 1, Real Numbers (question bank)

| ID | Kind | Finding | Suggested action |
|---|---|---|---|
| `c12-rat-1` | **Error** | "Rationalize 1/(√3+√2)": key "(√3−√2)/1" and option 2 "√3−√2" are the same number — two correct options. | Replace the distractor. |
| `c12-rat-2` | **Error** | Same defect for 1/(√4+√3). Note √4 = 2 is rational. | Replace the distractor; consider non-square radicands. |
| `c12-rat-4` | **Error** | Same defect for 1/(√6+√5). | Replace the distractor. |
| `c12-sqrt` family (36 MCQs) | Doubtful | Option "√n" equals the keyed "k√m"; correct only if the stem demands simplest form. | Say "in simplest form", or change the distractor. |
| `c11-rec-9` | Doubtful | "0.9 recurring is:" keyed "nonterminating recurring", but 0.999… = 1 also terminates (the book's notes say so). | Change the item or accept both readings. |
| `l12-rat-5/7/9/13/15/19` | Doubtful | "Rationalize and simplify" answers keep a common factor, e.g. (52−14√3)/46 → (26−7√3)/23. | Reduce the answers. |
| `s12-index-9` | Notation | `5^10` renders as 5¹0 (only the 1 raised) in the question and first step. | Brace the exponent: `5^{10}`. |
| `s11-between-*`, `l11-avg-*` | Notation | Correct values left unreduced (24/4, 10/2, 178/4). | Reduce. |
| `c11-between-5` | Notation | "(−3+−1)/2" without a bracket around −1. | Write (−3+(−1))/2. |
| 87 items | Accessibility | SVG `aria-label`s contain raw TeX; in 32 a variable is dropped, so the spoken text states a false equation (e.g. `c13-linear-1`). | Regenerate labels from the source TeX when it is recovered. (TeX debris is now removed at render time; the dropped variables remain.) |

## Presentation and style findings in locked content (independent site review, September 2026)

These come from a separate site review, not the correctness audit. None changes a
mathematical result. **None has been applied to the locked sources.**

| Where | Kind | Finding | Suggested action |
|---|---|---|---|
| Class 9 reading pages | Style (owner rule: no punctuation after display mathematics) | 44 display equations end with a period, and 9 more end internal lines with commas. By section: Ex 1.1 concepts "Additional notes" 1; Examples 2–5: 7; Examples 7–8: 5; Examples 9–14: 12; Review Exercise Q1 (vii, ix, x) 3, Q2 4, Q5 2, Q6 (i–iii) 3, Q7 4, Q8 3. | Remove the final punctuation in the TeX when the Class 9 source is recovered. |
| Class 10 `ex12-concepts`, `ex13-concepts` (3 lines), `u-1.3-conjugate-quotient`, `u-1.4-squared-parts`, `u-1.4-extract` (2) | Style | 8 lines inside 6 multi-line `aligned` displays end with a comma that separates two results; no display ends with punctuation. | Owner to decide whether separator commas inside a display count under the rule. |
| Class 9 reading pages (2,103 spoken labels) and bank | Accessibility | 105 labels carried TeX debris (`\;`, `\ `, `\\`, `&`, `\%`); about 29 drop "≠" (e.g. "q 0"); "√2 = p/q" reads "2= pq"; set braces and "⇒" are lost. | Regenerate every label from the source TeX when it is recovered. |
| Class 9 reading pages | Copy | British spellings: centre ×3, recognise ×2, recognising, labelling, cancelled ×4, cancelling ×2. | US spelling in the source. |
| Class 9 shell | Structure | H1 is followed by H3 "Concepts" in the unit view; "Unit-Test Pattern · 75 Marks" is in title case. | Fix in the source. |
| Class 9 search index (`book-data.json`) | Search | Snippets are built from flattened text, so symbols are missing ("q 0", "0. 3 recurring = 13"). | Rebuild the index text from the source TeX. |

**Applied without changing any source (documented presentation transform).** TeX debris is
removed from the spoken labels at build time for the Class 9 reading page
(`scripts/math-labels.mjs`) and at render time for generated papers
(`src/books/class-9/runtime-2.js`). Only spacing and alignment commands and escaped percent
signs are removed; no word is added, so the missing symbols listed above are still missing.
After the transform, no label in the built page contains a backslash. The locked files keep
their recorded hashes.

Full evidence (scripts, per-item results, coverage) is kept outside the public build in the
private audit evidence archive (`math-audit/REPORT.md`, `findings.json`, `work/`).
