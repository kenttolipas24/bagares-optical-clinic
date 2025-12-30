// navbar.js - FIXED to work with your actual HTML

fetch('../components/optometrists/navbar.html')
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
          
          changePage(pageId);
          
          // Update active state
          buttons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });

    // Show Appointment by default on page load
    changePage('appointment');
    // Mark Appointment button as active
    const appointmentBtn = document.querySelector('.nav-button[onclick*="appointment"]');
    if (appointmentBtn) appointmentBtn.classList.add('active');
  })
  .catch(error => console.error('Error loading navbar:', error));

// Single function to switch pages
// Single function to switch pages
function changePage(pageId, event) {
  console.log('Switching to:', pageId);

  // Hide all placeholders
  document.getElementById('Cal&Det-placeholder').style.display = 'none';
  document.getElementById('patient-record-placeholder').style.display = 'none';
  document.getElementById('reports-placeholder').style.display = 'none';

  // Show the correct one
  if (pageId === 'appointment') {
    document.getElementById('Cal&Det-placeholder').style.display = 'block';
  } else if (pageId === 'patient-record') {
    document.getElementById('patient-record-placeholder').style.display = 'block';
  } else if (pageId === 'reports') {
    document.getElementById('reports-placeholder').style.display = 'block';
    console.log('Reports section should be visible now'); // ADD THIS LINE
  }
}