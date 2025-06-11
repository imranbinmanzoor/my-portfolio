"use strict";

const bigPicCont = document.querySelector(".big-picture-cont");
const bigProjImg = document.querySelector(".big-proj-img");
const viewprojectOverlay = document.querySelector(".view-project-overlay");
const eyeIcon = document.querySelector(".eye-icon");
const viewProjectText = document.querySelector(".view-project-text");

bigPicCont.addEventListener("mouseover", function () {
  bigProjImg.style.transform = "scale(0.95)";
  viewprojectOverlay.style.visibility = "visible";
  eyeIcon.style.transform = "scale(1)";
  viewProjectText.style.transform = "scale(1)";
});

bigPicCont.addEventListener("mouseleave", function () {
  bigProjImg.style.transform = "scale(1)";
  viewprojectOverlay.style.visibility = "hidden";
  eyeIcon.style.transform = "scale(0)";
  viewProjectText.style.transform = "scale(0)";
});

// -----------------------------
// -----------------------------
// -----------------------------
// -----------------------------
// -----------------------------
// -----------------------------

document.addEventListener("DOMContentLoaded", function () {
  const bigPic = document.querySelector(".big-proj-img");
  const thumbnailContainers = document.querySelectorAll(".more-pic-cont");

  // Find all thumbnail images (including those with IDs)
  const thumbImages = Array.from(thumbnailContainers).map((container) => {
    return container.querySelector("img:not(.eye-icon img)"); // Exclude eye icon
  });

  function updateGallery() {
    thumbnailContainers.forEach((container, index) => {
      const thumbImg = thumbImages[index];

      // Reset all containers and images
      container.style.border = "none";
      container.style.borderRadius = "8px";
      if (thumbImg) {
        thumbImg.style.transform = "scale(1)";
        thumbImg.style.transition = "transform 0.25s ease-in-out";
      }

      // Highlight active thumbnail container
      if (thumbImg && bigPic.src === thumbImg.src) {
        container.style.border = "1px solid #000";
      }
    });
  }

  // Initialize gallery
  updateGallery();

  // Add event listeners
  thumbnailContainers.forEach((container, index) => {
    const thumbImg = thumbImages[index];
    if (!thumbImg) return;

    // Hover effects - scales the image inside
    container.addEventListener("mouseenter", () => {
      if (bigPic.src !== thumbImg.src) {
        thumbImg.style.transform = "scale(1.05)";
      }
    });

    container.addEventListener("mouseleave", () => {
      thumbImg.style.transform = "scale(1)";
    });

    // Click handler
    container.addEventListener("click", () => {
      if (bigPic.src !== thumbImg.src) {
        bigPic.src = thumbImg.src;
        updateGallery();
      }
    });
  });
});