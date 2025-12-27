// Sample Data
const appointments = [
  { id: 1, name: 'Rechelle P. Aldea', date: '01/01/2025', time: '10:00 AM', service: 'Consultation', status: 'Confirmed', age: 28, contact: '0912 345 6789' },
  { id: 2, name: 'Juan Dela Cruz', date: '01/01/2025', time: '02:00 PM', service: 'Check-up', status: 'Pending', age: 45, contact: '0923 456 7890' },
  { id: 3, name: 'Maria Santos', date: '12/26/2025', time: '03:30 PM', service: 'Follow-up', status: 'Confirmed', age: 32, contact: '0934 567 8901' },
];

const patients = [
  { id: 'P-001', name: 'Rechelle P. Aldea', age: 28, contact: '0912 345 6789', lastVisit: '12/20/2025' },
  { id: 'P-002', name: 'Juan Dela Cruz', age: 45, contact: '0923 456 7890', lastVisit: '12/15/2025' },
  { id: 'P-003', name: 'Maria Santos', age: 32, contact: '0934 567 8901', lastVisit: '12/10/2025' },
];

const patientHistory = [
  { date: '2024-06-15', od: '+0.50 -0.25 x 180', os: '+0.75 -0.50 x 175', notes: 'Mild myopia, prescribed reading glasses' },
  { date: '2023-12-10', od: '+0.25 -0.25 x 180', os: '+0.50 -0.25 x 180', notes: 'Regular checkup, no changes needed' },
];

const reportsData = [
  { date: '12/27/2025', patient: 'Rechelle P. Aldea', diagnosis: 'Myopia', prescription: 'OD: +0.50 -0.25 x 180' },
  { date: '12/26/2025', patient: 'Juan Dela Cruz', diagnosis: 'Hyperopia', prescription: 'OD: -1.00 -0.50 x 90' },
  { date: '12/25/2025', patient: 'Maria Santos', diagnosis: 'Astigmatism', prescription: 'OD: +0.25 -0.75 x 180' },
];

let currentPatient = null;
let selectedAppointmentRow = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadAppointments();
  loadPatients();
  loadReports();
  generateCalendar();
  setDefaultDates();
});

// Load appointments into table
function loadAppointments() {
  const tbody = document.getElementById('appointmentsTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  appointments.forEach((appointment, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${appointment.name}</strong></td>
      <td>${appointment.date}</td>
      <td>${appointment.time}</td>
      <td>${appointment.service}</td>
      <td><span class="status-badge status-${appointment.status.toLowerCase()}">${appointment.status}</span></td>
    `;
    
    row.addEventListener('click', function() {
      selectAppointmentRow(row, idx);
    });
    
    row.addEventListener('dblclick', function() {
      startExamination(appointment);
    });
    
    tbody.appendChild(row);
  });
  
  // Auto-select first appointment
  if (appointments.length > 0) {
    tbody.querySelector('tr')?.click();
  }
}

// Select appointment row
function selectAppointmentRow(row, idx) {
  if (selectedAppointmentRow) {
    selectedAppointmentRow.classList.remove('selected');
  }
  row.classList.add('selected');
  selectedAppointmentRow = row;
  
  const appointment = appointments[idx];
  currentPatient = appointment;
  
  // Update appointment detail
  const date = appointment.date.split('/')[1] || '27';
  document.getElementById('detailDate').textContent = date;
  document.getElementById('detailName').textContent = appointment.name;
  document.getElementById('detailTime').textContent = appointment.time.split(' ')[0];
}

// Load patients
function loadPatients() {
  const tbody = document.getElementById('patientsTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  patients.forEach((patient, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${patient.id}</strong></td>
      <td><strong>${patient.name}</strong></td>
      <td>${patient.age}</td>
      <td>${patient.contact}</td>
      <td>${patient.lastVisit}</td>
      <td>
        <button class="action-btn" onclick="event.stopPropagation(); viewPatientDetail(${idx})">View</button>
        <button class="action-btn" onclick="event.stopPropagation(); examinePatient(${idx})">Examine</button>
      </td>
    `;
    
    row.addEventListener('click', function() {
      viewPatientDetail(idx);
    });
    
    tbody.appendChild(row);
  });
}

