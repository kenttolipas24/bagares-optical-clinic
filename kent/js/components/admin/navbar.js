// navbar.js (admin.js)
fetch('../components/admin/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;

    // After navbar is loaded, attach click events to buttons
    const buttons = document.querySelectorAll('.nav-button');

    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();

        // Extract pageId from onclick attribute - FIX THE REGEX
        const onclickAttr = this.getAttribute('onclick');
        const match = onclickAttr.match(/changePage\('([^']+)'/);
        
        if (match) {
          const pageId = match[1];
          
          switchTab(pageId);
          
          // Update active state
          buttons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });

    // Show users by default on page load
    switchTab('users');
    // Mark users button as active
    const usersBtn = document.querySelector('.nav-button[onclick*="users"]');
    if (usersBtn) usersBtn.classList.add('active');
  })
  .catch(error => console.error('Error loading navbar:', error));

// Single function to switch pages
// Single function to switch pages
function switchTab(pageId, event) {
  console.log('Switching to:', pageId);

  // Hide all placeholders
  document.getElementById('usersTab-placeholder').style.display = 'none';
  document.getElementById('auditTab-placeholder').style.display = 'none';

  // Show the correct one
  if (pageId === 'users') {
    document.getElementById('usersTab-placeholder').style.display = 'block';
  } else if (pageId === 'audit') {
    document.getElementById('auditTab-placeholder').style.display = 'block';
  } 
}