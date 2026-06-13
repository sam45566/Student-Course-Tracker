let currentUserId = null;
let courses = [];
let tasks = [];
let activeCourseFilter = 'all';
let isSignUpMode = false;
let currentTheme = 'light';


function readStorage(key) {
    try { 
        return JSON.parse(localStorage.getItem(key)) || []; 
    } catch(e) { 
        return []; 
    }
}

function writeStorage(key, data) {
    try { 
        localStorage.setItem(key, JSON.stringify(data)); 
    } catch(e) {}
}


try {
    currentUserId = localStorage.getItem('userId') || null;
    currentTheme = localStorage.getItem('theme') || 'light';
} catch (e) {}

document.documentElement.setAttribute('data-theme', currentTheme);

const authScreen = document.getElementById('auth-screen');
const appWrapper = document.getElementById('app-wrapper');

function checkAuthStatus() {
    if (currentUserId) {
        if (authScreen) authScreen.style.display = 'none';

        if (appWrapper) appWrapper.style.display = 'contents';
        
        const users = readStorage('db_users');
        const matchedUser = users.find(u => String(u.id) === String(currentUserId));
        if (matchedUser) {
            document.getElementById('user-greeting').innerText = `Welcome Back, ${matchedUser.email.split('@')[0]}!`;
        }
        fetchData();
    } else {
        if (authScreen) authScreen.style.display = 'flex';
        if (appWrapper) appWrapper.style.display = 'none';
    }
}

function fetchData() {
    if (!currentUserId) return;
    courses = readStorage('db_courses').filter(c => String(c.user_id) === String(currentUserId));
    tasks = readStorage('db_tasks').filter(t => String(t.user_id) === String(currentUserId));
    refreshUI();
}

function refreshUI() {
    loadDashboardStats();
    loadCoursesGrid();
    loadTasksDropdowns();
    loadTasks();
}

window.toggleAuthForm = function() {
    isSignUpMode = !isSignUpMode;
    document.getElementById('auth-title').innerText = isSignUpMode ? "Create Your Student Account" : "Sign In to Your Account";
    document.getElementById('btn-auth-submit').innerText = isSignUpMode ? "Sign Up" : "Sign In";
    document.getElementById('toggle-auth-mode').innerText = isSignUpMode ? "Sign In" : "Sign Up";
    document.getElementById('auth-msg').innerText = '';
};

window.handleAuthSubmit = function(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const msg = document.getElementById('auth-msg');

    if (!email || !password) {
        msg.style.color = '#ef4444';
        msg.innerText = 'Please complete all fields.';
        return;
    }

    let users = readStorage('db_users');

    if (isSignUpMode) {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            msg.style.color = '#ef4444';
            msg.innerText = 'Email already mapped to an active profile.';
            return;
        }
        const newId = Date.now();
        users.push({ id: newId, email, password });
        writeStorage('db_users', users);
        currentUserId = String(newId);
    } else {
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!found) {
            msg.style.color = '#ef4444';
            msg.innerText = 'Invalid credential configurations.';
            return;
        }
        currentUserId = String(found.id);
    }

    try { localStorage.setItem('userId', currentUserId); } catch(err) {}
    document.getElementById('auth-form').reset();
    msg.innerText = '';
    checkAuthStatus();
};

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentUserId = null;
        try { localStorage.removeItem('userId'); } catch(e) {}
        document.getElementById('auth-form').reset();
        checkAuthStatus();
    });
}


const themeToggle = document.getElementById('theme-toggle');
function updateThemeButtonUI() {
    if (!themeToggle) return;
    themeToggle.innerHTML = currentTheme === 'light' ? `<i class="fa-solid fa-moon"></i> Dark Mode` : `<i class="fa-solid fa-sun"></i> Light Mode`;
}
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        try { localStorage.setItem('theme', currentTheme); } catch(e) {}
        updateThemeButtonUI();
    });
}
updateThemeButtonUI();

