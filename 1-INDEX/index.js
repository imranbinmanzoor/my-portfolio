"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Elements ---
    const nav = document.querySelector("nav");
    const toggleBtn = document.querySelector(".toggle-btn");
    const body = document.body;
    const blurAreaElement = document.getElementById('nav-top-blur-area');
    const navHeight = nav.offsetHeight;
    const TOP_MARGIN = 16; // 1rem in pixels (assuming 16px base)

    // Essential element check
    if (!nav || !toggleBtn || !blurAreaElement) {
        console.warn("Essential navigation elements not found.");
        return;
    }

    // --- Scroll-Based Navigation Control ---
    let lastScrollY = window.scrollY;
    let ticking = false;
    let translateY = 0;

    const applyNavTransform = () => {
        // Calculate how much of the nav is visible (0 = fully hidden, 1 = fully visible)
        const visibilityRatio = 1 - (Math.abs(translateY) / (navHeight + TOP_MARGIN));
        
        // Apply transform while maintaining 1rem top margin when visible
        nav.style.transform = `translateY(${translateY}px)`;
        
        // Control blur area (matches nav visibility)
        blurAreaElement.style.opacity = `${visibilityRatio}`;
        blurAreaElement.style.pointerEvents = visibilityRatio > 0.5 ? 'auto' : 'none';
    };

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const scrollDelta = currentScrollY - lastScrollY;
                
                // Only transform in mobile view and when nav isn't expanded
                if (window.matchMedia('(max-width: 800px)').matches && 
                    !nav.classList.contains('nav-expanded')) {
                    
                    // Calculate new position (accounting for the 1rem top margin in hide distance)
                    translateY = Math.max(-(navHeight + TOP_MARGIN), Math.min(0, translateY - scrollDelta));
                    
                    applyNavTransform();
                }

                // Always show when at top of page
                if (currentScrollY <= TOP_MARGIN) {
                    translateY = 0;
                    applyNavTransform();
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    };

    // --- Toggle Navigation ---
    const toggleNav = () => {
        const isExpanded = nav.classList.toggle("nav-expanded");
        toggleBtn.setAttribute("aria-expanded", isExpanded.toString());
        body.classList.toggle("body-no-scroll", isExpanded);

        if (isExpanded) {
            // When expanding, reset position and show blur
            translateY = 0;
            applyNavTransform();
        }
    };

    // --- Event Listeners ---
    toggleBtn.addEventListener("click", toggleNav);
    
    document.querySelectorAll(".site-nav-item, .social-account").forEach(item => {
        item.addEventListener("click", () => {
            if (nav.classList.contains("nav-expanded")) toggleNav();
        });
    });

    window.addEventListener('scroll', handleScroll);

    // --- Handle resize events ---
    window.addEventListener('resize', () => {
        if (window.innerWidth > 800 && nav.classList.contains("nav-expanded")) {
            toggleNav();
        }
    });

    // --- Initialize position ---
    applyNavTransform();

    // ... (rest of your existing code for skill cards, project cards, etc.)
});