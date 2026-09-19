/* Multiplication by i maps (a, b) to (-b, a); no random or decorative data. */
(() => {
  const study = document.querySelector('.complex-study');
  if (!study) return;
  const vector = study.querySelector('[data-study-vector]');
  const orbit = study.querySelector('[data-study-orbit]');
  const guides = study.querySelector('[data-study-guides]');
  const value = study.querySelector('[data-study-value]');
  const reset = study.querySelector('[data-study-reset]');
  const description = study.querySelector('#complex-diagram-desc');
  function typeset(element, tex) {
    if (window.katex) window.katex.render(tex, element, {throwOnError: true, output: 'htmlAndMathml', trust: false});
    else element.textContent = tex; // Readable fallback if the external renderer is unavailable.
  }
  study.querySelectorAll('[data-study-tex]').forEach(element => typeset(element, element.dataset.studyTex));
  let a = 3, b = 4, turns = 0;
  function render() {
    typeset(value, `z=${a}${b < 0 ? '-' : '+'}${Math.abs(b)}i`);
    vector.style.transform = `rotate(${-90 * turns}deg)`;
    orbit.style.transform = vector.style.transform;
    guides.setAttribute('d', `M ${240 + 32 * a} 220 V ${220 - 32 * b} H 240`);
    description.textContent = `The point ${a} ${b < 0 ? 'minus' : 'plus'} ${Math.abs(b)} i lies on a circle of radius 5 centred at the origin. Multiplying by i rotates it 90 degrees counterclockwise without changing its distance from the origin.`;
    reset.disabled = turns === 0;
  }
  study.querySelector('[data-study-rotate]').addEventListener('click', () => {
    [a, b] = [-b, a];
    turns += 1;
    render();
  });
  reset.addEventListener('click', () => { a = 3; b = 4; turns = 0; render(); });
  study.querySelector('[data-study-controls]').hidden = false;
})();
