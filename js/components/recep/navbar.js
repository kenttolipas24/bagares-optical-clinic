fetch('../components/receptionist/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;

    const user = window.__staffUser || JSON.parse(localStorage.getItem('bag_staff_user') || '{}');
    if (user && user.firstname) {
      setTimeout(() => {
        const profileName = document.querySelector('.profile-name');
        const profileRole = document.querySelector('.profile-role');
        if (profileName) profileName.textContent = user.firstname + ' ' + user.lastname;
        if (profileRole) profileRole.textContent = user.role || 'Secretary/Cashier';
      }, 100);
    }

    attachNavListeners();
  })
  .catch(err => console.error('Error loading navbar:', err));

function attachNavListeners() {
    const navButtons = document.querySelectorAll('.nav-button');
    if (navButtons.length === 0) {
        setTimeout(attachNavListeners, 200);
        return;
    }

    console.log('Nav buttons found:', navButtons.length);

    navButtons.forEach(btn => {
        const fresh = btn.cloneNode(true);
        btn.parentNode.replaceChild(fresh, btn);
    });

    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showSection(this.getAttribute('data-page'));
        });
    });

    const patientBtn = document.querySelector('[data-page="patient"]');
    if (patientBtn) patientBtn.classList.add('active');
    showSection('patient');
}

function showSection(page) {
    const sections = {
        'patient':     'patient-placeholder',
        'appointment': 'appointment-placeholder',
        'sales':       'sales-placeholder',
        'request':     'request-placeholder'
    };

    Object.values(sections).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const targetId = sections[page];
    if (targetId) {
        const el = document.getElementById(targetId);
        if (el) el.style.display = 'block';
    }

    if (page === 'sales' && typeof window.initSalesBilling === 'function') {
        window.initSalesBilling();
    }

    console.log('Section shown:', page);
}

window.showSection     = showSection;
window.setupNavigation = attachNavListeners;