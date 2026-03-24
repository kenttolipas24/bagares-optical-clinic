const _OR_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _OR_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _OR_H = { 'apikey': _OR_KEY, 'Authorization': `Bearer ${_OR_KEY}` };

fetch('../components/optometrists/reports.html')
  .then(res => res.text())
  .then(html => { document.getElementById('reports-placeholder').innerHTML = html; initializeReports(); })
  .catch(err => console.error('Failed to load reports HTML:', err));

function initializeReports() {
  window.switchTab = switchTab;
  loadInventoryReport();
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(tabId + '-tab')?.classList.add('active');
      if (tabId === 'inventory')       loadInventoryReport();
      if (tabId === 'sales')           loadSalesReport();
      if (tabId === 'patient-records') loadPatientReport();
      if (tabId === 'condemnation')    loadCondemnationReport();
    });
  });
  initializeLiveSearch();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-button,.tab-content').forEach(el => el.classList.remove('active'));
  const btn = [...document.querySelectorAll('.tab-button')].find(b => b.getAttribute('onclick')?.includes(`'${tabId}'`));
  if (btn) btn.classList.add('active');
  document.getElementById(`${tabId}-tab`)?.classList.add('active');
}

function initializeLiveSearch() {
  document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('input', function() {
      const term = this.value.toLowerCase();
      this.closest('.tab-content')?.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  });
}

async function loadInventoryReport() {
  const tbody = document.querySelector('#inventory-tab tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Loading inventory...</td></tr>';
  try {
    const res = await fetch(`${_OR_URL}/rest/v1/inventory?select=*&order=product_name.asc`, { headers: _OR_H });
    const data = await res.json();
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No products found</td></tr>'; return; }
    tbody.innerHTML = data.map(item => {
      const stock = parseInt(item.stock ?? 0);
      const total = parseFloat(item.price || 0) * stock;
      const status = stock > 10 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock';
      return `<tr>
        <td>${item.product_name||'—'}</td><td>${item.sku||'—'}</td><td>${item.category||'—'}</td>
        <td class="text-center">${stock}</td><td>${formatORCurrency(item.price)}</td>
        <td>${formatORCurrency(total)}</td>
        <td><span class="status-badge ${status.toLowerCase().replace(' ','-')}">${status}</span></td>
      </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Error loading inventory</td></tr>';
  }
}

async function loadSalesReport() {
  const tbody = document.querySelector('#sales-tab tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Loading sales...</td></tr>';
  try {
    const res = await fetch(`${_OR_URL}/rest/v1/sales?select=*,sale_items(quantity,inventory(product_name)),patient_records(firstname,lastname)&order=created_at.desc`, { headers: _OR_H });
    const data = await res.json();
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No sales records found</td></tr>'; return; }
    tbody.innerHTML = data.map(sale => {
      const patientName = sale.patient_records ? `${sale.patient_records.firstname} ${sale.patient_records.lastname}` : '—';
      const products = (sale.sale_items || []).map(si => si.inventory?.product_name || '—').join(', ');
      const totalQty = (sale.sale_items || []).reduce((sum, si) => sum + parseInt(si.quantity || 0), 0);
      return `<tr>
        <td>${sale.id}</td>
        <td>${sale.created_at ? new Date(sale.created_at).toLocaleDateString('en-PH') : '—'}</td>
        <td>${patientName}</td>
        <td class="text-center">${totalQty}</td>
        <td>${products}</td>
        <td>${formatORCurrency(sale.total_amount)}</td>
        <td>${sale.payment_status || '—'}</td>
      </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Error loading sales</td></tr>';
  }
}

async function loadPatientReport() {
  const tbody = document.querySelector('#patient-records-tab tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Loading patient records...</td></tr>';
  try {
    const [patRes, examRes] = await Promise.all([
      fetch(`${_OR_URL}/rest/v1/patient_records?select=*&order=created_at.desc`, { headers: _OR_H }),
      fetch(`${_OR_URL}/rest/v1/eye_exams?select=*&order=exam_date.desc`, { headers: _OR_H })
    ]);
    const patients = await patRes.json();
    const exams    = await examRes.json();
    const examMap  = {};
    exams.forEach(e => { if (!examMap[e.patient_id]) examMap[e.patient_id] = e; });

    tbody.innerHTML = patients.map(p => {
      const name = `${p.firstname} ${p.middlename || ''} ${p.lastname}`.trim();
      const exam = examMap[p.id];
      const examDate = exam ? new Date(exam.exam_date).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }) : 'No exam';
      return `<tr>
        <td>${name}</td><td>${p.address||'—'}</td><td>${examDate}</td>
        <td>${exam?.od_add||'—'}</td><td>${exam?.pd||'—'}</td>
        <td>${p.birthdate ? new Date().getFullYear() - new Date(p.birthdate).getFullYear() : '—'}</td>
        <td><button class="btn-icon" onclick="alert('Patient #${p.id}')">⋮</button></td>
      </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load patient records</td></tr>';
  }
}

async function loadCondemnationReport() {
  const tbody = document.querySelector('#condemnation-tab tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4">Loading condemnation records...</td></tr>';
  try {
    const res = await fetch(`${_OR_URL}/rest/v1/condemnations?select=*,inventory(product_name,sku,category)&order=created_at.desc`, { headers: _OR_H });
    const data = await res.json();
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4">No condemned items found</td></tr>'; return; }
    tbody.innerHTML = data.map(item => `<tr>
      <td>${item.condemned_date ? new Date(item.condemned_date).toLocaleDateString('en-PH') : '—'}</td>
      <td>${item.inventory?.product_name||'—'}</td><td>${item.inventory?.sku||'—'}</td>
      <td>${item.inventory?.category||'—'}</td><td class="text-center">${item.quantity||0}</td>
      <td>${formatORCurrency(item.unit_price)}</td><td>${formatORCurrency(item.total_loss)}</td>
      <td>${item.reason||'—'}</td><td>${item.condemned_by||'—'}</td><td>${item.notes||'—'}</td>
    </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4 text-danger">Failed to load condemnation report</td></tr>';
  }
}

function formatORCurrency(value) {
  if (value == null) return '₱ 0.00';
  return '₱ ' + Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}