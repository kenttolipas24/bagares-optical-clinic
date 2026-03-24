const _OA_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _OA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _OA_H = { 'apikey': _OA_KEY, 'Authorization': `Bearer ${_OA_KEY}` };

fetch('../components/optometrists/appmnt.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('Cal&Det-placeholder').innerHTML = data;
    
    // Hide default summary triangle globally
    if (!document.getElementById('hide-triangle-fix')) {
        const style = document.createElement('style');
        style.id = 'hide-triangle-fix';
        style.innerHTML = `details summary::-webkit-details-marker { display: none; } details summary { list-style: none; }`;
        document.head.appendChild(style);
    }
    
    initializeAppointment();
  })
  .catch(error => console.error('Error loading appointment content:', error));

function initializeAppointment() {
  let currentDate = new Date();
  let selectedDate = null;

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function formatTime(t) {
    if (!t) return 'N/A';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  async function loadAppointments(searchTerm = '') {
    const tbody = document.getElementById('appointmentTable');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;padding:20px">Loading appointments...</td></tr>`;

    try {
      // 1. Fetch Bookings
      const res = await fetch(
        `${_OA_URL}/rest/v1/bookings?select=*&status=eq.Confirmed&order=date.asc,time.asc`,
        { headers: _OA_H }
      );
      if (!res.ok) throw new Error(await res.text());
      let data = await res.json();

      // 2. MAGIC FIX: Fetch Patient Records for Auto-Matching
      let patients = [];
      try {
          const pRes = await fetch(`${_OA_URL}/rest/v1/patient_records?select=id,firstname,lastname`, { headers: _OA_H });
          if(pRes.ok) patients = await pRes.json();
      } catch(e) { console.warn("Could not fetch patients for matching"); }

      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        data = data.filter(a =>
          (a.patient_name || '').toLowerCase().includes(t) ||
          (a.service || '').toLowerCase().includes(t)
        );
      }

      if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;padding:20px">${searchTerm ? 'No appointments match your search' : 'No confirmed appointments'}</td></tr>`;
        return;
      }

      tbody.innerHTML = data.map(a => {
          // --- THE AUTO-MATCHER LOGIC ---
          let safePatientId = a.patient_id || a.account_id || ''; 
          
          if (!safePatientId && a.patient_name) {
              const searchName = a.patient_name.toLowerCase().replace(/\s+/g, '');
              const match = patients.find(p => {
                  const fName = (p.firstname || '').toLowerCase().replace(/\s+/g, '');
                  const lName = (p.lastname || '').toLowerCase().replace(/\s+/g, '');
                  return (fName + lName) === searchName || 
                         (lName + fName) === searchName || 
                         a.patient_name.toLowerCase().includes((p.firstname || '').toLowerCase());
              });
              if (match) safePatientId = match.id; // Automatically links the ID!
          }

          const safeBookingId = a.id || '';

          return `
            <tr data-id="${a.id}">
              <td>${a.patient_name || '—'}</td>
              <td>${formatDate(a.date)}</td>
              <td>${formatTime(a.time)}</td>
              <td>${a.service || '—'}</td>
              <td style="overflow: visible;">
                
                <details style="position: relative; display: inline-block;">
                    <summary style="cursor: pointer; padding: 5px; outline: none;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                            <circle cx="12" cy="12" r="1.5"></circle>
                            <circle cx="12" cy="5" r="1.5"></circle>
                            <circle cx="12" cy="19" r="1.5"></circle>
                        </svg>
                    </summary>
                    
                    <div style="position: absolute; right: 0; top: 100%; background: white; border: 1px solid #d1d5db; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); min-width: 160px; z-index: 9999; display: flex; flex-direction: column; overflow: hidden; padding: 4px 0;">
                        
                        <button style="padding: 10px 16px; background: white; border: none; text-align: left; cursor: pointer; color: #374151; display: flex; gap: 8px; align-items: center; width: 100%; font-size: 14px;" onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='white'" onclick="openViewDetails('${safeBookingId}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            View Details
                        </button>
                        
                        <button style="padding: 10px 16px; background: white; border: none; text-align: left; cursor: pointer; color: #ea580c; display: flex; gap: 8px; align-items: center; width: 100%; font-size: 14px;" onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='white'" onclick="window.openEyeExamModal('${safePatientId}', '${safeBookingId}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            Eye Examine
                        </button>
                        
                        <button style="padding: 10px 16px; background: white; border: none; text-align: left; cursor: pointer; color: #dc2626; display: flex; gap: 8px; align-items: center; width: 100%; font-size: 14px;" onmouseover="this.style.backgroundColor='#fef2f2'" onmouseout="this.style.backgroundColor='white'" onclick="cancelApt('${safeBookingId}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Cancel
                        </button>
                        
                    </div>
                </details>
              </td>
            </tr>`;
      }).join('');
    } catch (err) {
      console.error('Appointment load error:', err);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ef4444;padding:20px">Error loading appointments.</td></tr>`;
    }
  }

  async function showAppointmentsForDay(dateStr) {
    const detail = document.getElementById('appointmentDetail');
    if (!detail) return;
    detail.innerHTML = '<div style="color:#999;">Loading...</div>';
    try {
      const res = await fetch(
        `${_OA_URL}/rest/v1/bookings?date=eq.${dateStr}&status=eq.Confirmed&order=time.asc`,
        { headers: _OA_H }
      );
      const data = await res.json();
      if (!data.length) {
        detail.innerHTML = `<div style="padding: 15px; color: #666;">No appointments for this day</div>`;
        return;
      }
      detail.innerHTML = data.map(a => `
        <div style="padding:12px; border-bottom:1px solid #e5e7eb; background: #fff; border-radius: 6px; margin-bottom: 8px;">
          <strong style="color: #1f2937;">${a.patient_name}</strong><br>
          <small style="color: #6b7280; font-size: 13px;">${formatTime(a.time)} – ${a.service}</small>
        </div>`).join('');
    } catch (err) {
      detail.innerHTML = '<div style="color:#ef4444;">Error loading appointments</div>';
    }
  }

  function generateCalendar() {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarTitle');
    if (!grid || !title) return;
    grid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    title.textContent = `${year} ${currentDate.toLocaleString('default', { month: 'long' })}`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      cell.textContent = day;
      cell.onclick = () => {
        document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
        cell.classList.add('selected');
        selectedDate = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        showAppointmentsForDay(selectedDate);
      };
      grid.appendChild(cell);
    }
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', e => loadAppointments(e.target.value));

  window.changeMonth = function(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar();
  };

  window.refreshAppointments = loadAppointments;

  window.openViewDetails = function(bookingId) { console.log('Open View Details for:', bookingId); };
  
  window.cancelApt = async function(bookingId) {
      if(!confirm('Are you sure you want to cancel this appointment?')) return;
      try {
          await fetch(`${_OA_URL}/rest/v1/bookings?id=eq.${bookingId}`, {
              method: 'PATCH', headers: _OA_H, body: JSON.stringify({ status: 'Cancelled' })
          });
          loadAppointments();
      } catch(err) {
          console.error(err); alert('Failed to cancel appointment.');
      }
  };

  // Click outside to close dropdowns
  document.addEventListener('click', function (event) {
      if (!event.target.closest('details')) {
          document.querySelectorAll('details[open]').forEach(d => d.removeAttribute('open'));
      }
  });

  loadAppointments();
  generateCalendar();
}