const navItems = document.querySelectorAll('.nav-item');
const pageViews = document.querySelectorAll('.page-view');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        pageViews.forEach(page => page.classList.remove('active'));
        item.classList.add('active');
        const target = document.getElementById(item.getAttribute('data-target'));
        if (target) target.classList.add('active');
        refreshUI();
    });
});


function loadDashboardStats() {
    document.getElementById('stat-total-courses').innerText = courses.length;
    const completed = tasks.filter(t => t.completed === 1).length;
    document.getElementById('stat-completed-tasks').innerText = completed;
    document.getElementById('stat-pending-tasks').innerText = tasks.length - completed;

    const list = document.getElementById('upcoming-deadlines-list');
    if (!list) return;
    list.innerHTML = '';

    const pending = tasks.filter(t => t.completed === 0).sort((a,b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);

    if (pending.length === 0) {
        list.innerHTML = '<li class="deadline-item" style="color:var(--text-muted)">No upcoming items logged! 🎉</li>';
        return;
    }

    pending.forEach(t => {
        const c = courses.find(course => String(course.id) === String(t.course_id));
        const cTitle = c ? c.title : 'Unknown Course';
        const color = (c && c.color) ? c.color : '#4f46e5';
        list.innerHTML += `
            <li class="deadline-item">
                <span><span class="course-color-dot" style="background:${color}"></span> <strong>${t.title}</strong> (${cTitle})</span>
                <span class="deadline-date">${t.deadline}</span>
            </li>`;
    });
}


window.filterCourses = function(status, event) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    activeCourseFilter = status;
    loadCoursesGrid();
};

