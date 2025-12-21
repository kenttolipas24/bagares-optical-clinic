// Load the patient table HTML content into the placeholder
fetch('../components/modals/action-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('action-dropdown-placeholder').innerHTML = data;
    
    // Initialize table after loading
    initializePatientTable();
  })
  .catch(error => {
    console.error('Error loading patient table:', error);
  });

// Store current patient ID
let currentPatientId = null;

// Toggle action dropdown
window.toggleActionDropdown = function(event, patientId) {
  event.stopPropagation();
  
  const dropdown = document.getElementById('actionDropdown');
  const overlay = document.querySelector('.dropdown-overlay');
  const button = event.currentTarget;
  const isOpen = dropdown.classList.contains('show');
  
  // Close if already open
  if (isOpen && currentPatientId === patientId) {
    closeAllDropdowns();
    return;
  }
  
  // Close any open dropdown first
  closeAllDropdowns();
  
  // Store current patient ID
  currentPatientId = patientId;
  
  // Position dropdown relative to button
  const rect = button.getBoundingClientRect();
  dropdown.style.position = 'fixed';
  dropdown.style.top = `${rect.bottom + 5}px`;
  dropdown.style.left = `${rect.left - 150}px`; // Align to the right of button
  
  // Show dropdown and overlay
  dropdown.classList.add('show');
  overlay.classList.add('show');
}

// Close all dropdowns
window.closeAllDropdowns = function() {
  const dropdown = document.getElementById('actionDropdown');
  const overlay = document.querySelector('.dropdown-overlay');
  
  if (dropdown) dropdown.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
  currentPatientId = null;
}

// View patient
window.viewPatient = function() {
  console.log('View patient:', currentPatientId);
  
  // Get patient data
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    // Call your existing view patient modal function
    // window.openViewPatientModal(patient);
    alert(`Viewing patient: ${patient.firstName} ${patient.lastName}\n\nImplement your view patient modal here.`);
  }
  
  closeAllDropdowns();
}

// Edit patient
window.editPatient = function() {
  console.log('Edit patient:', currentPatientId);
  
  // Get patient data
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    // Call your existing edit patient modal function
    window.openPatientModal('edit', patient);
  }
  
  closeAllDropdowns();
}

// Remove patient
window.removePatient = function() {
  console.log('Remove patient:', currentPatientId);
  
  // Get patient data
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    if (confirm(`Are you sure you want to remove ${patient.firstName} ${patient.lastName}?`)) {
      // Remove patient from array
      patients = patients.filter(p => p.id !== currentPatientId);
      
      // Update localStorage
      localStorage.setItem('patients', JSON.stringify(patients));
      
      // Refresh table
      updatePatientTable();
      
      alert('Patient removed successfully.');
    }
  }
  
  closeAllDropdowns();
}

// Setup dropdown listeners
function setupDropdownListeners() {
  // Close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('actionDropdown');
    if (!dropdown) return;
    
    const isClickInside = dropdown.contains(event.target) || 
                         event.target.classList.contains('action-btn');
    
    if (!isClickInside) {
      closeAllDropdowns();
    }
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}