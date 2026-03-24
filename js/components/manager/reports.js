const _RP_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _RP_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _RP_H = { 'apikey': _RP_KEY, 'Authorization': `Bearer ${_RP_KEY}` };

let allReportLogs = [];

fetch('../components/manager/reports.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('reports-placeholder').innerHTML = data;
    initializeReports();
  })
  .catch(error => console.error('Error loading reports:', error));

function initializeReports() {
  setDefaultDate();
  updateReportDate();
  attachFilterListeners();
  fetchReportData();
}

async function fetchReportData() {
  try {
    const res = await fetch(
      `${_RP_URL}/rest/v1/stock_logs?select=*,inventory(product_name,category,stock_quantity)&order=created_at.desc`,
      { headers: _RP_H }
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    allReportLogs = data.map(log => ({
      product_name:      log.inventory?.product_name || 'Unknown',
      category:          log.inventory?.category || 'N/A',
      current_inventory: log.inventory?.stock_quantity ?? 0,
      trans_type:        log.type || 'Stock Out',
      trans_date:        log.created_at?.split('T')[0] || '—',
      quantity:          Math.abs(log.quantity || 0),
      reason:            log.reason || '—',
      processed_by:      log.processed_by || 'Staff'
    }));
    renderReportTable(allReportLogs);
  } catch (err) {
    console.error('Failed to load reports:', err);
    renderReportTable([]);
  }
}

function renderReportTable(logs) {
  const tbody = document.getElementById('reportTableBody');
  if (!tbody) return;
  if (!logs.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">No logs found.</td></tr>';
    updateFooterCount(0, allReportLogs.length);
    return;
  }
  tbody.innerHTML = logs.map(log => {
    const qtyClass = log.trans_type === 'Stock In' ? 'qty-positive' : 'qty-negative';
    const symbol   = log.trans_type === 'Stock In' ? '+' : '-';
    return `
      <tr>
        <td><strong>${log.product_name}</strong></td>
        <td><span class="category-badge ${(log.category || '').toLowerCase()}">${log.category}</span></td>
        <td>${log.current_inventory}</td>
        <td><span class="status-badge ${(log.trans_type || '').toLowerCase().replace(' ', '-')}">${log.trans_type}</span></td>
        <td>${log.trans_date}</td>
        <td><span class="${qtyClass}">${symbol}${log.quantity}</span></td>
        <td>
          <div class="user-cell">
            <span class="reason-text" style="display:block;font-size:0.85rem;">${log.reason}</span>
            <span class="processed-by" style="display:block;font-size:0.75rem;color:#9ca3af;">${log.processed_by}</span>
          </div>
        </td>
      </tr>`;
  }).join('');
  updateFooterCount(logs.length, allReportLogs.length);
}

function attachFilterListeners() {
  document.getElementById('reportSearch')?.addEventListener('input', filterReportTable);
  document.getElementById('inventoryCategory')?.addEventListener('change', filterReportTable);
  document.getElementById('inventoryStock')?.addEventListener('change', filterReportTable);
  document.getElementById('inventoryDate')?.addEventListener('change', filterReportTable);
}

function filterReportTable() {
  const search   = (document.getElementById('reportSearch')?.value || '').toLowerCase();
  const category = document.getElementById('inventoryCategory')?.value || 'all';
  const stock    = document.getElementById('inventoryStock')?.value || 'all';
  const date     = document.getElementById('inventoryDate')?.value || '';
  const filtered = allReportLogs.filter(log => {
    const matchesSearch   = log.product_name.toLowerCase().includes(search);
    const matchesCategory = category === 'all' || (log.category || '').toLowerCase() === category;
    const matchesStock    = stock === 'all' || getStockStatus(log.current_inventory).class === stock;
    const matchesDate     = !date || log.trans_date.startsWith(date);
    return matchesSearch && matchesCategory && matchesStock && matchesDate;
  });
  renderReportTable(filtered);
}

function getStockStatus(stock) {
  if (stock > 10) return { class: 'in-stock' };
  if (stock > 0)  return { class: 'low-stock' };
  return { class: 'out-of-stock' };
}

function setDefaultDate() {
  const dateInput = document.getElementById('inventoryDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

function updateReportDate() {
  const el = document.getElementById('reportDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function updateFooterCount(visible, total) {
  const el = document.getElementById('entryCount');
  if (el) el.innerHTML = `Showing <strong>${visible}</strong> of <strong>${total}</strong> entries`;
}