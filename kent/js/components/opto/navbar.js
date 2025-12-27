// Load navbar
fetch('../components/optometrists/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
    
    setupNavigation();
  })
  .catch(error => {
    console.error('Error loading navbar:', error);
  });

// Function to show the selected section and hide others
function showSection(sectionId) {
  const sections = ['appointment', 'prescreption', 'patient', 'reports'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = (id === sectionId) ? 'block' : 'none';
        }
    });
}

// Setup navigation links
function setupNavigation() {
  const appointmentLink     = document.querySelector('a[href="#appointment"]');
  const prescreptionLink    = document.querySelector('a[href="#prescreption"]');
  const patientLink         = document.querySelector('a[href="#patient record"]');
  const reportsLink         = document.querySelector('a[href="#reports"]');

    if (appointmentLink) {
        appointmentLink.addEventListener('click', function(e) {
         e.preventDefault();
         showSection('appointment');
        });
    }

    if (prescreptionLink) {
        prescreptionLink.addEventListener('click', function(e) {
         e.preventDefault();
         showSection('prescreption');
        });
    }

    if (patientLink) {
        patientLink.addEventListener('click', function(e) {
         e.preventDefault();
         showSection('patient');
        });
    }

    if (reportsLink) {
        reportsLink.addEventListener('click', function(e) {
         e.preventDefault();
         showSection('reports');
        });
    }
}