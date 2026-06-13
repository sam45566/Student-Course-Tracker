# Student Course Tracker Project

This is a web app I built to help students keep track of their classes, assignments, and due dates. It has a main dashboard that shows overall stats (like how many tasks are left to do), a page to manage courses with custom color labels, and a section to check off assignments as you finish them. It also has a toggle for dark mode.

## Features

* **Login Screen:** A simple interface to sign in or register before seeing the dashboard.
* **Dashboard Stats:** Live counters that track total courses, pending tasks, and completed tasks. It also displays a list of upcoming deadlines.
* **Course Manager:** You can add new courses, assign an instructor, set a schedule, and choose a color for the course card. You can also edit or delete them later.
* **Task Tracker:** A page where you can add assignments, pick which course they belong to, set a due date, and check them off when done. You can also filter tasks by course.
* **Dark Mode:** A quick button in the sidebar to switch between light and dark themes.

## How it's Made

* **HTML5:** For the page structure, modals, and forms.
* **CSS3:** Custom styles using Flexbox and Grid. I used CSS variables to handle the light/dark theme swap and added explicit box-sizing fixes so the inputs don't spill out of the modals.
* **FontAwesome:** Used for all the dashboard and sidebar icons.
* **JavaScript (ES6):** Handles all the app logic in `app.js`—like switching between pages, validation, opening/closing modals, and updating the UI stats when tasks change.

## Files in Project

* `index.html` - The main structure of the site, including the auth container and popup modals.
* `style.css` - Cleaned up styling with dark mode definitions and responsive media queries for mobile layout.
* `app.js` - The backend script handling the interface state and form submissions.

## Setup Instructions

Since this is a client-side app, you don't need to install any heavy dependencies or run a local server:

1. Put `index.html`, `style.css`, and `app.js` all in the same folder.
2. Double-click `index.html` to open it up in any browser (Chrome, Firefox, Edge, etc.).
3. Alternatively, if you're using VS Code, you can right-click `index.html` and use the **Live Server** extension to host it locally at `http://127.0.0.1:5500`.# Student-Course-Tracker
