// Load navbar
fetch('navbar/rep-nav/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
    
    // Add event listeners after navbar is loaded
    setupNavigation();
  })
  .catch(error => {
    console.error('Error loading navbar:', error);
  });

function setupNavigation() {
  // Get navigation links
  const patientLink = document.querySelector('a[href="#patient"]');
  const appointmentLink = document.querySelector('a[href="#appointment"]'); // Changed this
  const salesLink = document.querySelector('a[href="#Sales&Billing"]');
  
  if (patientLink) {
    patientLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection('patient');
    });
  }
  
  if (appointmentLink) {
    appointmentLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection('appointment');
    });
  }
  
  if (salesLink) {
    salesLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection('sales');
    });
  }
}

function showSection(section) {
  const patientSection = document.getElementById('patient_table-placeholder');
  const appointmentSection = document.getElementById('appointment-section');
  
  if (section === 'patient') {
    if (patientSection) patientSection.style.display = 'block';
    if (appointmentSection) appointmentSection.style.display = 'none';
  } else if (section === 'appointment') {
    if (patientSection) patientSection.style.display = 'none';
    if (appointmentSection) appointmentSection.style.display = 'block';
  }
}