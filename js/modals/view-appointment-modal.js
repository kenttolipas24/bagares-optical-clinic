const _VM_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _VM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _VM_H = {
  'apikey': _VM_KEY,
  'Authorization': `Bearer ${_VM_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function vmPatch(table, body, params) {
  const res = await fetch(`${_VM_URL}/rest/v1/${table}${params}`, {
    method: 'PATCH', headers: _VM_H, body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function vmPost(table, body) {
  const res = await fetch(`${_VM_URL}/rest/v1/${table}`, {
    method: 'POST', headers: _VM_H, body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Time label helper ─────────────────────────────────────────────────────────
function vmTimeLabel(t) {
  if (!t) return '—';
  const map = {
    '08:00':'8:00 AM','09:00':'9:00 AM','10:00':'10:00 AM','11:00':'11:00 AM',
    '13:00':'1:00 PM','14:00':'2:00 PM','15:00':'3:00 PM','16:00':'4:00 PM'
  };
  return map[t] || t;
}

function vmDateLabel(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── State ─────────────────────────────────────────────────────────────────────
let _vmCurrentAppt = null;

// ── Open modal ────────────────────────────────────────────────────────────────
function openViewAppointmentModal(appointment) {
  const modal = document.getElementById('viewAppointmentModal');
  if (!modal) return;

  _vmCurrentAppt = appointment;

  document.getElementById('vd-name').textContent    = appointment.patient_name || '—';
  document.getElementById('vd-date').textContent    = vmDateLabel(appointment.date);
  document.getElementById('vd-time').textContent    = vmTimeLabel(appointment.time);
  document.getElementById('vd-service').textContent = appointment.service || '—';
  document.getElementById('vd-status').textContent  = appointment.status || '—';

  // Reset to default state
  cancelReschedule();

  // Hide confirm button if already confirmed
  const confirmBtn = document.getElementById('vd-confirm-btn');
  if (confirmBtn) {
    confirmBtn.style.display = appointment.status === 'Confirmed' ? 'none' : 'inline-block';
  }

  modal.style.display = 'flex';
}

function closeViewAppointmentModal() {
  const modal = document.getElementById('viewAppointmentModal');
  if (modal) modal.style.display = 'none';
  _vmCurrentAppt = null;
}

// ── Confirm appointment ───────────────────────────────────────────────────────
async function confirmAppointment() {
  if (!_vmCurrentAppt) return;
  const btn = document.getElementById('vd-confirm-btn');
  btn.disabled = true;
  btn.textContent = 'Confirming…';

  try {
    const appt = _vmCurrentAppt;

    // 1. Update booking status to Confirmed
    await vmPatch('bookings', { status: 'Confirmed' }, `?id=eq.${appt.id}`);

    // 2. Send inbox message to patient
    await vmPost('booking_messages', {
      booking_id: appt.id,
      from_role:  'clinic',
      subject:    `Appointment Confirmed — ${appt.id}`,
      body:
`Dear ${appt.patient_name},

Great news! Your appointment has been confirmed by our staff.

  Service:  ${appt.service}
  Doctor:   ${appt.doctor || '—'}
  Date:     ${vmDateLabel(appt.date)}
  Time:     ${vmTimeLabel(appt.time)}

Please arrive 10–15 minutes before your scheduled time. Bring any previous glasses or prescriptions if available.

  Reference No: ${appt.id}

If you need to reschedule or cancel, please contact us:
  Phone: (055) 251-XXXX
  Email: bagares@optical.ph

Thank you,
Bagares Optical Clinic`,
      is_read: false
    });

    // 3. Update UI
    document.getElementById('vd-status').textContent = 'Confirmed';
    btn.style.display = 'none';
    alert('Appointment confirmed. Patient has been notified in their inbox.');
    closeViewAppointmentModal();

    // Refresh appointment table if available
    if (typeof window.refreshAppointments === 'function') window.refreshAppointments();

  } catch (err) {
    console.error('Confirm error:', err);
    alert('Failed to confirm appointment. Please try again.');
    btn.disabled = false;
    btn.textContent = '✓ Confirm';
  }
}

// ── Reschedule ────────────────────────────────────────────────────────────────
function startReschedule() {
  document.getElementById('reschedule-fields').style.display = 'block';
  document.getElementById('vd-actions-default').style.display = 'none';
  document.getElementById('vd-actions-resched').style.display = 'flex';

  // Pre-fill current date/time
  if (_vmCurrentAppt) {
    document.getElementById('resched-date').value  = _vmCurrentAppt.date || '';
    document.getElementById('resched-time').value  = _vmCurrentAppt.time || '';
    document.getElementById('resched-reason').value = '';
  }
}

function cancelReschedule() {
  document.getElementById('reschedule-fields').style.display = 'none';
  document.getElementById('vd-actions-default').style.display = 'flex';
  document.getElementById('vd-actions-resched').style.display = 'none';
}

async function submitReschedule() {
  if (!_vmCurrentAppt) return;

  const newDate   = document.getElementById('resched-date').value;
  const newTime   = document.getElementById('resched-time').value;
  const reason    = document.getElementById('resched-reason').value.trim();

  if (!newDate) { alert('Please select a new date.'); return; }
  if (!newTime) { alert('Please select a new time.'); return; }

  const btn = document.querySelector('#vd-actions-resched button:last-child');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const appt = _vmCurrentAppt;

    // 1. Update booking with new date/time, keep status as Confirmed (or set to Rescheduled)
    await vmPatch('bookings', {
      date:   newDate,
      time:   newTime,
      status: 'Confirmed'
    }, `?id=eq.${appt.id}`);

    // 2. Send reschedule notice to patient inbox
    const reasonLine = reason ? `\n  Reason:   ${reason}` : '';
    await vmPost('booking_messages', {
      booking_id: appt.id,
      from_role:  'clinic',
      subject:    `Appointment Rescheduled — ${appt.id}`,
      body:
`Dear ${appt.patient_name},

Your appointment has been rescheduled by our staff.

  Original Date: ${vmDateLabel(appt.date)} at ${vmTimeLabel(appt.time)}

  New Date:  ${vmDateLabel(newDate)}
  New Time:  ${vmTimeLabel(newTime)}
  Service:   ${appt.service}${reasonLine}

Please take note of your updated schedule. If this time does not work for you, please contact us to arrange another date.

  Phone: (055) 251-XXXX
  Email: bagares@optical.ph

  Reference No: ${appt.id}

Thank you for your understanding,
Bagares Optical Clinic`,
      is_read: false
    });

    alert('Reschedule notice sent. Patient has been notified in their inbox.');
    closeViewAppointmentModal();

    // Refresh appointment table
    if (typeof window.refreshAppointments === 'function') window.refreshAppointments();

  } catch (err) {
    console.error('Reschedule error:', err);
    alert('Failed to send reschedule notice. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Send Reschedule Notice';
  }
}

// ── Load modal HTML ───────────────────────────────────────────────────────────
fetch('../components/modals/receptionist/view-appointment-modal.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('view-appointment-modal-placeholder').innerHTML = html;
  });

// ── Called from appointment action dropdown ───────────────────────────────────
function viewAppointmentDetails() {
  if (!window.appointmentsData) { alert('Appointments not loaded yet'); return; }

  const appointment = window.appointmentsData.find(a => a.id === currentAppointmentId);
  if (!appointment) { alert('Appointment not found'); return; }

  openViewAppointmentModal(appointment);
  closeAppointmentActionModal();
}