// Load reports
function loadReports() {
  const tbody = document.querySelector('#reportsTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  reportsData.forEach((report, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${report.date}</td>
      <td><strong>${report.patient}</strong></td>
      <td>${report.diagnosis}</td>
      <td>${report.prescription}</td>
      <td><button class="action-btn" onclick="viewReport(${idx})">View Details</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Generate calendar
function generateCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  
  const calendarDays = document.getElementById('calendarDays');
  if (!calendarDays) return;
  
  calendarDays.innerHTML = '';
  
  // Previous month empty cells
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day other-month';
    calendarDays.appendChild(emptyDay);
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;
    
    if (day === today) {
      dayEl.classList.add('today');
    }
    
    // Mark days with appointments
    if (day === 2 || day === 26) {
      dayEl.classList.add('has-appointment');
    }
    
    calendarDays.appendChild(dayEl);
  }
}

// Set default dates
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split('T')[0];
  
  const examDateField = document.getElementById('examDate');
  if (examDateField) examDateField.value = today;
  
  const filterDateFrom = document.getElementById('filterDateFrom');
  if (filterDateFrom) filterDateFrom.value = '2025-01-01';
  
  const filterDateTo = document.getElementById('filterDateTo');
  if (filterDateTo) filterDateTo.value = today;
}

// Show view
function showView(view) {
  document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  
  if (view === 'dashboard') {
    document.getElementById('dashboard-view').style.display = 'flex';
  } else if (view === 'prescription') {
    document.getElementById('prescription-view').style.display = 'flex';
  } else if (view === 'patients') {
    document.getElementById('patients-view').style.display = 'flex';
  } else if (view === 'reports') {
    document.getElementById('reports-view').style.display = 'flex';
  }
}

// Start examination
function startExamination(appointment) {
  if (!currentPatient) {
    alert('Please select an appointment first');
    return;
  }
  
  // Populate patient info
  document.getElementById('patientName').value = currentPatient.name;
  document.getElementById('patientAge').value = currentPatient.age;
  document.getElementById('patientContact').value = currentPatient.contact;
  
  showView('prescription');
}

// Examine patient from patient records
function examinePatient(idx) {
  const patient = patients[idx];
  currentPatient = {
    name: patient.name,
    age: patient.age,
    contact: patient.contact
  };
  
  document.getElementById('patientName').value = patient.name;
  document.getElementById('patientAge').value = patient.age;
  document.getElementById('patientContact').value = patient.contact;
  
  showView('prescription');
}

// View patient detail
function viewPatientDetail(idx) {
  const patient = patients[idx];
  
  document.getElementById('modalPatientId').textContent = patient.id;
  document.getElementById('modalPatientName').textContent = patient.name;
  document.getElementById('modalPatientAge').textContent = patient.age + ' years old';
  document.getElementById('modalPatientContact').textContent = patient.contact;
  document.getElementById('modalPatientLastVisit').textContent = patient.lastVisit;
  
  document.getElementById('patientDetailModal').classList.add('active');
}

// Close patient detail
function closePatientDetail() {
  document.getElementById('patientDetailModal').classList.remove('active');
}

