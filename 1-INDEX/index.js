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