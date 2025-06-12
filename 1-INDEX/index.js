"use strict";

const nav = document.querySelector("nav");
const toggleBtn = document.querySelector(".toggle-btn");

// Select all skill cards
const skillCards = document.querySelectorAll(".skill-card");
const bigIcons = document.querySelectorAll(".big-icon");
const textCards = document.querySelectorAll(".text-card");
const textCardParas = document.querySelectorAll(".text-card-para");
const caretUps = document.querySelectorAll(".caret-up");

// Iterate over each skill card and attach event listeners
skillCards.forEach((skillCard, index) => {
  skillCard.addEventListener("mouseover", function () {
    bigIcons[index].classList.add("big-icon-transformed");
    textCards[index].classList.add("move-up");
    textCardParas[index].classList.remove("hidden");
    caretUps[index].style.transform = "scale(0)";
  });

  skillCard.addEventListener("mouseleave", function () {
    bigIcons[index].classList.remove("big-icon-transformed");
    textCards[index].classList.remove("move-up");
    textCardParas[index].classList.add("hidden");
    caretUps[index].style.transform = "scale(1)";
  });
});
/////////////////////// end of skills cards animations

// Function to toggle navigation state
function toggleNav() {
  nav.classList.toggle("nav-expanded");
  // Set aria-expanded attribute for accessibility
  const isExpanded = nav.classList.contains("nav-expanded");
  toggleBtn.setAttribute("aria-expanded", isExpanded);
}

// Event listener for the toggle button
toggleBtn.addEventListener("click", toggleNav);

// Optional: Close nav when a nav item or social account is clicked (common mobile pattern)
document.querySelectorAll(".site-nav-item, .social-account").forEach((item) => {
  item.addEventListener("click", () => {
    if (nav.classList.contains("nav-expanded")) {
      toggleNav(); // Use the toggleNav function to also update aria-expanded
    }
  });
});

// Optional: Close nav if window is resized above mobile breakpoint (e.g., from expanded mobile to desktop view)
window.addEventListener("resize", () => {
  if (window.innerWidth > 800 && nav.classList.contains("nav-expanded")) {
    toggleNav(); // Collapse nav if resized to desktop while expanded
  }
});

// To scroll the nav to the top in mobile mode
window.addEventListener('resize', () => {
  if (window.innerWidth <= 800) {
    nav.scrollTop = 0;
  }
});

function stopScrollPropagation(event) {
  if (nav.classList.contains('expanded') && window.innerWidth <= 800) {
    event.stopPropagation();
  }
}

// Prevent scroll and touchmove from bubbling to the body
['wheel', 'touchmove'].forEach(evt => {
  nav.addEventListener(evt, stopScrollPropagation, { passive: false });
});

// Overlay for mobile view



// Scrollbar for nav

// Projects animation
const projCont = document.querySelectorAll(".proj-cont");

for (let i = 0; i < projCont.length; i++) {
  // Get elements relative to the current projCont[i]
  const currentProjImg = projCont[i].querySelector(".proj-img");
  const currentViewProjectOverlay = projCont[i].querySelector(
    ".view-project-overlay"
  );
  const currentEyeIcon = projCont[i].querySelector(".eye-icon");
  const currentViewProjectText =
    projCont[i].querySelector(".view-project-text");

  projCont[i].addEventListener("mouseover", function () {
    if (currentProjImg) currentProjImg.style.transform = "scale(0.95)";
    if (currentViewProjectOverlay)
      currentViewProjectOverlay.style.visibility = "visible";
    if (currentEyeIcon) {
      currentEyeIcon.style.visibility = "visible";
      currentEyeIcon.style.transform = "scale(1)";
    }
    if (currentViewProjectText) {
      currentViewProjectText.style.visibility = "visible";
      currentViewProjectText.style.transform = "scale(1)";
    }
  });

  projCont[i].addEventListener("mouseleave", function () {
    if (currentProjImg) currentProjImg.style.transform = "scale(1)";
    if (currentViewProjectOverlay)
      currentViewProjectOverlay.style.visibility = "hidden";
    if (currentEyeIcon) {
      currentEyeIcon.style.visibility = "hidden";
      currentEyeIcon.style.transform = "scale(0)";
    }
    if (currentViewProjectText) {
      currentViewProjectText.style.visibility = "hidden";
      currentViewProjectText.style.transform = "scale(0)";
    }
  });
}


