"use strict";

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
