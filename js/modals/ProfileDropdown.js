// ProfileDropdown.js - Cleaned Version

let profileModal = null;
let profileButton = null;

function loadProfileDropdown() {
    fetch('../components/modals/admin/profile-dropdown.html')
        .then(res => res.text())
        .then(data => {
            document.getElementById('profile-dropdown-placeholder').innerHTML = data;

            // Get references
            profileModal = document.getElementById('profileModal');
            profileButton = document.querySelector('.icon-button.profile-btn');

            if (!profileModal || !profileButton) {
                console.error('Profile modal or button not found');
                return;
            }

            // Toggle dropdown on button click
            profileButton.addEventListener('click', function(e) {
                e.stopPropagation();
                profileModal.classList.toggle('active');
            });

            // Close when clicking outside
            document.addEventListener('click', function(e) {
                if (profileModal.classList.contains('active')) {
                    if (!profileModal.contains(e.target) && !profileButton.contains(e.target)) {
                        profileModal.classList.remove('active');
                    }
                }
            });

            // Close with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && profileModal.classList.contains('active')) {
                    profileModal.classList.remove('active');
                }
            });

            // Handle menu item clicks
            profileModal.querySelectorAll('.menu-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (this.classList.contains('logout')) {
                        handleLogout();
                    } else {
                        const text = this.querySelector('.menu-text').textContent.trim();
                        if (text === 'My Profile') {
                            showMyProfile();
                        }
                    }

                    // Close modal
                    profileModal.classList.remove('active');
                });
            });

            console.log('Profile dropdown loaded');
        })
        .catch(err => console.error('Failed to load profile dropdown:', err));
}

// Show My Profile section
function showMyProfile() {
    // Hide user management
    const usersTab = document.getElementById('usersTab-placeholder');
    if (usersTab) {
        usersTab.style.display = 'none';
    }

    // Hide audit tab if exists
    const auditTab = document.getElementById('auditTab-placeholder');
    if (auditTab) {
        auditTab.style.display = 'none';
    }
    
    // Show profile
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        profileContainer.classList.add('active');
        profileContainer.style.display = 'block';
    }

    // Remove active from nav buttons
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Show User Management (called from Back button)
function showUserManagement() {
    // Show user management
    const usersTab = document.getElementById('usersTab-placeholder');
    if (usersTab) {
        usersTab.style.display = 'block';
    }
    
    // Hide profile
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        profileContainer.classList.remove('active');
        profileContainer.style.display = 'none';
    }

    // Reactivate Users tab if switchTab function exists
    if (typeof switchTab === 'function') {
        switchTab('users');
    }
}

// Logout handler
function handleLogout() {
    // Clear session data
    sessionStorage.clear();
    localStorage.clear();
    
    // Redirect to login
    window.location.href = '/login.html';
}

// Export functions globally
window.showMyProfile = showMyProfile;
window.showUserManagement = showUserManagement;
window.handleLogout = handleLogout;

// Load when page is ready
document.addEventListener('DOMContentLoaded', loadProfileDropdown);