// SCROLL NAV HIDE / SHOW
//
//
//
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav'); // Select your main nav element

  // Exit if the nav element doesn't exist
  if (!nav) {
    console.warn("Navigation element not found. Scroll-hide effect won't be applied.");
    return;
  }

  let lastScrollY = 0; // Stores the previous scroll position
  const scrollTolerance = 10; // Pixels to scroll before considering it a significant movement
  let isScrollingDown = false; // Flag to track the active scroll direction
  let animationFrameId = null; // Used to optimize scroll handling with requestAnimationFrame

  function applyNavVisibility() {
    const currentScrollY = window.scrollY;
    // Get the actual bottom position of the nav (top offset + its computed height)
    const navBottomPosition = nav.offsetTop + nav.offsetHeight;

    // Check if the current screen width is within the target mobile range (480px to 800px)
    const isMobileBreakpoint = window.matchMedia('(min-width: 480px) and (max-width: 800px)').matches;

    // Check if the navigation is currently expanded (has the 'nav-expanded' class)
    const isNavExpanded = nav.classList.contains('nav-expanded');

    if (isMobileBreakpoint) {
      // If the nav is expanded, it should always be visible.
      // Remove the hide class and reset lastScrollY to prevent hiding while open.
      if (isNavExpanded) {
        nav.classList.remove('hide-on-scroll');
        lastScrollY = currentScrollY; // Reset last scroll to current when expanded
        return; // Exit the function early as expanded nav should not hide
      }

      // Determine scroll direction only if movement is significant (more than scrollTolerance)
      if (Math.abs(currentScrollY - lastScrollY) > scrollTolerance) {
        // Scrolling down: Hide nav only if current scroll is significantly below nav's bottom edge
        if (currentScrollY > lastScrollY && currentScrollY > navBottomPosition) {
          isScrollingDown = true;
        }
        // Scrolling up: Show nav only if current scroll is significantly above last scroll
        // (and not at the very top, which is handled separately)
        else if (currentScrollY < lastScrollY) {
          isScrollingDown = false;
        }
      }

      // Apply or remove the 'hide-on-scroll' class based on the determined direction
      if (isScrollingDown) {
        nav.classList.add('hide-on-scroll');
      } else {
        nav.classList.remove('hide-on-scroll');
      }

      // Always show the nav when at or very near the top of the page (within scrollTolerance pixels)
      if (currentScrollY <= scrollTolerance) {
        nav.classList.remove('hide-on-scroll');
        isScrollingDown = false; // Reset scroll direction flag as we are at the top
      }

    } else {
      // On desktop or outside the defined mobile breakpoint, ensure nav is always visible
      nav.classList.remove('hide-on-scroll');
    }

    // Update the last scroll position for the next event check
    lastScrollY = currentScrollY;
  }

  // Optimize scroll event handling using requestAnimationFrame for smoother performance
  function scheduleApplyNavVisibility() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(() => {
        applyNavVisibility();
        animationFrameId = null; // Reset the animation frame ID for the next scroll
      });
    }
  }

  // Attach the scroll event listener to the window
  window.addEventListener('scroll', scheduleApplyNavVisibility);

  // Also handle window resize events to ensure the nav state is correct
  // when switching between different screen sizes (e.g., rotating a tablet)
  window.addEventListener('resize', () => {
    // Run the visibility check immediately on resize
    applyNavVisibility();
    // And schedule for subsequent scrolls
    scheduleApplyNavVisibility();
  });

  // Perform an initial check when the page loads, in case the user
  // refreshed the page while already scrolled down.
  applyNavVisibility();
});