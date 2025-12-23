// Load profile dropdown modal HTML
fetch('../components/modals/profile-dropdown.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('profile-dropdown-placeholder').innerHTML = data;
    
    // Setup listeners after the modal is loaded
    setupPatientDropdownListeners();
  })
  .catch(error => {
    console.error('Error loading profile dropdown modal:', error);
  });

// Setup profile dropdown listeners
function setupPatientDropdownListeners() {
    // Wait a bit to ensure DOM is fully loaded
    setTimeout(() => {
        const profileModal = document.getElementById('profileModal');
        
        if (!profileModal) {
            console.error('Profile modal not found');
            return;
        }

        // Handle menu item clicks
        const menuItems = profileModal.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const menuText = item.querySelector('.menu-text').textContent;
                
                // Handle logout separately
                if (item.classList.contains('logout')) {
                    console.log('Logging out...');
                        
                        window.location.href = '../login page.html';
                } else {
                    console.log(`Navigating to: ${menuText}`);
                    // Add navigation logic here
                    handleMenuNavigation(menuText);
                }
                
                // Close modal after click
                profileModal.classList.remove('active');
            });
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && profileModal.classList.contains('active')) {
                profileModal.classList.remove('active');
            }
        });
    }, 100);
}

// Function called from onclick in navbar
function toggleProfileDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.toggle('active');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const profileModal = document.getElementById('profileModal');
    const profileBtn = document.querySelector('.icon-button:last-child');
    
    if (profileModal && profileBtn) {
        if (!profileModal.contains(e.target) && !profileBtn.contains(e.target)) {
            profileModal.classList.remove('active');
        }
    }
});

// Handle menu navigation
function handleMenuNavigation(menuText) {
    switch(menuText) {
        case 'Basic Information':
            console.log('Navigate to Basic Information');
            // window.location.href = 'basic-info.html';
            break;
        case 'My Profile':
            console.log('Navigate to My Profile');
            // window.location.href = 'profile.html';
            break;
        case 'Settings':
            console.log('Navigate to Settings');
            // window.location.href = 'settings.html';
            break;
        case 'Notifications':
            console.log('Navigate to Notifications');
            // window.location.href = 'notifications.html';
            break;
        case 'Privacy & Security':
            console.log('Navigate to Privacy & Security');
            // window.location.href = 'privacy.html';
            break;
        case 'Help & Support':
            console.log('Navigate to Help & Support');
            // window.location.href = 'help.html';
            break;
        default:
            console.log('Unknown menu item');
    }
}

// Handle notification button (called from onclick in navbar)
function handleNotification() {
    console.log('Notification clicked');
    // Add your notification logic here
    alert('You have no new notifications');
}