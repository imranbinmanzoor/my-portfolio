"use strict";

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Elements ---
    const nav = document.querySelector("nav");
    const toggleBtn = document.querySelector(".toggle-btn");
    const body = document.body;

    if (!nav || !toggleBtn) {
        console.warn("Essential navigation elements not found.");
        return;
    }

    // --- Function to Toggle Navigation ---
    const toggleNav = () => {
        const isExpanded = nav.classList.toggle("nav-expanded");
        toggleBtn.setAttribute("aria-expanded", isExpanded.toString());
        body.classList.toggle("body-no-scroll", isExpanded); // Prevents background scroll
    };

    toggleBtn.addEventListener("click", toggleNav);

    // --- Close Nav on Item Click or Resize ---
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

    // --- Hide/Show Nav on Scroll ---
    let lastScrollY = window.scrollY;
    let animationFrameId = null;

    const applyNavVisibility = () => {
        const currentScrollY = window.scrollY;
        const isNavExpanded = nav.classList.contains('nav-expanded');
        const isMobile = window.innerWidth <= 800;

        if (isMobile) {
            if (isNavExpanded) {
                nav.classList.remove('hide-on-scroll');
                lastScrollY = currentScrollY;
                return;
            }

            const scrollingDown = currentScrollY > lastScrollY;
            const shouldHide = scrollingDown && currentScrollY > (nav.offsetTop + nav.offsetHeight);
            
            nav.classList.toggle('hide-on-scroll', shouldHide);
            
            if (currentScrollY <= 0) {
                nav.classList.remove('hide-on-scroll');
            }
        } else {
            nav.classList.remove('hide-on-scroll');
        }

        lastScrollY = currentScrollY;
    };

    const scheduleNavVisibilityCheck = () => {
        if (animationFrameId) return;
        animationFrameId = requestAnimationFrame(() => {
            applyNavVisibility();
            animationFrameId = null;
        });
    };

    // --- Unified Resize Handler ---
    const handleResize = () => {
        if (window.innerWidth > 800 && nav.classList.contains("nav-expanded")) {
            toggleNav();
        }
        if (window.innerWidth <= 800) {
            nav.scrollTop = 0; // Reset nav scroll on mobile
        }
        applyNavVisibility(); // Re-check nav visibility on resize
    };

    window.addEventListener('scroll', scheduleNavVisibilityCheck);
    window.addEventListener('resize', handleResize);

    applyNavVisibility(); // Initial check on load
});