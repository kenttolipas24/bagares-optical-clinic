// Load the appointment HTML content first
fetch('../components/modals/optometrist/appmnt.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('Cal&Det-placeholder').innerHTML = data;
    
    // Initialize everything AFTER the HTML is loaded
    initializeAppointment();
  })
  .catch(error => {
    console.error('Error loading appointment content:', error);
  });

// Function to initialize all appointment functionality
function initializeAppointment() {
  // Appointment Calendar and Details Logic
  let currentDate = new Date();
  let selectedDate = null;

  // Sample appointments data
  const appointments = {
    '2025-0-1': [{name: 'Rechelle P. Aldea', time: '10:00 AM', service: 'Consultation'}],
    '2024-10-22': [{name: 'John Doe', time: '2:00 PM', service: 'Check-up'}]
  };

  function generateCalendar() {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarTitle');
    
    if (!grid || !title) {
      console.error('Calendar elements not found');
      return;
    }
    
    grid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    title.textContent = `${year} ${monthNames[month]}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day other-month';
      dayDiv.textContent = daysInPrevMonth - i;
      grid.appendChild(dayDiv);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      dayDiv.textContent = day;
      
      // Highlight today
      if (isCurrentMonth && day === today.getDate()) {
        dayDiv.classList.add('today');
      }
      
      // Check if selected
      if (selectedDate && 
          selectedDate.getFullYear() === year && 
          selectedDate.getMonth() === month && 
          selectedDate.getDate() === day) {
        dayDiv.classList.add('selected');
      }
      
      dayDiv.onclick = () => selectDay(year, month, day);
      grid.appendChild(dayDiv);
    }

    // Next month days
    const totalCells = grid.children.length;
    const remainingCells = 35 - totalCells; // 5 weeks
    for (let day = 1; day <= remainingCells; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day other-month';
      dayDiv.textContent = day;
      grid.appendChild(dayDiv);
    }
  }

  function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar();
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

    if (appts && appts.length > 0) {
      const appt = appts[0];
      detail.innerHTML = `
        <div class="appointment-detail-header">
          <strong>${day}</strong>
          <span>${appt.name}</span>
          <span>${appt.time}</span>
        </div>
      `;
    } else {
      detail.innerHTML = `
        <div class="appointment-detail-header">
          <strong>${day}</strong>
          <span>No appointments</span>
        </div>
      `;
    }
  }

  function addAppointment() {
    alert('Add Appointment functionality would open a modal or form here');
  }

  // Make functions available globally for HTML onclick handlers
  window.changeMonth = changeMonth;
  window.addAppointment = addAppointment;

  // Add event listener for appointment button
  const appmntBtn = document.getElementById('appmnt-btn');
  if (appmntBtn) {
    appmntBtn.addEventListener('click', addAppointment);
  }

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#appointmentTable tr');
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    });
  }

  // Initialize calendar
  generateCalendar();
}