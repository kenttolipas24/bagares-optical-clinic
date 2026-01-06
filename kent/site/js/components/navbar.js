// Load Navbar Component
fetch('components/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
    highlightCurrentPage();
    attachMobileMenuEvents();
  })
  .catch(error => console.error('Error loading navbar:', error));

function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.style.color = 'var(--color-primary)';
            link.style.fontWeight = 'var(--font-weight-semibold)';
            link.classList.add('active');
        }
    });
}

function toggleMobileMenu() {
    const nav = document.querySelector('.navigation');
    nav.classList.toggle('mobile-active');
}

function attachMobileMenuEvents() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleMobileMenu);
    }
}