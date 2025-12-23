// profile-dropdown.js - Fixed & Valid Version

// Detect user role based on current page path
function getUserRole() {
  const path = window.location.pathname;
  if (path.includes('/manager/') || path.includes('manager.html')) {
    return 'manager';
  } else if (path.includes('/receptionist/') || path.includes('receptionist.html')) {
    return 'receptionist';
  } else if (path.includes('/optometrist/') || path.includes('optometrist.html')) {
    return 'optometrist';
  }
  return 'receptionist';
}

// Load the correct profile dropdown HTML based on role
const role = getUserRole();

let htmlPath;
if (role === 'manager') {
  htmlPath = '../components/modals/manager/profile-dropdown.html';
} else if (role === 'optometrist') {
  htmlPath = '../components/modals/optometrist/profile-dropdown.html';
} else {
  htmlPath = '../components/modals/profile-dropdown.html';
}

console.log(`Loading profile dropdown for role: ${role}`);
console.log(`From path: ${htmlPath}`);

fetch(htmlPath)
  .then(res => {
    if (!res.ok) {
      throw new Error(`Failed to load ${htmlPath} - Status: ${res.status}`);
    }
    return res.text();
  })
  .then(data => {
    document.getElementById('profile-dropdown-placeholder').innerHTML = data;

    setupProfileDropdownListeners();
  })
  .catch(error => {
    console.error('Error loading profile dropdown:', error);
    // Optional: load a safe default if manager version missing
    if (role === 'manager') {
      console.warn('Manager dropdown failed, falling back to default');
      fetch('../components/modals/profile-dropdown.html')
        .then(res => res.text())
        .then(data => {
          document.getElementById('profile-dropdown-placeholder').innerHTML = data;
          setupProfileDropdownListeners();
        });
    }
  });

// Correct function name + improved listener setup
function setupProfileDropdownListeners() {
  const profileModal = document.getElementById('profileModal');

  if (!profileModal) {
    console.error('Profile modal (#profileModal) not found in loaded HTML');
    return;
  }

  // Menu item clicks
  const menuItems = profileModal.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const text = item.querySelector('.menu-text')?.textContent.trim();

      if (item.classList.contains('logout')) {
        console.log('Logging out...');
        window.location.href = '../login page.html';
      } else {
        console.log(`Selected: ${text}`);
        handleMenuNavigation(text);
      }

      // Close modal
      profileModal.classList.remove('active');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileModal.classList.contains('active')) {
      profileModal.classList.remove('active');
    }
  });
}

// Toggle dropdown from navbar button
function toggleProfileDropdown(event) {
  if (event) event.stopPropagation();

  const profileModal = document.getElementById('profileModal');
  if (profileModal) {
    profileModal.classList.toggle('active');
  }
}

// Close when clicking outside
document.addEventListener('click', (e) => {
  const profileModal = document.getElementById('profileModal');
  const profileButton = document.querySelector('.icon-button:last-child');

  if (profileModal && profileButton) {
    if (!profileModal.contains(e.target) && !profileButton.contains(e.target)) {
      profileModal.classList.remove('active');
    }
  }
});

// Menu navigation handler
function handleMenuNavigation(menuText) {
  const map = {
    'Basic Information': () => console.log('Go to Basic Info'),
    'My Profile': () => console.log('Go to My Profile'),
    'Settings': () => console.log('Go to Settings'),
    'Notifications': () => console.log('Go to Notifications'),
    'Privacy & Security': () => console.log('Go to Privacy'),
    'Help & Support': () => console.log('Go to Help'),
  };

  if (map[menuText]) {
    map[menuText]();
  }
}