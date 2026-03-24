console.log("=== RECEPTIONIST PAGE LOADED ===");

function loadProfile() {
    const user = window.__staffUser || JSON.parse(localStorage.getItem('bag_staff_user') || '{}');
    if (!user || !user.firstname) return;
    setTimeout(() => {
        const profileName = document.querySelector('.profile-name');
        const profileRole = document.querySelector('.profile-role');
        if (profileName) profileName.textContent = user.firstname + ' ' + user.lastname;
        if (profileRole) profileRole.textContent = user.role || 'Secretary/Cashier';
    }, 600);
}
loadProfile();