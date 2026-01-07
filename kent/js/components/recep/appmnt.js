// Load the appointment HTML content first
fetch('../components/receptionist/appmnt.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('Cal&Det-placeholder').innerHTML = data;
    initializeAppointment();
  })
  .catch(error => {
    console.error('Error loading appointment content:', error);
  });

function initializeAppointment() {
  let currentDate = new Date();
  let selectedDate = null;

  // ✅ MAKE GLOBAL (THIS IS THE FIX)
  window.appointmentsData = [
    {
      id: 'appt-001',
      name: 'Rechelle P. Aldea',
      date: '01/01/2025',
      time: '10:00 AM',
      service: 'Consultation',
      status: 'Pending'
    },
    {
      id: 'appt-002',
      name: 'John Doe',
      date: '01/05/2025',
      time: '2:00 PM',
      service: 'Eye Exam',
      status: 'Confirmed'
    },
    {
      id: 'appt-003',
      name: 'Maria Santos',
      date: '01/10/2025',
      time: '9:00 AM',
      service: 'Consultation',
      status: 'Completed'
    },
    {
      id: 'appt-004',
      name: 'Pedro Cruz',
      date: '01/15/2025',
      time: '3:30 PM',
      service: 'Follow-up',
      status: 'Pending'
    },
    {
      id: 'appt-005',
      name: 'Ana Reyes',
      date: '01/20/2025',
      time: '11:00 AM',
      service: 'Eye Exam',
      status: 'Confirmed'
    }
  ];

  // Calendar appointments mapping (unchanged)
  const appointments = {
    '2025-0-1': [{ name: 'Rechelle P. Aldea', time: '10:00 AM', service: 'Consultation' }],
    '2025-0-5': [{ name: 'John Doe', time: '2:00 PM', service: 'Eye Exam' }],
    '2025-0-10': [{ name: 'Maria Santos', time: '9:00 AM', service: 'Consultation' }],
    '2025-0-15': [{ name: 'Pedro Cruz', time: '3:30 PM', service: 'Follow-up' }],
    '2025-0-20': [{ name: 'Ana Reyes', time: '11:00 AM', service: 'Eye Exam' }]
  };

  // ✅ USE GLOBAL DATA
  function loadAppointments(data = window.appointmentsData) {
    const tbody = document.getElementById('appointmentTable');
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:#999;padding:20px">
            No appointments found
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data.map(appt => `
      <tr data-appointment-id="${appt.id}">
        <td>${appt.name}</td>
        <td>${appt.date}</td>
        <td>${appt.time}</td>
        <td>${appt.service}</td>
        <td>
          <button class="actions-btn"
            onclick="openAppointmentActionModal(event, '${appt.id}')">⋮</button>
        </td>
      </tr>
    `).join('');
  }

  // --- EVERYTHING BELOW IS UNCHANGED ---

  function generateCalendar() {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarTitle');
    if (!grid || !title) return;

    grid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    title.textContent = `${year} ${monthNames[month]}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = document.createElement('div');
      d.className = 'calendar-day other-month';
      d.textContent = daysInPrevMonth - i;
      grid.appendChild(d);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = document.createElement('div');
      d.className = 'calendar-day';
      d.textContent = day;
      d.onclick = () => selectDay(year, month, day);
      grid.appendChild(d);
    }
  }

  function selectDay(year, month, day) {
    selectedDate = new Date(year, month, day);
    generateCalendar();
    showAppointment(year, month, day);
  }

  function showAppointment(year, month, day) {
    const detail = document.getElementById('appointmentDetail');
    if (!detail) return;

    const key = `${year}-${month}-${day}`;
    const appts = appointments[key];

    detail.innerHTML = appts
      ? `<div><strong>${day}</strong> ${appts[0].name} ${appts[0].time}</div>`
      : `<div><strong>${day}</strong> No appointments</div>`;
  }

  // SEARCH (uses GLOBAL data now)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const term = e.target.value.toLowerCase();
      loadAppointments(
        window.appointmentsData.filter(a =>
          a.name.toLowerCase().includes(term) ||
          a.date.includes(term) ||
          a.time.toLowerCase().includes(term) ||
          a.service.toLowerCase().includes(term) ||
          a.status.toLowerCase().includes(term)
        )
      );
    });
  }

  loadAppointments();
  generateCalendar();
}
