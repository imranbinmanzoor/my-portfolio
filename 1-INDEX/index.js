"use strict";

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Elements (Consolidated) ---
    const nav = document.querySelector("nav");
    const toggleBtn = document.querySelector(".toggle-btn");
    const body = document.body;
    const blurAreaElement = document.getElementById('nav-top-blur-area'); // <--- Correctly defined here

    // Essential element check
    if (!nav || !toggleBtn || !blurAreaElement) { // <--- Added blurAreaElement to check
        console.warn("Essential navigation elements (nav, toggleBtn, or #nav-top-blur-area) not found. Some functionality may not work.");
        return;
    }

    // --- Function to Toggle Navigation (Open/Close) ---
    const toggleNav = () => {
        const isExpanded = nav.classList.toggle("nav-expanded");
        toggleBtn.setAttribute("aria-expanded", isExpanded.toString()); // Update ARIA attribute for accessibility
        body.classList.toggle("body-no-scroll", isExpanded); // Prevent background scrolling when nav is open

        // When the nav is expanded, ensure both nav and blur area are visible
        // This overrides any 'hide-on-scroll' state that might be active
        if (isExpanded) {
            nav.classList.remove('hide-on-scroll');
            blurAreaElement.classList.remove('hide-blur-area'); // Ensure blur is visible when nav is expanded
        }
    };

    // Event listener for the hamburger/toggle button
    toggleBtn.addEventListener("click", toggleNav);

    // --- Close Nav on Navigation Item Click ---
    // If nav is expanded on mobile, close it when a nav item or social link is clicked
    document.querySelectorAll(".site-nav-item, .social-account").forEach(item => {
        item.addEventListener("click", () => {
            if (nav.classList.contains("nav-expanded")) {
                toggleNav(); // Call toggleNav to close the nav
            }
        });
    });

    // --- Skill Card Animations ---
    const skillCards = document.querySelectorAll(".skill-card");

    const handleSkillCardAnimation = (card, isMouseOver) => {
        const bigIcon = card.querySelector(".big-icon");
        const textCard = card.querySelector(".text-card");
        const textCardPara = card.querySelector(".text-card-para");
        const caretUp = card.querySelector(".caret-up");

        if (bigIcon) bigIcon.classList.toggle("big-icon-transformed", isMouseOver);
        if (textCard) textCard.classList.toggle("move-up", isMouseOver);
        if (textCardPara) textCardPara.classList.toggle("hidden", !isMouseOver);
        if (caretUp) caretUp.style.transform = isMouseOver ? "scale(0)" : "scale(1)";
    };

    skillCards.forEach(card => {
        card.addEventListener("mouseover", () => handleSkillCardAnimation(card, true));
        card.addEventListener("mouseleave", () => handleSkillCardAnimation(card, false));
    });

    // --- Project Card Animations ---
    const projectContainers = document.querySelectorAll(".proj-cont");

    const handleProjectAnimation = (container, isMouseOver) => {
        const projImg = container.querySelector(".proj-img");
        const overlay = container.querySelector(".view-project-overlay");
        const eyeIcon = container.querySelector(".eye-icon");
        const viewText = container.querySelector(".view-project-text");

        const scale = isMouseOver ? "scale(0.95)" : "scale(1)";
        const visibility = isMouseOver ? "visible" : "hidden";
        const transform = isMouseOver ? "scale(1)" : "scale(0)";

        if (projImg) projImg.style.transform = scale;
        if (overlay) overlay.style.visibility = visibility;
        if (eyeIcon) {
            eyeIcon.style.visibility = visibility;
            eyeIcon.style.transform = transform;
        }
        if (viewText) {
            viewText.style.visibility = visibility;
            viewText.style.transform = transform;
        }
    };

    projectContainers.forEach(container => {
        container.addEventListener("mouseover", () => handleProjectAnimation(container, true));
        container.addEventListener("mouseleave", () => handleProjectAnimation(container, false));
    });

    // --- Hide/Show Nav and Blur on Scroll (Mobile Only) ---
    let lastScrollY = window.scrollY;
    let animationFrameId = null;

    const applyNavVisibility = () => {
        const currentScrollY = window.scrollY;
        const isNavExpanded = nav.classList.contains('nav-expanded');
        const isMobileBreakpoint = window.matchMedia('(max-width: 800px)').matches;

        if (isMobileBreakpoint) {
            // Logic for mobile (top-fixed nav)
            if (isNavExpanded) {
                // If nav is expanded, ensure it and the blur are visible regardless of scroll direction
                nav.classList.remove('hide-on-scroll');
                blurAreaElement.classList.remove('hide-blur-area'); // Ensure blur is visible
                lastScrollY = currentScrollY; // Reset lastScrollY to prevent immediate hide on close
                return; // Exit, as expanded nav doesn't hide on scroll
            }

            const scrollingDown = currentScrollY > lastScrollY;
            // Determine if the nav should hide. It hides only if scrolling down AND
            // current scroll position is beyond the bottom of the nav (to avoid hiding too early)
            const shouldHide = scrollingDown && currentScrollY > (nav.offsetTop + nav.offsetHeight);

            // Apply/remove the 'hide-on-scroll' class to the nav and 'hide-blur-area' to the blur element
            nav.classList.toggle('hide-on-scroll', shouldHide);
            blurAreaElement.classList.toggle('hide-blur-area', shouldHide); // <--- Toggling blur area visibility here

            // Always show nav and blur when scrolled back to the very top of the page
            if (currentScrollY <= 0) {
                nav.classList.remove('hide-on-scroll');
                blurAreaElement.classList.remove('hide-blur-area'); // <--- Ensure blur is visible at top
            }
        } else {
            // Logic for tablet/desktop (side-fixed nav)
            // Ensure nav is always visible and blur area is hidden (CSS display: none also contributes here)
            nav.classList.remove('hide-on-scroll');
            blurAreaElement.classList.add('hide-blur-area'); // Explicitly hide blur on non-mobile
        }

        lastScrollY = currentScrollY; // Update last scroll position for the next check
    };

    // Use requestAnimationFrame for scroll events to improve performance
    const scheduleNavVisibilityCheck = () => {
        if (animationFrameId) return; // If a frame is already scheduled, do nothing
        animationFrameId = requestAnimationFrame(() => {
            applyNavVisibility(); // Execute the visibility check
            animationFrameId = null; // Clear the ID after execution
        });
    };

    // --- Unified Resize Handler ---
    const handleResize = () => {
        // If resizing from mobile to tablet/desktop AND nav is expanded, close it
        if (window.innerWidth > 800 && nav.classList.contains("nav-expanded")) {
            toggleNav(); // This will also reset hide-on-scroll/hide-blur-area states
        }
        // If resizing into mobile breakpoint, reset nav scroll to prevent awkward states
        if (window.innerWidth <= 800) {
            nav.scrollTop = 0; // Ensure nav is scrolled to top when it becomes mobile
        }
        applyNavVisibility(); // Re-check nav and blur visibility based on new screen size
    };

    // --- Event Listeners ---
    window.addEventListener('scroll', scheduleNavVisibilityCheck);
    window.addEventListener('resize', handleResize);

    // Initial checks on page load to set the correct nav and blur state
    applyNavVisibility();
});


// MOBILE SKILL CARDS
const caretUpMob = document.querySelectorAll(".caret-up-mob");
const skillCardMob = document.querySelectorAll(".skill-card-mob");
const textCardParaMob = document.querySelectorAll(".text-card-para-mob");
const bigIconMob = document.querySelectorAll(".big-icon-mob");
const textCardHeadingMob = document.querySelectorAll(".text-card-heading-mob");

caretUpMob.forEach((caret, index) => {
  caret.addEventListener("click", () => {
    caret.classList.toggle("flipped");
    textCardHeadingMob[index].classList.toggle("transformed");
    textCardParaMob[index].classList.toggle("shown");
    bigIconMob[index].classList.toggle("transformed");
  });
});