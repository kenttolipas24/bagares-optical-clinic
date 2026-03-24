const _AA_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _AA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _AA_H = { 'apikey': _AA_KEY, 'Authorization': `Bearer ${_AA_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

fetch('../components/modals/add-appointment.html')
  .then(res => res.text())
  .then(data => {
    const placeholder = document.getElementById('add-appointment-modal-placeholder');
    if (!placeholder) return;
    placeholder.innerHTML = data;
    setTimeout(() => {
      const modal = document.getElementById('addAppointmentModal');
      if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeAddAppointmentModal(); });
      const dateInput = document.getElementById('appointmentDate');
      if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
    }, 50);
  })
  .catch(err => console.error('Error loading add appointment modal:', err));

document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('addAppointmentModal');
  if (e.key === 'Escape' && modal?.classList.contains('show')) closeAddAppointmentModal();
});

window.openAddAppointmentModal = function() {
  const modal = document.getElementById('addAppointmentModal');
  if (modal) modal.classList.add('show');
};

window.closeAddAppointmentModal = function() {
  const modal = document.getElementById('addAppointmentModal');
  if (modal) modal.classList.remove('show');
  const form = document.getElementById('appointmentForm');
  if (form) form.reset();
};

window.saveAppointment = async function() {
  const v = id => document.getElementById(id)?.value.trim() || '';
  const firstname  = v('firstname');
  const lastname   = v('lastname');
  const date       = v('appointmentDate');
  const time       = v('appointmentTime');
  const service    = v('service');

  if (!firstname || !lastname || !date || !time || !service) {
    alert('Please fill all required fields.');
    return;
  }

  try {
    // 1. Check slot conflict
    const checkRes = await fetch(
      `${_AA_URL}/rest/v1/bookings?date=eq.${date}&time=eq.${time}&status=neq.Cancelled&select=id`,
      { headers: _AA_H }
    );
    const conflicts = await checkRes.json();
    if (conflicts.length > 0) {
      const warn = document.getElementById('conflictWarning');
      if (warn) warn.classList.remove('hidden');
      return;
    }

    // 2. Create patient record
    const patientRes = await fetch(`${_AA_URL}/rest/v1/patient_records`, {
      method: 'POST', headers: _AA_H,
      body: JSON.stringify({
        firstname, middlename: v('middlename') || null,
        lastname, suffix: v('suffix') || null,
        phone: v('phone') || null, email: v('email') || null,
        birthdate: null, address: null
      })
    });
    if (!patientRes.ok) throw new Error(await patientRes.text());
    const [patient] = await patientRes.json();

    // 3. Create booking
    const bookingId = 'BOC-' + Date.now().toString(36).toUpperCase().slice(-6);
    const bookingRes = await fetch(`${_AA_URL}/rest/v1/bookings`, {
      method: 'POST', headers: _AA_H,
      body: JSON.stringify({
        id: bookingId,
        patient_name: `${firstname} ${lastname}`,
        patient_email: v('email') || null,
        phone: v('phone') || null,
        service, date, time,
        status: 'Confirmed',
        notes: v('notes') || null,
        patient_type: 'Walk-in',
        notif: 'None'
      })
    });
    if (!bookingRes.ok) throw new Error(await bookingRes.text());

    alert('Appointment added successfully!');
    closeAddAppointmentModal();
    if (typeof window.refreshAppointments === 'function') window.refreshAppointments();

  } catch (err) {
    console.error('Save appointment error:', err);
    alert('Error saving appointment: ' + err.message);
  }
};