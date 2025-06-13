// From script.js: IntersectionObserver for sticky nav
const sectionHeroEl = document.querySelector(".section-hero");

const obs = new IntersectionObserver(
  function (entries) {
    const ent = entries[0];
    if (!ent.isIntersecting) {
      document.body.classList.add("sticky"); /* Adds class to body for sticky styles */
    } else {
      document.body.classList.remove("sticky");
    }
  },
  {
    root: null, // Observe the viewport
    threshold: 0, // Trigger when 0% of target is visible
    rootMargin: "-80px", // Trigger 80px before target leaves viewport (accounting for header height)
  }
);
obs.observe(sectionHeroEl);