// Show history modal
function showHistory() {
  if (!currentPatient) {
    alert('Please select a patient first');
    return;
  }
  
  document.getElementById('historyPatientName').textContent = currentPatient.name;
  
  const historyContainer = document.getElementById('historyRecords');
  historyContainer.innerHTML = '';
  
  patientHistory.forEach(record => {
    const recordDiv = document.createElement('div');
    recordDiv.className = 'history-record';
    recordDiv.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 0.5rem;">${record.date}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
        <div><strong>OD:</strong> ${record.od}</div>
        <div><strong>OS:</strong> ${record.os}</div>
      </div>
      <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #718096;">
        ${record.notes}
      </div>
    `;
    historyContainer.appendChild(recordDiv);
  });
  
  document.getElementById('historyModal').classList.add('active');
}

// Close history modal
function closeHistory() {
  document.getElementById('historyModal').classList.remove('active');
}

// Save examination
function saveExam() {
  if (!currentPatient) {
    alert('No patient selected');
    return;
  }
  
  const examData = {
    patient: currentPatient.name,
    date: document.getElementById('examDate').value,
    refraction: {
      od: {
        sphere: document.getElementById('od_sphere').value,
        cylinder: document.getElementById('od_cylinder').value,
        axis: document.getElementById('od_axis').value,
        add: document.getElementById('od_add').value
      },
      os: {
        sphere: document.getElementById('os_sphere').value,
        cylinder: document.getElementById('os_cylinder').value,
        axis: document.getElementById('os_axis').value,
        add: document.getElementById('os_add').value
      },
      pd: document.getElementById('pd').value
    },
    visualAcuity: {
      distance: {
        od: document.getElementById('va_distance_od').value,
        os: document.getElementById('va_distance_os').value
      },
      near: {
        od: document.getElementById('va_near_od').value,
        os: document.getElementById('va_near_os').value
      }
    },
    clinicalFindings: document.getElementById('clinicalFindings').value,
    lensRecommendation: {
      type: document.getElementById('lensType').value,
      material: document.getElementById('material').value,
      coatings: {
        antiReflective: document.getElementById('coating_ar').checked,
        blueLight: document.getElementById('coating_blue').checked,
        photochromic: document.getElementById('coating_photo').checked
      }
    }
  };
  
  console.log('Saving examination:', examData);
  
  const summary = `Examination Record Saved Successfully!

Patient: ${currentPatient.name}
Date: ${examData.date}

Refraction:
OD: ${examData.refraction.od.sphere} ${examData.refraction.od.cylinder} x ${examData.refraction.od.axis}
OS: ${examData.refraction.os.sphere} ${examData.refraction.os.cylinder} x ${examData.refraction.os.axis}
PD: ${examData.refraction.pd}

Visual Acuity:
Distance - OD: ${examData.visualAcuity.distance.od}, OS: ${examData.visualAcuity.distance.os}
Near - OD: ${examData.visualAcuity.near.od}, OS: ${examData.visualAcuity.near.os}

Record has been saved to the database.`;
  
  alert(summary);
  showView('dashboard');
}

// Generate report
function generateReport() {
  if (!currentPatient) {
    alert('Please select a patient first');
    return;
  }
  
  const reportSummary = `Generating Patient Examination Report...

Patient: ${currentPatient.name}
Report Type: Eye Examination & Prescription

Report will include:
✓ Patient Information
✓ Refraction Results (OD & OS)
✓ Visual Acuity Assessment
✓ Clinical Findings
✓ Lens Recommendations
✓ Optometrist Signature

Format: PDF
Status: Preparing download...

The report will be downloaded shortly.`;
  
  alert(reportSummary);
  console.log('Generating PDF report for:', currentPatient.name);
}

// Switch report tab
function switchReportTab(tab, element) {
  document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
  element.classList.add('active');
  alert(`Switched to ${tab} reports`);
}

// Apply filters
function applyFilters() {
  alert('Filters applied! Report data refreshed.');
}

// Export report
function exportReport() {
  alert('Exporting report to PDF...\n\nDownload will start shortly.');
}

// View report
function viewReport(idx) {
  const report = reportsData[idx];
  alert(`Viewing detailed report for ${report.patient}\n\nDate: ${report.date}\nDiagnosis: ${report.diagnosis}\nPrescription: ${report.prescription}`);
}

// Search functionality
document.getElementById('searchAppointments')?.addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#appointmentsTable tr');
  
  rows.forEach(row => {
    const name = row.cells[0]?.textContent.toLowerCase() || '';
    row.style.display = name.includes(searchTerm) ? '' : 'none';
  });
});

document.getElementById('searchPatients')?.addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#patientsTable tr');
  
  rows.forEach(row => {
    const name = row.cells[1]?.textContent.toLowerCase() || '';
    row.style.display = name.includes(searchTerm) ? '' : 'none';
  });
});