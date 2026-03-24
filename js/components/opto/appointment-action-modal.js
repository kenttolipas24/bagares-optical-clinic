const _ACT_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _ACT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _ACT_H  = { 'apikey': _ACT_KEY, 'Authorization': `Bearer ${_ACT_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

fetch('../components/modals/optometrist/appointment-action-modal.html')
  .then(res => res.text())
  .then(html => {
    const placeholder = document.getElementById('appointment-action-dropdown-placeholder');
    if (!placeholder) return;
    placeholder.innerHTML = html;
    setupGlobalClickListener();
  })
  .catch(error => console.error('Error loading appointment action modal:', error));

// currentAppointmentId = booking ID (e.g. BOC-TEST01) OR patient record ID (integer)
let currentAppointmentId = null;

window.openAppointmentActionModal = function(event, appointmentId) {
  event.stopPropagation();
  if (!appointmentId) return;

  currentAppointmentId = appointmentId;

  const modal = document.getElementById('appointmentActionModal');
  if (!modal) { console.error('Modal #appointmentActionModal not found'); return; }

  const content = modal.querySelector('.action-dropdown-content');
  if (!content) { console.error('Dropdown content not found'); return; }

  const rect = event.currentTarget.getBoundingClientRect();
  modal.classList.add('show');
  content.style.position = 'fixed';
  content.style.top      = `${rect.bottom + 8}px`;
  content.style.left     = `${rect.right - content.offsetWidth}px`;
  content.style.zIndex   = '1001';
};

window.closeAppointmentActionModal = function() {
  const modal = document.getElementById('appointmentActionModal');
  if (modal) modal.classList.remove('show');
  currentAppointmentId = null;
};

function setupGlobalClickListener() {
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('appointmentActionModal');
    if (!modal || !modal.classList.contains('show')) return;
    const isInside = modal.querySelector('.action-dropdown-content')?.contains(e.target)
                  || e.target.closest('.action-btn');
    if (!isInside) closeAppointmentActionModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAppointmentActionModal();
  });
}

window.viewPatientDetails = function() {
  alert(`Appointment/Booking ID: ${currentAppointmentId}`);
  closeAppointmentActionModal();
};

// ── Main eye exam handler ─────────────────────────────────────────────────────
window.eyeExamine = async function() {
  if (!currentAppointmentId) { alert('No appointment selected'); return; }
  closeAppointmentActionModal();

  const id = currentAppointmentId;

  try {
    let patientId   = null;
    let bookingId   = null;

    // Case 1: it's a booking ID (text, starts with BOC-)
    if (typeof id === 'string' && id.startsWith('BOC-')) {
      bookingId = id;

      // Step 1: get booking to find patient email
      const bookingRes = await fetch(
        `${_ACT_URL}/rest/v1/bookings?id=eq.${id}&select=patient_email,patient_name`,
        { headers: _ACT_H }
      );
      if (!bookingRes.ok) throw new Error('Booking fetch failed: ' + await bookingRes.text());
      const bookings = await bookingRes.json();
      const booking  = bookings[0];
      if (!booking) { alert('Booking not found: ' + id); return; }

      // Step 2: find patient record by email
      if (booking.patient_email) {
        const patRes = await fetch(
          `${_ACT_URL}/rest/v1/patient_records?email=eq.${encodeURIComponent(booking.patient_email)}&select=id&limit=1`,
          { headers: _ACT_H }
        );
        const patients = patRes.ok ? await patRes.json() : [];

        if (patients.length) {
          patientId = patients[0].id;
        } else {
          // Patient doesn't exist yet — create them
          const nameParts = (booking.patient_name || '').trim().split(' ');
          const firstname  = nameParts[0] || 'Unknown';
          const lastname   = nameParts.slice(1).join(' ') || '—';
          const createRes  = await fetch(`${_ACT_URL}/rest/v1/patient_records`, {
            method: 'POST', headers: _ACT_H,
            body: JSON.stringify({ firstname, lastname, email: booking.patient_email })
          });
          if (!createRes.ok) throw new Error('Patient create failed: ' + await createRes.text());
          const [newPatient] = await createRes.json();
          patientId = newPatient.id;
        }
      } else {
        // No email — create minimal patient record from name
        const nameParts = (booking.patient_name || '').trim().split(' ');
        const firstname  = nameParts[0] || 'Unknown';
        const lastname   = nameParts.slice(1).join(' ') || '—';
        const createRes  = await fetch(`${_ACT_URL}/rest/v1/patient_records`, {
          method: 'POST', headers: _ACT_H,
          body: JSON.stringify({ firstname, lastname })
        });
        if (!createRes.ok) throw new Error('Patient create failed: ' + await createRes.text());
        const [newPatient] = await createRes.json();
        patientId = newPatient.id;
      }

    } else {
      // Case 2: it's already a patient record ID (integer from patient table)
      patientId = id;
    }

    // Open eye exam modal with resolved patient ID
    if (!patientId) { alert('Could not resolve patient ID.'); return; }

    if (typeof window.openEyeExamModal === 'function') {
      window.openEyeExamModal(patientId, bookingId);
    } else {
      alert('Eye exam modal not loaded yet. Please try again.');
    }

  } catch (err) {
    console.error('Eye exam open error:', err);
    alert('Error opening eye exam: ' + err.message);
  }
};

window.cancelPatient = async function() {
  if (!currentAppointmentId) return;
  if (!confirm(`Cancel appointment ${currentAppointmentId}?`)) {
    closeAppointmentActionModal();
    return;
  }
  try {
    const res = await fetch(
      `${_ACT_URL}/rest/v1/bookings?id=eq.${currentAppointmentId}`,
      { method: 'PATCH', headers: _ACT_H, body: JSON.stringify({ status: 'Cancelled' }) }
    );
    if (!res.ok) throw new Error(await res.text());
    alert('Appointment cancelled.');
    if (typeof window.refreshAppointments === 'function') window.refreshAppointments();
  } catch (err) {
    alert('Error cancelling: ' + err.message);
  }
  closeAppointmentActionModal();
};