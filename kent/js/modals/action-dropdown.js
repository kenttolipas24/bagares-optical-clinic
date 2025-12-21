// Load the action dropdown HTML content
fetch('../components/modals/action-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('action-dropdown-placeholder').innerHTML = data;
    
    // Initialize table and dropdown listeners after loading
    initializePatientTable();        // assuming this function exists elsewhere
    setupDropdownListeners();
  })
  .catch(error => {
    console.error('Error loading action dropdown:', error);
  });

// Store current patient ID globally
let currentPatientId = null;

// Toggle action dropdown (three dots menu)
window.toggleActionDropdown = function(event, patientId) {
  event.stopPropagation();
  
  const dropdown = document.getElementById('actionDropdown');
  const overlay = document.querySelector('.dropdown-overlay');
  const button = event.currentTarget;
  const isOpen = dropdown.classList.contains('show');
  
  // If clicking the same button that's already open → close it
  if (isOpen && currentPatientId === patientId) {
    closeAllDropdowns();
    return;
  }
  
  // Close any open dropdown first
  closeAllDropdowns();
  
  // Set the current patient ID
  currentPatientId = patientId;
  
  // Position dropdown near the button
  const rect = button.getBoundingClientRect();
  dropdown.style.position = 'fixed';
  dropdown.style.top = `${rect.bottom + 5}px`;
  dropdown.style.left = `${rect.left - 150}px`; // adjust as needed for alignment
  
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
  
  // Optional: clear ID when closing (safer)
  // currentPatientId = null;
}

// View patient
window.viewPatient = function() {
  console.log('View patient ID:', currentPatientId);
  
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    // CRITICAL FIX: Ensure currentPatientId is set so the "Edit" button inside view modal works
    currentPatientId = patient.id;
    
    // Open the view patient modal
    openViewPatientModal(patient);
  } else {
    alert('Patient not found. Please refresh the page.');
    console.error('Patient not found for ID:', currentPatientId);
  }
  
  closeAllDropdowns();
}

// Edit patient (directly from dropdown)
window.editPatient = function() {
  console.log('Edit patient ID:', currentPatientId);
  
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    openPatientModal('edit', patient);  // This function is defined in patient-modal.js
  }
  
  closeAllDropdowns();
}

// Remove patient
window.removePatient = function() {
  console.log('Remove patient ID:', currentPatientId);
  
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    if (confirm(`Are you sure you want to remove ${patient.firstName} ${patient.lastName}?`)) {
      // Remove from array
      patients = patients.filter(p => p.id !== currentPatientId);
      
      // Save back to localStorage
      localStorage.setItem('patients', JSON.stringify(patients));
      
      // Refresh the patient table
      if (typeof updatePatientTable === 'function') {
        updatePatientTable();
      } else if (typeof initializePatientTable === 'function') {
        initializePatientTable();
      }
      
      alert('Patient removed successfully.');
    }
  }
  
  closeAllDropdowns();
}

// Setup global listeners for closing dropdown
function setupDropdownListeners() {
  // Close when clicking outside
  document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('actionDropdown');
    if (!dropdown) return;
    
    const isClickInside = dropdown.contains(event.target) || 
                          event.target.classList.contains('action-btn');
    
    if (!isClickInside) {
      closeAllDropdowns();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}