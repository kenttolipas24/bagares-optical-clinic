function switchTab(tab) {
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(btn => btn.classList.remove('active'));

    if (tab === 'users') {
        document.getElementById('users-tab').classList.remove('hidden');
        document.getElementById('audit-tab').classList.add('hidden');
        navButtons[0]?.classList.add('active');
    } else {
        document.getElementById('users-tab').classList.add('hidden');
        document.getElementById('audit-tab').classList.remove('hidden');
        navButtons[1]?.classList.add('active');
    }
}