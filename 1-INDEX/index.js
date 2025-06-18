"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Elements (Consolidated) ---
    const nav = document.querySelector("nav");
    const toggleBtn = document.querySelector(".toggle-btn");
    const body = document.body;
    const blurAreaElement = document.getElementById('nav-top-blur-area');

    // Essential element check
    if (!nav || !toggleBtn || !blurAreaElement) {
        console.warn("Essential navigation elements (nav, toggleBtn, or #nav-top-blur-area) not found. Some functionality may not work.");
        return;
    }

    // --- Variables for Scroll Handling ---
    let lastScrollY = window.scrollY;
    let ticking = false;
    const SCROLL_THRESHOLD = 10; // Minimum scroll distance to trigger hide/show
    const NAV_HEIGHT = nav.offsetHeight;

    // --- Function to Toggle Navigation (Open/Close) ---
    const toggleNav = () => {
        const isExpanded = nav.classList.toggle("nav-expanded");
        toggleBtn.setAttribute("aria-expanded", isExpanded.toString());
        body.classList.toggle("body-no-scroll", isExpanded);

        // When the nav is expanded, ensure both nav and blur area are visible
        if (isExpanded) {
            nav.classList.remove('hide-on-scroll');
            blurAreaElement.classList.remove('hide-blur-area');
        }
    };

    // Event listener for the hamburger/toggle button
    toggleBtn.addEventListener("click", toggleNav);

    // --- Close Nav on Navigation Item Click ---
    document.querySelectorAll(".site-nav-item, .social-account").forEach(item => {
        item.addEventListener("click", () => {
            if (nav.classList.contains("nav-expanded")) {
                toggleNav();
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

    // --- Improved Hide/Show Nav and Blur on Scroll (Mobile Only) ---
    const applyNavVisibility = () => {
        const currentScrollY = window.scrollY;
        const isNavExpanded = nav.classList.contains('nav-expanded');
        const isMobileBreakpoint = window.matchMedia('(max-width: 800px)').matches;

        if (!isMobileBreakpoint || isNavExpanded) {
            // Always show on desktop or when nav is expanded
            nav.classList.remove('hide-on-scroll');
            blurAreaElement.classList.remove('hide-blur-area');
            return;
        }

        const scrollDifference = currentScrollY - lastScrollY;
        
        // Show/hide based on scroll direction and position
        if (Math.abs(scrollDifference) > SCROLL_THRESHOLD) {
            if (scrollDifference > 0 && currentScrollY > NAV_HEIGHT) {
                // Scrolling down - hide
                nav.classList.add('hide-on-scroll');
                blurAreaElement.classList.add('hide-blur-area');
            } else if (scrollDifference < 0) {
                // Scrolling up - show
                nav.classList.remove('hide-on-scroll');
                blurAreaElement.classList.remove('hide-blur-area');
            }
        }

        // Always show at very top of page
        if (currentScrollY <= 5) {
            nav.classList.remove('hide-on-scroll');
            blurAreaElement.classList.remove('hide-blur-area');
        }

        lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                applyNavVisibility();
                ticking = false;
            });
            ticking = true;
        }
    };

    // --- Unified Resize Handler ---
    const handleResize = () => {
        // If resizing from mobile to tablet/desktop AND nav is expanded, close it
        if (window.innerWidth > 800 && nav.classList.contains("nav-expanded")) {
            toggleNav();
        }
        // If resizing into mobile breakpoint, reset nav scroll to prevent awkward states
        if (window.innerWidth <= 800) {
            nav.scrollTop = 0;
        }
        applyNavVisibility();
    };

    // --- Event Listeners ---
    window.addEventListener('scroll', handleScroll);
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