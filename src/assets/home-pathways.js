(() => {
  'use strict';
  const demo = document.querySelector('[data-interface-demo]');
  if (!demo) return;
  const grid = demo.querySelector('.preview-projects');
  const controls = demo.querySelector('.demo-format');
  const buttons = [...controls.querySelectorAll('button')];
  const source = demo.querySelector('[data-layout-source]');
  const cardsSource = source.textContent;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const listSource = `/* The same projects, in a compact list. */
.preview-projects[data-layout=list] {
  grid-template-columns: minmax(0, 1fr);
}
.preview-projects[data-layout=list] .preview-project {
  grid-template-columns: 100px minmax(0, 1fr);
  align-items: center;
}`;
  let motion;
  function select(button) {
    const layout = button.dataset.layout;
    if (grid.dataset.layout === layout) return;
    motion?.cancel();
    grid.dataset.layout = layout;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    source.textContent = layout === 'list' ? listSource : cardsSource;
    if (!reducedMotion.matches) {
      motion = grid.animate([{opacity: .65, transform: 'translateY(4px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 180, easing: 'ease-out'});
    }
  }
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) motion?.cancel(); });
  buttons.forEach(button => button.addEventListener('click', () => select(button)));
  controls.hidden = false;
})();
