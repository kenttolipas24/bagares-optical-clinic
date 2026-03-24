// // ===============================
// // LOAD PATIENT RECORD HTML (ONCE)
// // ===============================
// fetch('../components/optometrists/patient record.html')
//   .then(res => res.text())
//   .then(html => {
//     document.getElementById('patient-record-placeholder').innerHTML = html;
//     initializePatientRecords();
//   })
//   .catch(err => console.error('Failed to load patient record HTML:', err));


// // ==================================
// // PATIENT RECORD LOGIC (DATA ONLY)
// // ==================================
// function initializePatientRecords() {
//   const tbody = document.getElementById('patientTable');
//   const searchInput = document.getElementById('searchPatient');

//   let patients = [];

//   // 🔹 INITIAL LOAD
//   fetchPatientRecords();

//   // =====================
//   // FETCH FROM DATABASE
//   // =====================
//   function fetchPatientRecords() {
//     fetch('../api/get_patient_records.php')
//       .then(res => res.json())
//       .then(data => {
//         console.log('✅ Patient records loaded:', data);
//         patients = data;
//         renderTable();
//       })
//       .catch(err => {
//         console.error('❌ Failed to fetch patient records:', err);
//         tbody.innerHTML = `
//           <tr>
//             <td colspan="7" style="text-align:center;color:#ef4444;padding:20px">
//               Error loading patient records. Please refresh.
//             </td>
//           </tr>`;
//       });
//   }

//   // =====================
//   // RENDER TABLE
//   // =====================
//   function renderTable() {
//     tbody.innerHTML = '';

//     if (!patients || patients.length === 0) {
//       const row = tbody.insertRow();
//       const cell = row.insertCell(0);
//       cell.colSpan = 7;
//       cell.textContent = 'No patient records found.';
//       cell.style.textAlign = 'center';
//       cell.style.padding = '20px';
//       cell.style.color = '#999';
//       return;
//     }

//     patients.forEach(p => {
//       const row = tbody.insertRow();

//       // Build patient name
//       const fullName = `${p.firstname} ${p.middlename || ''} ${p.lastname} ${p.suffix || ''}`.trim();

//       row.insertCell(0).textContent = fullName;
//       row.insertCell(1).textContent = p.exam_date || 'N/A';
//       row.insertCell(2).textContent = `${p.od_sph || '—'} / ${p.od_cyl || '—'} / ${p.od_axis || '—'}`;
//       row.insertCell(3).textContent = `${p.os_sph || '—'} / ${p.os_cyl || '—'} / ${p.os_axis || '—'}`;
//       row.insertCell(4).textContent = p.od_add || '-';
//       row.insertCell(5).textContent = p.pd || '-';

//       const actionCell = row.insertCell(6);
//       actionCell.innerHTML = '<button class="actions-btn">⋯</button>';
//     });
//   }

//   // =====================
//   // LIVE SEARCH (NO RELOAD)
//   // =====================
//   if (searchInput) {
//     searchInput.addEventListener('input', e => {
//       const query = e.target.value.toLowerCase();
//       const rows = tbody.querySelectorAll('tr');

//       rows.forEach(row => {
//         const name = row.cells[0]?.textContent.toLowerCase() || '';
//         row.style.display = name.includes(query) ? '' : 'none';
//       });
//     });
//   }
// }




const _PR_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _PR_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _PR_H = { 'apikey': _PR_KEY, 'Authorization': `Bearer ${_PR_KEY}` };

fetch('../components/optometrists/patient record.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('patient-record-placeholder').innerHTML = html;
    initializePatientTable();
  })
  .catch(err => console.error('Failed to load patient record HTML:', err));

function initializePatientTable() {
  setTimeout(() => { updatePatientTable('no-exam'); setupSearch(); }, 100);
}

window.toggleFilterDropdown = function(event) {
  event.stopPropagation();
  document.getElementById('filterDropdown')?.classList.toggle('show');
  document.querySelector('.filter-dropdown-container')?.classList.toggle('active');
};

