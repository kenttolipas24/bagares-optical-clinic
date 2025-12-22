// Load the modal HTML first
fetch('../components/modals/add-appointment.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('add-appointment-modal-placeholder').innerHTML = data;
    console.log('Add appointment modal loaded successfully');
    
    // Use setTimeout to ensure DOM is fully updated
    setTimeout(() => {
      setupModalEventListeners();
    }, 100);
  })
  .catch(error => {
    console.error('Error loading add appointment modal:', error);
  });

// Setup event listeners after modal is loaded
function setupModalEventListeners() {
  const modal = document.getElementById('addAppointmentModal');
  
  if (!modal) {
    console.error('Modal not found after loading. Check your HTML file.');
    return;
  }

  console.log('Modal found! Setting up listeners...');

  // Close on overlay click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeAddAppointmentModal();
    }
  });
}

// Global Escape key listener
document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('addAppointmentModal');
  if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
    closeAddAppointmentModal();
  }
});

// Open Modal (called from button click)
window.openAddAppointmentModal = function() {
  const modal = document.getElementById('addAppointmentModal');
  
  if (!modal) {
    console.error('Modal not loaded yet. Make sure add-appointment-modal.html exists.');
    return;
  }

  modal.classList.add('show');
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('appointmentDate');
  if (dateInput) {
    dateInput.value = today;
  }
}

// Close Modal
window.closeAddAppointmentModal = function() {
  const modal = document.getElementById('addAppointmentModal');
  const form = document.getElementById('appointmentForm');
  
  if (modal) {
    modal.classList.remove('show');
  }
  
  if (form) {
    form.reset();
  }
}

// Save Appointment
window.saveAppointment = function() {
  const form = document.getElementById('appointmentForm');
  
  if (!form) {
    console.error('Form not found');
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const appointmentData = {
    patientName: document.getElementById('patientName').value,
    date: document.getElementById('appointmentDate').value,
    time: document.getElementById('appointmentTime').value,
    service: document.getElementById('service').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value || '',
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value || ''
  };

  console.log('New Appointment:', appointmentData);
  
  // TODO: Send to backend/database here
  // fetch('/api/appointments', { method: 'POST', body: JSON.stringify(appointmentData) })
  
  alert('Appointment saved successfully!');
  closeAddAppointmentModal();
}