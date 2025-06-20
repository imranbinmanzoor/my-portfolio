# Muhammad Imran's Portfolio Website

![Portfolio Website Screenshot](IMAGES/my-portfolio.webp)
*(This is a placeholder. You should replace this with an actual screenshot of your portfolio's main page.)*

## Table of Contents

* [Introduction](#introduction)
* [Features](#features)
* [Technologies Used](#technologies-used)
* [Project Structure](#project-structure)
* [Installation](#installation)
* [Usage](#usage)
* [Live Demo](#live-demo)
* [Contact](#contact)
* [License](#license)

---

## Introduction

This repository contains the source code for Muhammad Imran's personal portfolio website. Designed as a comprehensive online showcase, this website serves as a central hub to highlight my skills as a frontend developer, present a diverse range of completed projects (including Omnifood, Modern Animated Login/Signup UI, and The Pig Game), and provide an accessible platform for professional contact.

The website emphasizes a clean, modern aesthetic with a focus on intuitive user experience and robust responsiveness across various devices.

## Features

* **Responsive Design:** Optimized for seamless viewing and interaction across all devices, from desktops to tablets and mobile phones, utilizing a mobile-first development approach with dedicated media queries.
* **Intuitive Navigation:** A clear and easy-to-use navigation system allows visitors to effortlessly browse through different sections: About, Projects, Stack, and Contact. Includes dynamic scroll-based navigation control for enhanced UX.
* **Dynamic Project Showcase:** A dedicated "Projects" section visually presents each project with interactive hover effects and links to detailed case study pages.
* **Comprehensive Skill Stack:** The "Stack" page meticulously organizes and displays my technical proficiencies, including languages, frameworks, and tools. Mobile skill cards offer expandable details for a better mobile experience.
* **Detailed About Section:** Provides insights into my formal and non-formal education, experience, and certifications.
* **Interactive Contact Form:** A user-friendly contact section allows visitors to send messages directly and provides links to professional social media profiles.
* **Reusable Image Gallery:** Project detail pages benefit from a shared JavaScript functionality for interactive image galleries with thumbnail navigation and hover effects.

## Technologies Used

The project is built using foundational web technologies:

* **HTML5:** For structuring the content and defining the semantic layout of all web pages.
* **CSS3:** For styling the website, implementing responsive design, and applying visual enhancements. Utilizes a modular approach with separate stylesheets for different sections and screen sizes.
* **JavaScript:** For adding interactivity, dynamic content manipulation (e.g., navigation control, project hover animations, mobile skill card toggles), and enhancing the user experience.

## Project Structure

The project follows a logical and organized file structure:

├── 1-INDEX/
│   ├── index.html          # Main landing page
│   ├── index.css           # Global styles for index
│   ├── index-mobile-queries.css # Mobile-specific styles for index
│   ├── index-tablet-queries.css # Tablet-specific styles for index
│   └── index.js            # JavaScript for general site interactivity
├── 2-ABOUT/
│   ├── about.html          # About Me page
│   └── about.css           # Styles for About Me page
│   └── about-mobile-queries.css # Mobile-specific styles for About Me
│   └── about-tablet-queries.css # Tablet-specific styles for About Me
├── 3-STACK/
│   ├── stack.html          # My Tech Stack page
│   └── stack.css           # Styles for Stack page
│   └── stack-mobile-queries.css # Mobile-specific styles for Stack
│   └── stack-tablet-queries.css # Tablet-specific styles for Stack
├── 4-PROJECTS/
│   ├── projects.html       # All Projects overview page
│   ├── projects.css        # Styles for Projects overview
│   ├── projects-mobile-queries.css # Mobile styles for Projects overview
│   ├── projects-tablet-queries.css # Tablet styles for Projects overview
│   ├── projects.js         # JavaScript for project hover effects
│   ├── Project-1/
│   │   ├── project-1.html  # Case study: Omnifood
│   │   ├── project-1.css   # Styles for Omnifood case study
│   │   └── project-1.js    # Reusable JS for image galleries across project pages
│   ├── Project-2/
│   │   ├── project-2.html  # Case study: Modern Animated Login/Signup UI
│   │   └── project-2.css   # Styles for Login/Signup UI case study
│   ├── Project-3/
│   │   ├── project-3.html  # Case study: The Pig Game
│   │   └── project-3.css   # Styles for Pig Game case study
│   └── Project-4/
│       ├── project-4.html  # Case study: My Portfolio Website (this project)
│       └── project-4.css   # Styles for Portfolio Website case study
├── 5-CONTACT/
│   ├── contact.html        # Contact Me page
│   └── contact.css         # Styles for Contact Me page
│   └── contact-mobile-queries.css # Mobile styles for Contact Me
│   └── contact-tablet-queries.css # Tablet styles for Contact Me
├── IMAGES/                 # Directory for all project images (e.g., my-pic.webp, project screenshots, patterns)
├── ICONS/                  # Directory for all SVG icons
└── README.md               # This file

## Installation

This is a static website, so no complex installation is required. To view the project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YourGitHubUsername/your-portfolio-repo.git](https://github.com/YourGitHubUsername/your-portfolio-repo.git)
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd your-portfolio-repo
    ```
3.  **Open `index.html`:** Simply open the `index.html` file in your web browser.

## Usage

Navigate through the website using the sidebar navigation.
* Click on "Projects" to view a list of all showcased projects.
* Click on individual project cards to see their detailed case studies.
* Explore the "Stack" section to learn about the technologies I work with.
* Use the "Contact Me" section to send a message or find my social media links.

## Live Demo

You can view a live version of the portfolio website here:
[**Live Demo Link**](https://your-portfolio-website.com)
*(Replace `https://your-portfolio-website.com` with your actual deployment URL)*

## Contact

Feel free to connect with me!

* **Email:** imranbinmanzoor1@gmail.com
* **LinkedIn:** https://linkedin.com/in/imranbinmanzoor-dev/
* **GitHub:** https://github.com/imranbinmanzoor

## License

This project is open-sourced under the MIT License. See the `LICENSE` file for more details.
*(If you have a `LICENSE` file in your repository, ensure it matches your chosen license. If not, you might want to add one.)*