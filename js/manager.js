// role protection — must be first
requireRole("manager");

console.log("=== MANAGER PAGE LOADED ===");

// ── Profile from localStorage ─────────────────────────────────────────────
function loadProfile() {
    const user = window.__staffUser || JSON.parse(localStorage.getItem('bag_staff_user') || '{}');
    if (!user || !user.firstname) return;
    setTimeout(() => {
        const profileName = document.querySelector(".profile-name");
        const profileRole = document.querySelector(".profile-role");
        if (profileName) profileName.textContent = user.firstname + " " + user.lastname;
        if (profileRole) profileRole.textContent = user.role || 'Manager';
    }, 500);
}

// ── Load navbar then profile ───────────────────────────────────────────────
fetch("../components/manager/navbar.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById("navbar-placeholder").innerHTML = html;
        loadProfile();
    })
    .catch(err => console.error("Error loading navbar:", err));