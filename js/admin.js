// role protection
requireRole("admin");

console.log("=== ADMIN PAGE LOADED ===");

// ── Load profile from localStorage (no PHP) ───────────────────────────────
function loadProfile() {
    const user = window.__staffUser || JSON.parse(localStorage.getItem('bag_staff_user') || '{}');
    if (!user || !user.firstname) return;

    setTimeout(() => {
        const profileName = document.querySelector(".profile-name");
        const profileRole = document.querySelector(".profile-role");

        if (profileName) profileName.textContent = user.firstname + " " + user.lastname;
        if (profileRole) profileRole.textContent = user.role || 'Admin';
    }, 500);
}

loadProfile();