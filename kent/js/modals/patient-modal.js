// Load the patient modal HTML first
fetch('../components/modals/patient-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('patient-modals-placeholder').innerHTML = data;
    
    // Initialize modal functionality after HTML is loaded
    initializePatientModal();
  })
  .catch(error => {
    console.error('Error loading patient modal:', error);
  });

function initializePatientModal() {
  // Handle form submission
  const patientForm = document.getElementById('patientForm');
  if (patientForm) {
    patientForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const patientData = {
        id: Date.now(), // Generate unique ID
        firstName: document.getElementById('firstName').value,
        middleInitial: document.getElementById('middleInitial').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        age: document.getElementById('age').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        address: document.getElementById('address').value,
        sex: document.getElementById('sex').value,
        contactNumber: document.getElementById('contactNumber').value,
        lastVisit: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
        prescription: 'No prescription yet',
        status: 'Active'
      };

      console.log('Patient Data:', patientData);
      
      // Get existing patients from localStorage
      let patients = JSON.parse(localStorage.getItem('patients')) || [];
      
      // Add new patient
      patients.push(patientData);
      
      // Save back to localStorage
      localStorage.setItem('patients', JSON.stringify(patients));
      
      // Update the table if the function exists
      if (typeof window.updatePatientTable === 'function') {
        window.updatePatientTable();
      }
      
      // Close modal
      closePatientModal();
    });
  }

  // Close modal when clicking overlay
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
      closePatientModal();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('patientModal');
      if (modal && modal.classList.contains('active')) {
        closePatientModal();
      }
    }
  });
}

// Patient Modal Functions (Make them global so they can be called from anywhere)
window.openPatientModal = function(mode = 'add', patientData = null) {
  const modal = document.getElementById('patientModal');
  
  if (!modal) {
    console.error('Patient modal not found!');
    return;
  }

  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('patientForm');
  const submitBtn = form.querySelector('.btn-submit');

  if (mode === 'edit' && patientData) {
    modalTitle.textContent = 'Edit Patient';
    submitBtn.textContent = 'Update Patient';
    
    // Store patient ID for updating
    form.dataset.patientId = patientData.id;
    
    // Fill form with patient data
    document.getElementById('firstName').value = patientData.firstName || '';
    document.getElementById('middleInitial').value = patientData.middleInitial || '';
    document.getElementById('lastName').value = patientData.lastName || '';
    document.getElementById('email').value = patientData.email || '';
    document.getElementById('age').value = patientData.age || '';
    document.getElementById('dateOfBirth').value = patientData.dateOfBirth || '';
    document.getElementById('address').value = patientData.address || '';
    document.getElementById('sex').value = patientData.sex || '';
    document.getElementById('contactNumber').value = patientData.contactNumber || '';
  } else {
    modalTitle.textContent = 'Add Patient';
    submitBtn.textContent = 'Add Patient';
    delete form.dataset.patientId;
    form.reset();
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

window.closePatientModal = function() {
  const modal = document.getElementById('patientModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}