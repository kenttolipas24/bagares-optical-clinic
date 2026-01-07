// Load the appointment action modal HTML
fetch('../components/modals/appointment-action-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('appointment-action-dropdown-placeholder').innerHTML = data;
    console.log('Appointment action modal loaded successfully');
    setupGlobalClickListener();
  })
  .catch(error => {
    console.error('Error loading appointment action modal:', error);
  });

let currentAppointmentId = null;

window.openAppointmentActionModal = function(event, appointmentId) {
  event.stopPropagation();
  currentAppointmentId = appointmentId;

  const modal = document.getElementById('appointmentActionModal');
  if (!modal) {
    console.error('Modal not found — HTML may not have loaded');
    return;
  }

  const content = modal.querySelector('.action-dropdown-content');
  const rect = event.currentTarget.getBoundingClientRect();

  modal.classList.add('show');

  // Position dropdown below and aligned to right of button
  content.style.top = `${rect.bottom + 5}px`;
  content.style.left = `${rect.right - content.offsetWidth}px`;
}

window.closeAppointmentActionModal = function() {
  const modal = document.getElementById('appointmentActionModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

function setupGlobalClickListener() {
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('appointmentActionModal');
    if (!modal) return;

    const isClickInside = modal.querySelector('.action-dropdown-content')?.contains(e.target) || 
                          e.target.closest('.actions-btn');

    if (!isClickInside && modal.classList.contains('show')) {
      closeAppointmentActionModal();
    }
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeAppointmentActionModal();
  }
});

// Action functions
function viewAppointmentDetails() { 
  console.log('View details for appointment:', currentAppointmentId);
  // TODO: Open view details modal
  alert(`View details for appointment: ${currentAppointmentId}`); 
  closeAppointmentActionModal(); 
}

function rescheduleAppointment() { 
  console.log('Reschedule appointment:', currentAppointmentId);
  // TODO: Open reschedule modal
  alert(`Reschedule appointment: ${currentAppointmentId}`); 
  closeAppointmentActionModal(); 
}

function cancelAppointment() { 
  if (confirm(`Are you sure you want to cancel appointment ${currentAppointmentId}?`)) {
    console.log('Cancel appointment:', currentAppointmentId);
    // TODO: API call to cancel appointment
    alert('Appointment cancelled successfully');
  }
  closeAppointmentActionModal(); 
}