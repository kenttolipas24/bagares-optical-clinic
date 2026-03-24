// Load view patient modal HTML
fetch('../components/modals/view-patient.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('view-patient-placeholder').innerHTML = data;
    
    // Setup extra listeners after the modal is loaded
    setupViewPatientModalListeners();
  })
  .catch(error => {
    console.error('Error loading view patient modal:', error);
  });

// MAKE IT GLOBAL - Open view patient modal
window.openViewPatientModal = function(patient) {
  if (!patient) {
    console.error('No patient data provided to openViewPatientModal');
    return;
  }

  const modal = document.getElementById('viewPatientModal');
  if (!modal) {
    console.error('viewPatientModal element not found!');
    return;
  }

  // === Populate all fields ===
  document.getElementById('viewPatientName').textContent = 
    `${patient.firstName || ''} ${patient.middleInitial || ''} ${patient.lastName || ''}`.trim() || 'Patient Name';

  document.getElementById('viewPatientAddress').textContent = patient.address || '-';
  document.getElementById('viewPatientEmail').textContent = patient.email || '-';
  document.getElementById('viewPatientAge').textContent = patient.age || '-';
  document.getElementById('viewPatientBirthdate').textContent = patient.dateOfBirth || '-';
  document.getElementById('viewPatientSex').textContent = patient.sex || '-';
  document.getElementById('viewPatientStatus').textContent = patient.status || 'Active';
  document.getElementById('viewLastVisit').textContent = patient.lastVisit || '-';

  // Medical info (with fallbacks)
  document.getElementById('viewFrame').textContent = patient.frame || 'Face to face';
  document.getElementById('viewLens').textContent = patient.lens || 'kk clear';

  // Prescription (with fallbacks)
  document.getElementById('viewSphereRight').textContent = patient.sphereRight || '+2.25';
  document.getElementById('viewODLeft').textContent = patient.odLeft || patient.prescription || '+2.25 | -0.50 | 90';
  document.getElementById('viewAddRight').textContent = patient.addRight || '2.25';
  document.getElementById('viewPDLeft').textContent = patient.pdLeft || 'kk';

  // Show the modal
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// MAKE IT GLOBAL - Close view patient modal
window.closeViewPatientModal = function() {
  const modal = document.getElementById('viewPatientModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// MAKE IT GLOBAL - Edit patient from inside the view modal
window.editPatientFromView = function() {
  // Get patient data using the global currentPatientId (set in action-dropdown.js)
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);

  if (!patient) {
    alert('Patient data not found. Please try again.');
    console.error('Patient not found for ID:', currentPatientId);
    return;
  }

  // Close view modal first
  closeViewPatientModal();

  // Open the edit modal with the patient data
  // This function comes from patient-modal.js
  openPatientModal('edit', patient);
}

// Extra listeners for closing the modal
function setupViewPatientModalListeners() {
  const modal = document.getElementById('viewPatientModal');
  if (!modal) return;

  // Close when clicking overlay
  modal.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
      closeViewPatientModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      if (modal.classList.contains('show')) {
        closeViewPatientModal();
      }
    }
  });
}