function loadCoursesGrid() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;
    grid.innerHTML = '';
    let filtered = activeCourseFilter === 'all' ? courses : courses.filter(c => c.status === activeCourseFilter);

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); padding:20px;">No matching tracking courses inside storage schema indexes.</p>';
        return;
    }

    filtered.forEach(c => {
        const courseTasks = tasks.filter(t => String(t.course_id) === String(c.id));
        const percentage = courseTasks.length === 0 ? 0 : Math.round((courseTasks.filter(t => t.completed === 1).length / courseTasks.length) * 100);
        grid.innerHTML += `
            <div class="course-card" style="border-top: 5px solid ${c.color}">
                <h3><span class="course-color-dot" style="background:${c.color}"></span> ${c.title}</h3>
                <p><strong>Instructor:</strong> ${c.instructor}</p>
                <p><strong>Schedule:</strong> ${c.schedule}</p>
                <p><strong>Status:</strong> ${c.status.toUpperCase()}</p>
                <div style="margin-top:15px">
                    <span style="font-size:0.85rem; font-weight:600">Progress: ${percentage}%</span>
                    <div class="progress-bar-container"><div class="progress-bar" style="width: ${percentage}%; background:${c.color}"></div></div>
                </div>
                <div class="course-actions">
                    <button class="action-btn edit-btn" onclick="editCourse('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteCourse('${c.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });
}

window.handleCourseSubmit = function(e) {
    e.preventDefault();
    const id = document.getElementById('course-id').value;
    let allCourses = readStorage('db_courses');

    const data = {
        id: id ? id : String(Date.now()),
        user_id: currentUserId,
        title: document.getElementById('course-title').value,
        instructor: document.getElementById('course-instructor').value,
        schedule: document.getElementById('course-schedule').value,
        color: document.getElementById('course-color').value,
        status: document.getElementById('course-status').value
    };

    if (id) {
        allCourses = allCourses.map(c => String(c.id) === String(id) ? data : c);
    } else {
        allCourses.push(data);
    }

    writeStorage('db_courses', allCourses);
    closeModal('course-modal');
    document.getElementById('course-form').reset();
    fetchData();
};

window.editCourse = function(id) {
    const c = courses.find(course => String(course.id) === String(id));
    if (!c) return;
    document.getElementById('course-id').value = c.id;
    document.getElementById('course-title').value = c.title;
    document.getElementById('course-instructor').value = c.instructor;
    document.getElementById('course-schedule').value = c.schedule;
    document.getElementById('course-color').value = c.color;
    document.getElementById('course-status').value = c.status;
    document.getElementById('course-modal-title').innerText = "Edit Course Details";
    openModal('course-modal');
};

window.deleteCourse = function(id) {
    if (confirm('Permanently wipe this course and all associated tasks?')) {
        let allCourses = readStorage('db_courses').filter(c => String(c.id) !== String(id));
        let allTasks = readStorage('db_tasks').filter(t => String(t.course_id) !== String(id));
        writeStorage('db_courses', allCourses);
        writeStorage('db_tasks', allTasks);
        fetchData();
    }
};


function loadTasksDropdowns() {
    const mainSelect = document.getElementById('task-filter-course');
    const modalSelect = document.getElementById('task-course-select');
    if (mainSelect) mainSelect.innerHTML = '<option value="all">All Courses</option>';
    if (modalSelect) modalSelect.innerHTML = '';
    courses.forEach(c => {
        const option = `<option value="${c.id}">${c.title}</option>`;
        if (mainSelect) mainSelect.innerHTML += option;
        if (modalSelect) modalSelect.innerHTML += option;
    });
}

window.openTaskModal = function() {
    if (courses.length === 0) return alert('Please generate a course profile tracking element prior to mapping assignments.');
    openModal('task-modal');
};

window.loadTasks = function() {
    const filterVal = document.getElementById('task-filter-course').value;
    const list = document.getElementById('tasks-list');
    if (!list) return;
    list.innerHTML = '';
    let filtered = filterVal === 'all' ? tasks : tasks.filter(t => String(t.course_id) === String(filterVal));

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 15px;">No active assignments logged.</p>';
        return;
    }

    filtered.forEach(t => {
        list.innerHTML += `
            <div class="task-item ${t.completed === 1 ? 'done' : ''}">
                <div class="task-left">
                    <input type="checkbox" ${t.completed === 1 ? 'checked' : ''} onclick="toggleTask('${t.id}', ${t.completed})">
                    <span><strong>${t.title}</strong> <small>(Due: ${t.deadline})</small></span>
                </div>
                <button class="action-btn delete-btn" onclick="deleteTask('${t.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });
};

window.handleTaskSubmit = function(e) {
    e.preventDefault();
    let allTasks = readStorage('db_tasks');
    const data = {
        id: String(Date.now()),
        user_id: currentUserId,
        course_id: document.getElementById('task-course-select').value,
        title: document.getElementById('task-title').value,
        deadline: document.getElementById('task-deadline').value,
        completed: 0
    };
    allTasks.push(data);
    writeStorage('db_tasks', allTasks);
    closeModal('task-modal');
    document.getElementById('task-form').reset();
    fetchData();
};

window.toggleTask = function(id, currentStatus) {
    let allTasks = readStorage('db_tasks').map(t => String(t.id) === String(id) ? { ...t, completed: currentStatus === 1 ? 0 : 1 } : t);
    writeStorage('db_tasks', allTasks);
    fetchData();
};

window.deleteTask = function(id) {
    if (confirm('Permanently remove this assignment line item?')) {
        let allTasks = readStorage('db_tasks').filter(t => String(t.id) !== String(id));
        writeStorage('db_tasks', allTasks);
        fetchData();
    }
};

window.openModal = function(id) { 
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex'; 
};

window.closeModal = function(id) { 
    const el = document.getElementById(id);
    if (el) el.style.display = 'none'; 
    if (id === 'course-modal') {
        document.getElementById('course-form').reset();
        document.getElementById('course-id').value = '';
        document.getElementById('course-modal-title').innerText = "Add New Course";
    }
};


document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});