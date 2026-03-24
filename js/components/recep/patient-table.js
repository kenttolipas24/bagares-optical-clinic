const SUPA_URL_PT = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const SUPA_KEY_PT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';

fetch('../components/receptionist/patient-table.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('patient-placeholder').innerHTML = html;
    initializePatientTable();
  })
  .catch(err => console.error('Error loading patient table:', err));

function initializePatientTable() {
  setTimeout(() => {
    updatePatientTable();
    setupSearch();
    if (typeof setupDropdownListeners === 'function') {
      setupDropdownListeners();
    }
  }, 100);
}

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

window.updatePatientTable = async function() {
    const tbody = document.querySelector('.patient-table tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:#a0aec0;">Loading records...</td></tr>`;

    try {
        const res = await fetch(
            `${SUPA_URL_PT}/rest/v1/patient_records?order=created_at.desc`,
            { headers: { 'apikey': SUPA_KEY_PT, 'Authorization': `Bearer ${SUPA_KEY_PT}` } }
        );

        if (!res.ok) throw new Error(await res.text());
        const records = await res.json();

        if (!records.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:#718096;">No patient records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        records.forEach(r => {
            const fullName = `${r.firstname} ${r.middlename || ''} ${r.lastname} ${r.suffix || ''}`.trim();
            const age = calculateAge(r.birthdate);
            const prescriptionHTML = `
                <div class="prescription-container">
                    <div><span class="prescription-label">OD</span> ${r.od_sph || '—'} / ${r.od_cyl || '—'} <small>x</small>${r.od_axis || '—'}</div>
                    <div><span class="prescription-label">OS</span> ${r.os_sph || '—'} / ${r.os_cyl || '—'} <small>x</small>${r.os_axis || '—'}</div>
                </div>`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="font-weight:600;color:#1a202c;">${fullName}</div>
                    <div style="font-size:0.75rem;color:#a0aec0;">ID: #${r.id}</div>
                </td>
                <td style="color:#718096;max-width:200px;">${r.address || '—'}</td>
                <td>${age} <span style="font-size:0.7rem;color:#cbd5e0;">YRS</span></td>
                <td>${prescriptionHTML}</td>
                <td style="color:#718096;font-size:0.8rem;">${formatDate(r.exam_date)}</td>
                <td>
                    <button class="action-btn" onclick="toggleActionDropdown(event, ${r.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                </td>`;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error('Patient table error:', err);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:#e53e3e;">Unable to sync patient data.</td></tr>`;
    }
};

function calculateAge(birthdate) {
  if (!birthdate) return 'N/A';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString();
}