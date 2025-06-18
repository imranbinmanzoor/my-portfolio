"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Elements ---
    const nav = document.querySelector("nav");
    const toggleBtn = document.querySelector(".toggle-btn");
    const body = document.body;
    const blurAreaElement = document.getElementById('nav-top-blur-area');
    const navHeight = nav.offsetHeight;
    const TOP_MARGIN = 16; // 1rem in pixels
    const TOTAL_HEIGHT = navHeight + TOP_MARGIN;

    // Essential element check
    if (!nav || !toggleBtn || !blurAreaElement) {
        console.warn("Essential navigation elements not found.");
        return;
    }

    // --- Scroll-Based Navigation Control ---
    let lastScrollY = window.scrollY;
    let translateY = 0;
    let isDragging = false;
    let startY = 0;

    const applyNavTransform = (isFinalPosition = false) => {
        if (isFinalPosition) {
            // Apply 50% threshold rule when releasing
            const visibleAmount = TOTAL_HEIGHT + translateY; // How much is visible
            if (visibleAmount < TOTAL_HEIGHT * 0.5) {
                translateY = -TOTAL_HEIGHT; // Hide completely
            } else {
                translateY = 0; // Show completely
            }
            
            // Smooth transition to final position
            nav.style.transition = 'transform 0.2s ease-out';
            blurAreaElement.style.transition = 'opacity 0.2s ease-out';
        } else {
            // During interaction - no transition, direct sync
            nav.style.transition = 'none';
            blurAreaElement.style.transition = 'none';
        }
        
        // Apply the transform
        nav.style.transform = `translateY(${translateY}px)`;
        
        // Calculate visibility (0 = hidden, 1 = fully visible)
        const visibility = 1 - (Math.abs(translateY) / TOTAL_HEIGHT);
        blurAreaElement.style.opacity = `${visibility}`;
        blurAreaElement.style.pointerEvents = visibility > 0.5 ? 'auto' : 'none';
    };

    const handleScroll = (e) => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        
        // Only transform in mobile view and when nav isn't expanded
        if (window.matchMedia('(max-width: 800px)').matches && 
            !nav.classList.contains('nav-expanded')) {
            
            // Calculate new position during scroll
            translateY = Math.max(-TOTAL_HEIGHT, Math.min(0, translateY - scrollDelta));
            applyNavTransform(false);
        }

        // Always show when at top of page
        if (currentScrollY <= TOP_MARGIN) {
            translateY = 0;
            applyNavTransform(true);
        }

        lastScrollY = currentScrollY;
    };

    // Touch/mouse interaction handlers
    const handleInteractionStart = (e) => {
        isDragging = true;
        startY = e.clientY || e.touches[0].clientY;
        nav.style.transition = 'none';
        blurAreaElement.style.transition = 'none';
    };

    const handleInteractionMove = (e) => {
        if (!isDragging) return;
        const y = e.clientY || e.touches[0].clientY;
        const deltaY = startY - y;
        startY = y;
        
        if (window.matchMedia('(max-width: 800px)').matches && 
            !nav.classList.contains('nav-expanded')) {
            translateY = Math.max(-TOTAL_HEIGHT, Math.min(0, translateY - deltaY));
            applyNavTransform(false);
        }
    };

    const handleInteractionEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        if (window.matchMedia('(max-width: 800px)').matches && 
            !nav.classList.contains('nav-expanded')) {
            applyNavTransform(true);
        }
        
        // Remove transitions after animation completes
        setTimeout(() => {
            nav.style.transition = 'none';
            blurAreaElement.style.transition = 'none';
        }, 200);
    };

    // --- Toggle Navigation ---
    const toggleNav = () => {
        const isExpanded = nav.classList.toggle("nav-expanded");
        toggleBtn.setAttribute("aria-expanded", isExpanded.toString());
        body.classList.toggle("body-no-scroll", isExpanded);

        if (isExpanded) {
            translateY = 0;
            applyNavTransform(true);
        }
    };

    // --- Event Listeners ---
    toggleBtn.addEventListener("click", toggleNav);
    
    document.querySelectorAll(".site-nav-item, .social-account").forEach(item => {
        item.addEventListener("click", () => {
            if (nav.classList.contains("nav-expanded")) toggleNav();
        });
    });

    // Scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Touch events
    nav.addEventListener('touchstart', handleInteractionStart);
    document.addEventListener('touchmove', handleInteractionMove);
    document.addEventListener('touchend', handleInteractionEnd);
    
    // Mouse events
    nav.addEventListener('mousedown', handleInteractionStart);
    document.addEventListener('mousemove', handleInteractionMove);
    document.addEventListener('mouseup', handleInteractionEnd);

    // Handle resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 800 && nav.classList.contains("nav-expanded")) {
            toggleNav();
        }
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

    // --- Mobile Skill Cards ---
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

    // Initialize
    applyNavTransform(false);
});