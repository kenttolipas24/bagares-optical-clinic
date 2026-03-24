/* ===============================
   SUPABASE CONFIG
   (same project as site/js/shared.js)
================================ */
const SUPA_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';

const supaHeaders = {
  'apikey': SUPA_KEY,
  'Authorization': `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function supaGet(table, params = '') {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}${params}`, {
    headers: supaHeaders
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function supaPatch(table, body, params = '') {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}${params}`, {
    method: 'PATCH',
    headers: supaHeaders,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function supaPost(table, body) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: supaHeaders,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ===============================
   GLOBAL STATE
================================ */
let selectedRequestId = null;
let allRequestsData   = [];
let requestsData      = [];
let lastRequestCount  = 0;
let isInitialLoad     = true;

/* ===============================
   LOAD REQUEST COMPONENT
================================ */
fetch('../components/receptionist/request.html')
  .then(res => res.text())
  .then(html => {
    const holder = document.getElementById('request-placeholder');
    if (holder) {
      holder.innerHTML = html;
      loadRequests();
      setupSearch();
    }
  })
  .catch(err => console.error('Error loading request component:', err));

/* ===============================
   LOAD REQUESTS FROM SUPABASE
================================ */
async function loadRequests(isAutoRefresh = false) {
  try {
    // Fetch only Pending bookings, newest first
    const data = await supaGet(
      'bookings',
      '?status=eq.Pending&order=created_at.desc'
    );

    if (isInitialLoad) {
      allRequestsData  = data;
      requestsData     = data;
      lastRequestCount = data.length;
      renderRequests();
      isInitialLoad = false;
      return;
    }

    // Auto-refresh: notify if new booking came in
    if (isAutoRefresh && data.length > lastRequestCount) {
      console.log('New booking request detected');
      showNewBookingBadge(data.length - lastRequestCount);
    }

    lastRequestCount = data.length;
    allRequestsData  = data;

    if (!isAutoRefresh) {
      requestsData = data;
      renderRequests();
    }

  } catch (err) {
    console.error('Load requests error:', err);
    const tbody = document.getElementById('requestsTable');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#dc2626;">
        Failed to load requests. Check console.
      </td></tr>`;
    }
  }
}

