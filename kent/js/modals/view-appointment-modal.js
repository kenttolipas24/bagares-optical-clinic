function openViewAppointmentModal(appointment) {
  const modal = document.getElementById('viewAppointmentModal');
  if (!modal) return;

  document.getElementById('vd-name').textContent = appointment.name;
  document.getElementById('vd-date').textContent = appointment.date;
  document.getElementById('vd-time').textContent = appointment.time;
  document.getElementById('vd-service').textContent = appointment.service;

  modal.style.display = 'flex';
}

function closeViewAppointmentModal() {
  const modal = document.getElementById('viewAppointmentModal');
  if (modal) modal.style.display = 'none';
}




// Load modal HTML
fetch('../components/modals/receptionist/view-appointment-modal.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('view-appointment-modal-placeholder').innerHTML = html;
  });

// Called from Appointment Action Dropdown
function viewAppointmentDetails() { 
  if (!window.appointmentsData) {
    alert('Appointments not loaded yet');
    return;
  }

  const appointment = window.appointmentsData.find(
    appt => appt.id === currentAppointmentId
  );

  if (!appointment) {
    alert('Appointment not found');
    return;
  }

  openViewAppointmentModal(appointment);
  closeAppointmentActionModal();
}