document.addEventListener('click', function(event) {
  if (!event.target.closest('.filter-dropdown-container')) {
    document.getElementById('filterDropdown')?.classList.remove('show');
    document.querySelector('.filter-dropdown-container')?.classList.remove('active');
  }
});

let currentFilter = 'no-exam';

window.selectFilter = function(filterType, filterText, event) {
  event.stopPropagation();
  currentFilter = filterType;
  document.getElementById('current-filter-text').textContent = filterText;
  document.querySelectorAll('.filter-dropdown-item').forEach(i => i.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById('filterDropdown')?.classList.remove('show');
  document.querySelector('.filter-dropdown-container')?.classList.remove('active');
  updatePatientTable(filterType);
};

function setupSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;
  searchInput.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.patient-table tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

function calculateAge(birthdate) {
  if (!birthdate) return 'N/A';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDatePR(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString();
}

window.updatePatientTable = async function(filter = 'no-exam') {
  const tbody = document.querySelector('.patient-table tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:3rem;color:#a0aec0;">Loading records...</td></tr>`;

  try {
    // Fetch patients with their latest eye exam
    const patRes = await fetch(
      `${_PR_URL}/rest/v1/patient_records?select=*&order=created_at.desc`,
      { headers: _PR_H }
    );
    if (!patRes.ok) throw new Error(await patRes.text());
    let records = await patRes.json();

    // Fetch all eye exams
    const examRes = await fetch(
      `${_PR_URL}/rest/v1/eye_exams?select=*&order=exam_date.desc`,
      { headers: _PR_H }
    );
    const exams = examRes.ok ? await examRes.json() : [];

    // Map latest exam per patient
    const examMap = {};
    exams.forEach(e => {
      if (!examMap[e.patient_id]) examMap[e.patient_id] = e;
    });

    // Apply filter
    if (filter === 'no-exam') {
      records = records.filter(r => !examMap[r.id]);
    } else if (filter === 'with-exam') {
      records = records.filter(r => !!examMap[r.id]);
    }

    tbody.innerHTML = '';
    if (!records.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:3rem;color:#a0aec0;">No patient records found</td></tr>`;
      return;
    }

    records.forEach(r => {
      const fullName = `${r.firstname} ${r.middlename || ''} ${r.lastname} ${r.suffix || ''}`.trim();
      const age = calculateAge(r.birthdate);
      const exam = examMap[r.id];

      const patientTypeBadge = r.patient_type === 'online'
        ? '<span class="patient-type-badge badge-online">Online</span>'
        : '<span class="patient-type-badge badge-walk-in">Walk-in</span>';

      const prescriptionHTML = exam ? `
        <div class="prescription-container">
          <div><span class="prescription-label">OD</span> ${exam.od_sph || '—'} / ${exam.od_cyl || '—'} <small>x</small>${exam.od_axis || '—'}</div>
          <div><span class="prescription-label">OS</span> ${exam.os_sph || '—'} / ${exam.os_cyl || '—'} <small>x</small>${exam.os_axis || '—'}</div>
        </div>` : '<span class="patient-type-badge badge-no-exam">No Exam Yet</span>';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div style="font-weight:600;color:#1a202c;">${fullName}</div>
          <div style="font-size:0.75rem;color:#a0aec0;">ID: #${r.id}</div>
        </td>
        <td>${patientTypeBadge}</td>
        <td style="color:#718096;max-width:200px;">${r.address || '—'}</td>
        <td>${age} <span style="font-size:0.7rem;color:#cbd5e0;">YRS</span></td>
        <td>${prescriptionHTML}</td>
        <td style="color:#718096;font-size:0.8rem;">${formatDatePR(exam?.exam_date)}</td>
        <td>
          <button class="action-btn" onclick="openAppointmentActionModal(event, ${r.id})">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </td>`;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error('Error loading patient records:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:3rem;color:#e53e3e;">Unable to load patient data.</td></tr>`;
  }
};
