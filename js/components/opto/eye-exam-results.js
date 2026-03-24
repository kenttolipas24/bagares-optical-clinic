const _ER_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _ER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _ER_H = { 'apikey': _ER_KEY, 'Authorization': `Bearer ${_ER_KEY}` };

fetch('../components/optometrists/eye-exam-results.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('eye-exam-results-placeholder').innerHTML = html;
    initializeExamResults();
  })
  .catch(err => console.error('Failed to load eye exam results HTML:', err));

let allExamResults = [];
let filteredExamResults = [];
let currentExamPage = 1;
const examResultsPerPage = 5;
let currentExamFilter = 'all';
let currentExamSearchTerm = '';

function initializeExamResults() {
  loadExamResults();
  setupExamSearch();
  setupDateFilter();
}

async function loadExamResults(filterDate = 'all', searchTerm = '') {
  const tbody = document.getElementById('examResultsBody');
  if (!tbody) return;

  try {
    const res = await fetch(
      `${_ER_URL}/rest/v1/eye_exams?select=*,patient_records(firstname,middlename,lastname)&order=exam_date.desc`,
      { headers: _ER_H }
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    allExamResults = data.map(e => ({
      ...e,
      firstname:  e.patient_records?.firstname  || '—',
      middlename: e.patient_records?.middlename || '',
      lastname:   e.patient_records?.lastname   || '—',
    }));

    currentExamFilter     = filterDate;
    currentExamSearchTerm = searchTerm.trim();

    filteredExamResults = allExamResults;
    if (filterDate !== 'all') filteredExamResults = filterByDate(filteredExamResults, filterDate);
    if (currentExamSearchTerm) filteredExamResults = filterBySearch(filteredExamResults, currentExamSearchTerm);

    currentExamPage = 1;
    renderExamTable();
    renderExamPagination();

  } catch (err) {
    console.error('Error loading exam results:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#e53e3e;padding:2rem;">Failed to load examination results</td></tr>`;
  }
}

function renderExamTable() {
  const tbody = document.getElementById('examResultsBody');
  if (!tbody) return;
  if (!filteredExamResults.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="exam-empty-row"><div class="exam-empty-content"><p>No examination results found</p></div></td></tr>`;
    return;
  }
  const start = (currentExamPage - 1) * examResultsPerPage;
  const page  = filteredExamResults.slice(start, start + examResultsPerPage);
  tbody.innerHTML = page.map(r => {
    const name = `${r.firstname} ${r.middlename} ${r.lastname}`.trim();
    return `
      <tr>
        <td><div class="exam-patient-name-cell">${name}</div><span class="exam-patient-id-small">ID: #${r.patient_id}</span></td>
        <td class="exam-date-cell">${formatERDate(r.exam_date)}</td>
        <td class="exam-prescription-cell">
          <span class="exam-prescription-line"><span class="exam-rx-label">SPH:</span><span class="exam-rx-value">${r.od_sph||'—'}</span></span>
          <span class="exam-prescription-line"><span class="exam-rx-label">CYL:</span><span class="exam-rx-value">${r.od_cyl||'—'}</span></span>
          <span class="exam-prescription-line"><span class="exam-rx-label">AXIS:</span><span class="exam-rx-value">${r.od_axis||'—'}°</span></span>
          <span class="exam-prescription-line"><span class="exam-rx-label">ADD:</span><span class="exam-rx-value">${r.od_add||'—'}</span></span>
        </td>
        <td class="exam-prescription-cell">
          <span class="exam-prescription-line"><span class="exam-rx-label">SPH:</span><span class="exam-rx-value">${r.os_sph||'—'}</span></span>
          <span class="exam-prescription-line"><span class="exam-rx-label">CYL:</span><span class="exam-rx-value">${r.os_cyl||'—'}</span></span>
          <span class="exam-prescription-line"><span class="exam-rx-label">AXIS:</span><span class="exam-rx-value">${r.os_axis||'—'}°</span></span>
          <span class="exam-prescription-line"><span class="exam-rx-label">ADD:</span><span class="exam-rx-value">${r.os_add||'—'}</span></span>
        </td>
        <td class="exam-value-cell">${r.pd||'—'} mm</td>
        <td class="exam-value-cell">${r.lens_type||'—'}</td>
      </tr>`;
  }).join('');
}

function renderExamPagination() {
  const total = Math.ceil(filteredExamResults.length / examResultsPerPage);
  const start = (currentExamPage - 1) * examResultsPerPage + 1;
  const end   = Math.min(currentExamPage * examResultsPerPage, filteredExamResults.length);
  const info  = document.getElementById('paginationInfo');
  if (info) info.textContent = `Showing ${start} to ${end} of ${filteredExamResults.length} results`;
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  if (prev) prev.disabled = currentExamPage === 1;
  if (next) next.disabled = currentExamPage === total || total === 0;
  const nums = document.getElementById('pageNumbers');
  if (!nums) return;
  nums.innerHTML = '';
  if (total <= 1) return;
  for (let i = Math.max(1, currentExamPage-2); i <= Math.min(total, currentExamPage+2); i++) {
    const btn = document.createElement('button');
    btn.className = `exam-page-number${i === currentExamPage ? ' active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => { currentExamPage = i; renderExamTable(); renderExamPagination(); };
    nums.appendChild(btn);
  }
}

window.previousPage = function() { if (currentExamPage > 1) { currentExamPage--; renderExamTable(); renderExamPagination(); } };
window.nextPage = function() {
  const total = Math.ceil(filteredExamResults.length / examResultsPerPage);
  if (currentExamPage < total) { currentExamPage++; renderExamTable(); renderExamPagination(); }
};

function setupExamSearch() {
  const input = document.querySelector('.exam-search-input');
  if (!input) return;
  let timer;
  input.addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => loadExamResults(currentExamFilter, e.target.value), 300);
  });
}

function setupDateFilter() {
  const f = document.getElementById('dateFilter');
  if (f) f.addEventListener('change', e => loadExamResults(e.target.value, currentExamSearchTerm));
}

function filterByDate(results, filter) {
  const today = new Date(); today.setHours(0,0,0,0);
  return results.filter(r => {
    const d = new Date(r.exam_date);
    if (filter === 'today') return d.toDateString() === today.toDateString();
    const ago = new Date(today);
    if (filter === 'week')  { ago.setDate(ago.getDate()-7);         return d >= ago; }
    if (filter === 'month') { ago.setMonth(ago.getMonth()-1);       return d >= ago; }
    if (filter === 'year')  { ago.setFullYear(ago.getFullYear()-1); return d >= ago; }
    return true;
  });
}

function filterBySearch(results, term) {
  const t = term.toLowerCase();
  return results.filter(r => `${r.firstname} ${r.middlename} ${r.lastname}`.toLowerCase().includes(t) || `#${r.patient_id}`.includes(t));
}

function formatERDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

window.loadExamResults = loadExamResults;