/* ===============================
   NEW BOOKING BADGE
================================ */
function showNewBookingBadge(count) {
  // Refresh the visible list immediately
  requestsData = allRequestsData;
  renderRequests();

  // Show a small toast notification
  let toast = document.getElementById('_reqToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = '_reqToast';
    toast.style.cssText = `
      position:fixed;bottom:1.5rem;right:1.5rem;
      background:#059669;color:white;
      padding:10px 18px;border-radius:8px;
      font-size:13.5px;font-weight:600;
      z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = `${count} new booking request${count > 1 ? 's' : ''}!`;
  toast.style.opacity = '1';
  setTimeout(() => toast.style.opacity = '0', 4000);
}

/* ===============================
   RENDER TABLE
================================ */
function renderRequests() {
  const tbody = document.getElementById('requestsTable');
  if (!tbody) return;

  if (!Array.isArray(requestsData) || requestsData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:40px;color:#999;">
          No pending booking requests
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = requestsData.map(req => `
    <tr>
      <td>${req.patient_name || '—'}</td>
      <td>${req.date ? formatDate(req.date) : '—'}</td>
      <td>${req.time ? formatTime(req.time) : '—'}</td>
      <td>${req.service || '—'}</td>
      <td>${req.address || 'N/A'}</td>
      <td>
        <button class="action-btn"
          onclick="toggleActionDropdown(event, '${req.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

/* ===============================
   SEARCH
================================ */
function setupSearch() {
  const input = document.getElementById('requestSearchInput');
  if (!input) return;

  input.addEventListener('input', e => {
    const term = e.target.value.toLowerCase().trim();
    requestsData = term === ''
      ? allRequestsData
      : allRequestsData.filter(r =>
          (r.patient_name || '').toLowerCase().includes(term) ||
          (r.service      || '').toLowerCase().includes(term) ||
          (r.address      || '').toLowerCase().includes(term)
        );
    renderRequests();
  });
}

/* ===============================
   ACTION DROPDOWN
================================ */
function toggleActionDropdown(event, id) {
  event.stopPropagation();
  selectedRequestId = id;

  const dropdown = document.getElementById('requestActionDropdown');
  const overlay   = document.getElementById('dropdownOverlay');
  if (!dropdown || !overlay) return;

  const rect = event.currentTarget.getBoundingClientRect();
  dropdown.style.top  = `${rect.bottom + window.scrollY + 5}px`;
  dropdown.style.left = `${rect.left - 150}px`;

  dropdown.classList.add('show');
  overlay.classList.add('show');
}

function closeActionDropdown() {
  document.getElementById('requestActionDropdown')?.classList.remove('show');
  document.getElementById('dropdownOverlay')?.classList.remove('show');
}

/* ===============================
   CONFIRM APPOINTMENT
================================ */
function openConfirmModal() {
  closeActionDropdown();
  const req = allRequestsData.find(r => r.id === selectedRequestId);
  if (!req) return;

  document.getElementById('confirmModalBody').innerHTML = `
    <p><b>Patient:</b> ${req.patient_name || '—'}</p>
    <p><b>Service:</b> ${req.service || '—'}</p>
    <p><b>Doctor:</b> ${req.doctor || '—'}</p>
    <p><b>Date & Time:</b> ${formatDate(req.date)} at ${formatTime(req.time)}</p>
    <p><b>Address:</b> ${req.address || 'N/A'}</p>
    <p><b>Contact:</b> ${req.phone || '—'}</p>
    <p><b>Notes:</b> ${req.notes || 'None'}</p>
  `;
  document.getElementById('confirmModal').classList.add('show');
}

function closeConfirmModal() {
  document.getElementById('confirmModal')?.classList.remove('show');
}

async function confirmAppointment() {
  if (!selectedRequestId) return;

  const btn = document.querySelector('#confirmModal .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Confirming…'; }

  try {
    // 1. Update booking status to Confirmed
    await supaPatch('bookings', { status: 'Confirmed' }, `?id=eq.${selectedRequestId}`);

    // 2. Add a confirmation message to patient inbox
    const req = allRequestsData.find(r => r.id === selectedRequestId);
    if (req) {
      await supaPost('booking_messages', {
        booking_id: req.id,
        from_role:  'clinic',
        subject:    `Appointment Confirmed — ${req.id}`,
        body:       `Dear ${req.patient_name},\n\nYour appointment has been <strong>confirmed</strong> by our staff.\n\n  Service:  ${req.service}\n  Doctor:   ${req.doctor}\n  Date:     ${formatDate(req.date)}\n  Time:     ${formatTime(req.time)}\n\nPlease arrive 10–15 minutes early and bring any previous glasses or prescriptions.\n\nThank you,\nBagares Optical Clinic`,
        is_read:    false
      });
    }

    // 3. Remove from local list and re-render
    allRequestsData = allRequestsData.filter(r => r.id !== selectedRequestId);
    requestsData    = allRequestsData;
    renderRequests();
    closeConfirmModal();

    alert('Appointment confirmed. Patient has been notified.');

    if (typeof window.refreshAppointments === 'function') {
      window.refreshAppointments();
    }
  } catch (err) {
    console.error('Confirm error:', err);
    alert('Error confirming appointment: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Confirm Booking'; }
  }
}

/* ===============================
   RESCHEDULE
================================ */
function openRescheduleModal() {
  closeActionDropdown();
  document.getElementById('rescheduleModal')?.classList.add('show');
}
function closeRescheduleModal() {
  document.getElementById('rescheduleModal')?.classList.remove('show');
}

async function rescheduleAppointment() {
  const newDate   = document.getElementById('rescheduleDate')?.value;
  const newTime   = document.getElementById('rescheduleTime')?.value;
  const reason    = document.getElementById('rescheduleReason')?.value || '';

  if (!newDate || !newTime) {
    alert('Please select a new date and time.');
    return;
  }

  const btn = document.querySelector('#rescheduleModal .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Rescheduling…'; }

  try {
    await supaPatch('bookings',
      { date: newDate, time: newTime, status: 'Pending' },
      `?id=eq.${selectedRequestId}`
    );

    const req = allRequestsData.find(r => r.id === selectedRequestId);
    if (req) {
      await supaPost('booking_messages', {
        booking_id: req.id,
        from_role:  'clinic',
        subject:    `Appointment Rescheduled — ${req.id}`,
        body:       `Dear ${req.patient_name},\n\nYour appointment has been <strong>rescheduled</strong>.\n\n  New Date: ${formatDate(newDate)}\n  New Time: ${formatTime(newTime)}\n  ${reason ? 'Reason: ' + reason : ''}\n\nPlease confirm your availability.\n\nThank you,\nBagares Optical Clinic`,
        is_read:    false
      });
    }

    // Update local data
    const idx = allRequestsData.findIndex(r => r.id === selectedRequestId);
    if (idx !== -1) {
      allRequestsData[idx].date = newDate;
      allRequestsData[idx].time = newTime;
    }
    requestsData = allRequestsData;
    renderRequests();
    closeRescheduleModal();
    alert('Appointment rescheduled. Patient has been notified.');
  } catch (err) {
    console.error('Reschedule error:', err);
    alert('Error rescheduling: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Reschedule'; }
  }
}

/* ===============================
   CANCEL
================================ */
function openCancelModal() {
  closeActionDropdown();
  document.getElementById('cancelModal')?.classList.add('show');
}
function closeCancelModal() {
  document.getElementById('cancelModal')?.classList.remove('show');
}

async function cancelAppointment() {
  const reason = document.getElementById('cancelReason')?.value || '';

  const btn = document.querySelector('#cancelModal .btn-danger');
  if (btn) { btn.disabled = true; btn.textContent = 'Cancelling…'; }

  try {
    await supaPatch('bookings', { status: 'Cancelled' }, `?id=eq.${selectedRequestId}`);

    const req = allRequestsData.find(r => r.id === selectedRequestId);
    if (req) {
      await supaPost('booking_messages', {
        booking_id: req.id,
        from_role:  'clinic',
        subject:    `Appointment Cancelled — ${req.id}`,
        body:       `Dear ${req.patient_name},\n\nWe regret to inform you that your appointment has been <strong>cancelled</strong>.\n\n  Service: ${req.service}\n  Date:    ${formatDate(req.date)}\n  ${reason ? 'Reason: ' + reason : ''}\n\nYou may book a new appointment at any time.\n\nThank you,\nBagares Optical Clinic`,
        is_read:    false
      });
    }

    allRequestsData = allRequestsData.filter(r => r.id !== selectedRequestId);
    requestsData    = allRequestsData;
    renderRequests();
    closeCancelModal();
    alert('Appointment cancelled. Patient has been notified.');
  } catch (err) {
    console.error('Cancel error:', err);
    alert('Error cancelling: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Cancel Appointment'; }
  }
}

/* ===============================
   FORMATTERS
================================ */
function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d + 'T00:00:00');
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function formatTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  if (!h) return '—';
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

/* ===============================
   AUTO REFRESH every 10s
================================ */
const requestAutoRefresh = setInterval(() => loadRequests(true), 10000);
window.addEventListener('beforeunload', () => clearInterval(requestAutoRefresh));

/* ===============================
   EXPOSE GLOBALS
================================ */
window.loadRequests          = loadRequests;
window.toggleActionDropdown  = toggleActionDropdown;
window.closeActionDropdown   = closeActionDropdown;
window.openConfirmModal      = openConfirmModal;
window.closeConfirmModal     = closeConfirmModal;
window.confirmAppointment    = confirmAppointment;
window.openRescheduleModal   = openRescheduleModal;
window.closeRescheduleModal  = closeRescheduleModal;
window.rescheduleAppointment = rescheduleAppointment;
window.openCancelModal       = openCancelModal;
window.closeCancelModal      = closeCancelModal;
window.cancelAppointment     = cancelAppointment;