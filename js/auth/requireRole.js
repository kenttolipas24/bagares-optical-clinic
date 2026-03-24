const LOGIN_URL = '/login.html';

function requireRole(expectedRole) {
    const stored = localStorage.getItem('bag_staff_user');

    if (!stored) {
        window.location.replace(LOGIN_URL);
        return;
    }

    try {
        const user = JSON.parse(stored);
        const role = (user.role || '').toLowerCase().trim();
        const expected = expectedRole.toLowerCase().trim();

        console.log('requireRole check:', { expected, role, page: window.location.pathname });

        const receptRoles = ['secretary/cashier', 'receptionist', 'secretary', 'cashier'];

        let allowed = false;
        if (receptRoles.includes(expected)) {
            allowed = receptRoles.includes(role);
        } else {
            allowed = role === expected;
        }

        if (!allowed) {
            console.warn('Access denied — role:', role, 'expected:', expected);
            localStorage.removeItem('bag_staff_user');
            window.location.replace(LOGIN_URL);
            return;
        }

        console.log('✅ Auth OK:', user.firstname, role);
        window.__staffUser = user;

    } catch (e) {
        console.error('requireRole error:', e);
        localStorage.removeItem('bag_staff_user');
        window.location.replace(LOGIN_URL);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const s = localStorage.getItem('bag_staff_user');
    if (s && !window.__staffUser) {
        try { window.__staffUser = JSON.parse(s); } catch {}
    }
});