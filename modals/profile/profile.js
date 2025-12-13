// Load Profile Dropdown HTML
fetch('modals/profile/profile.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('profile-dropdown-placeholder').innerHTML = data;
    initializeProfileDropdown();
  })
  .catch(error => {
    console.error('Error loading profile dropdown:', error);
  });

function initializeProfileDropdown() {
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('profileDropdown');
    const profileBtn = document.querySelector('.icon-button[onclick="toggleProfileDropdown()"]');
    
    if (dropdown && dropdown.classList.contains('active')) {
      // Check if click is outside both dropdown and button
      if (!dropdown.contains(e.target) && !profileBtn?.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const dropdown = document.getElementById('profileDropdown');
      if (dropdown && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
      }
    }
  });
}

// Make functions global
window.toggleProfileDropdown = function() {
  const dropdown = document.getElementById('profileDropdown');
  if (!dropdown) {
    console.error('Profile dropdown not found!');
    return;
  }
  dropdown.classList.toggle('active');
}

window.viewAccountInfo = function() {

  document.getElementById('profileDropdown').classList.remove('active');
}

window.viewSettings = function() {
  
  document.getElementById('profileDropdown').classList.remove('active');
}

window.viewNotifications = function() {
  
  document.getElementById('profileDropdown').classList.remove('active');
}

window.viewHelp = function() {
  
  document.getElementById('profileDropdown').classList.remove('active');
}

window.signOut = function() {
  if (confirm) {
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.href = 'login page.html';
  }
  
  // Close dropdown if user cancels
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) {
    dropdown.classList.remove('active');
  }
}

window.handleNotification = function() {
  alert('You have 3 new notifications!');
}