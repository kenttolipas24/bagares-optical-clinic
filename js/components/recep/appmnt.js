const _AURL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _AKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _AH = { 'apikey': _AKEY, 'Authorization': `Bearer ${_AKEY}` };

async function apptGet(params = '') {
  const res = await fetch(`${_AURL}/rest/v1/bookings${params}`, { headers: _AH });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

fetch('../components/receptionist/appmnt.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('appointment-placeholder').innerHTML = data;
    initializeAppointment();
  })
  .catch(err => console.error('Error loading appointment content:', err));

function initializeAppointment() {
  let currentDate = new Date();

  async function loadAppointments(searchTerm = '') {
    const tbody = document.getElementById('appointmentTable');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;padding:20px">Loading appointments...</td></tr>`;

    try {
      const data = await apptGet('?status=eq.Confirmed&order=date.asc,time.asc');
      window.appointmentsData = data;

      let filtered = data;
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        filtered = data.filter(a =>
          (a.patient_name || '').toLowerCase().includes(t) ||
          (a.service || '').toLowerCase().includes(t) ||
          (a.date || '').includes(t)
        );
      }

      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;padding:20px">${searchTerm ? 'No appointments match your search' : 'No confirmed appointments'}</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(a => `
        <tr data-id="${a.id}">
          <td>${a.patient_name || '—'}</td>
          <td>${formatDate(a.date)}</td>
          <td>${formatTime(a.time)}</td>
          <td>${a.service || '—'}</td>
          <td>
            <button class="action-btn" onclick="openAppointmentActionModal(event, '${a.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
                <circle cx="12" cy="5"  r="1" fill="currentColor"></circle>
                <circle cx="12" cy="19" r="1" fill="currentColor"></circle>
              </svg>
            </button>
          </td>
        </tr>`).join('');

    } catch (err) {
      console.error('Error loading appointments:', err);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ef4444;padding:20px">Error loading appointments.</td></tr>`;
    }
  }

  async function showAppointmentsForDay(year, month, day) {
    const detail = document.getElementById('appointmentDetail');
    if (!detail) return;

    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    detail.innerHTML = '<div style="color:#999;">Loading...</div>';

    try {
      const data = await apptGet(`?date=eq.${dateStr}&status=eq.Confirmed&order=time.asc`);

      if (!data.length) {
        detail.innerHTML = `<div class="appointment-detail-header"><strong>${day}</strong><span>No appointments</span></div>`;
        return;
      }

      detail.innerHTML = `
        <div class="appointment-detail-header">
          <strong>${day}</strong>
          <span>${data.length} appointment${data.length > 1 ? 's' : ''}</span>
        </div>
        <div style="margin-top:10px;">
          ${data.map(a => `
            <div style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:500;">${a.patient_name}</div>
              <div style="font-size:12px;color:#666;">${formatTime(a.time)} — ${a.service}</div>
            </div>`).join('')}
        </div>`;
    } catch (err) {
      detail.innerHTML = '<div style="color:#ef4444;">Error loading appointments</div>';
    }
  }

  function generateCalendar() {
    const grid  = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarTitle');
    if (!grid || !title) return;

    grid.innerHTML = '';
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    title.textContent = `${year} ${monthNames[month]}`;

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    const today       = new Date();

    for (let i = firstDay-1; i >= 0; i--) {
      const d = document.createElement('div');
      d.className = 'calendar-day other-month';
      d.textContent = daysInPrev - i;
      grid.appendChild(d);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = document.createElement('div');
      d.className = 'calendar-day';
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        d.classList.add('today');
      }
      d.textContent = day;
      d.onclick = (e) => {
        document.querySelectorAll('.calendar-day').forEach(x => x.classList.remove('selected'));
        e.target.classList.add('selected');
        showAppointmentsForDay(year, month, day);
      };
      grid.appendChild(d);
    }
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => loadAppointments(e.target.value));
  }

  window.refreshAppointments = loadAppointments;
  window.changeMonth = function(dir) {
    currentDate.setMonth(currentDate.getMonth() + dir);
    generateCalendar();
  };

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
  }
  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  }

  loadAppointments();
  generateCalendar();
}