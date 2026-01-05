// ProfileDropdown.js - Admin Version

let profileModal = null;
let profileButton = null;

function loadProfileDropdown() {
    fetch('../components/modals/admin/profile-dropdown.html')
        .then(res => res.text())
        .then(data => {
            document.getElementById('profile-dropdown-placeholder').innerHTML = data;

            // Now that modal exists, get references
            profileModal = document.getElementById('profileModal');
            profileButton = document.querySelector('.icon-button.profile-btn');

            if (!profileModal || !profileButton) {
                console.error('Profile modal or button not found');
                return;
            }

            // Attach click listener to button
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

            // Menu item clicks
            profileModal.querySelectorAll('.menu-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    const text = this.querySelector('.menu-text').textContent.trim();

                    if (this.classList.contains('logout')) {
                        window.location.href = '../login.html';
                    } else {
                        alert(`Go to: ${text}`);
                    }

                    profileModal.classList.remove('active');
                });
            });

            // Menu item clicks
            // const menuItems = profileModal.querySelectorAll('.menu-item');
            // menuItems.forEach(item => {
            //   item.addEventListener('click', (e) => {
            //     e.preventDefault();
            //     const text = item.querySelector('.menu-text')?.textContent.trim();
                
            //     if (item.classList.contains('logout')) {
            //       console.log('Logging out...');
            //       window.location.href = '../login page.html';
            //     } else {
            //       console.log(`Selected: ${text}`);
            //       handleMenuNavigation(text);
            //     }
            
                // Close modal
            //     profileModal.classList.remove('active');
            //   });
            // });

            console.log('Profile dropdown ready!');
        })
        .catch(err => console.error('Failed to load profile dropdown:', err));
}

// Load when page is ready
document.addEventListener('DOMContentLoaded', loadProfileDropdown);