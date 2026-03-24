const _CD_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _CD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _CD_H = { 'apikey': _CD_KEY, 'Authorization': `Bearer ${_CD_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

let condemnationRecords = [];
let condemnInventoryData = [];
let filteredRecords = [];
let condemnCurrentPage = 1;
const condemnItemsPerPage = 10;
let condemnationInitialized = false;

window.initCondemnation = async function () {
  if (condemnationInitialized) return;
  const holder = document.getElementById('condemnation-placeholder');
  if (!holder) { console.error('condemnation-placeholder not found'); return; }
  try {
    const res = await fetch('../components/manager/condemnation.html');
    const html = await res.text();
    holder.innerHTML = html;
    await new Promise(resolve => setTimeout(resolve, 50));
    await loadCondemnationData();
    await loadCondemnInventoryData();
    setupCondemnModals();
    setupCondemnForm();
    setupCondemnFilters();
    applyCondemnFilters();
    condemnationInitialized = true;
  } catch (err) {
    console.error('Condemnation init error:', err);
  }
};

async function loadCondemnationData() {
  try {
    const res = await fetch(
      `${_CD_URL}/rest/v1/condemnations?select=*,inventory(product_name,sku,category)&order=created_at.desc`,
      { headers: _CD_H }
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    condemnationRecords = data.map(r => ({
      ...r,
      product_name: r.inventory?.product_name || 'Unknown',
      sku:          r.inventory?.sku || 'N/A',
      category:     r.inventory?.category || 'N/A',
    }));
    filteredRecords = [...condemnationRecords];
  } catch (err) {
    console.error('Load condemnations error:', err);
    condemnationRecords = []; filteredRecords = [];
  }
}

async function loadCondemnInventoryData() {
  try {
    const res = await fetch(`${_CD_URL}/rest/v1/inventory?select=*&stock_quantity=gt.0`, { headers: _CD_H });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    condemnInventoryData = data.filter(item => parseInt(item.stock_quantity ?? 0) > 0);
  } catch (err) {
    console.error('Load inventory error:', err);
    condemnInventoryData = [];
  }
}

function setupCondemnModals() {
  const condemnModal = document.getElementById('condemnationModal');
  const productModal = document.getElementById('productSelectionModal');
  if (!condemnModal || !productModal) return;

  document.getElementById('btnOpenCondemnModal')?.addEventListener('click', e => {
    e.preventDefault(); resetCondemnForm();
    condemnModal.classList.add('show'); document.body.style.overflow = 'hidden';
  });
  document.getElementById('closeCondemnModal')?.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation(); closeCondemnModal();
  });
  document.getElementById('btnCancelCondemn')?.addEventListener('click', e => {
    e.preventDefault(); closeCondemnModal();
  });
  condemnModal.addEventListener('click', e => { if (e.target === condemnModal) closeCondemnModal(); });

  document.getElementById('productDropdownBtn')?.addEventListener('click', e => {
    e.preventDefault(); productModal.classList.add('show');
    renderProductList();
    const s = document.getElementById('productSearch');
    if (s) { s.value = ''; s.focus(); }
  });
  document.getElementById('closeProductModal')?.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation(); productModal.classList.remove('show');
  });
  productModal.addEventListener('click', e => { if (e.target === productModal) productModal.classList.remove('show'); });
  document.getElementById('productSearch')?.addEventListener('input', e => renderProductList(e.target.value.toLowerCase()));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (productModal.classList.contains('show')) productModal.classList.remove('show');
      else if (condemnModal.classList.contains('show')) closeCondemnModal();
    }
  });
}

function closeCondemnModal() {
  const modal = document.getElementById('condemnationModal');
  if (modal) { modal.classList.remove('show'); document.body.style.overflow = ''; }
}

function setupCondemnForm() {
  document.getElementById('condemnQuantity')?.addEventListener('input', calculateLoss);
  document.getElementById('condemnationForm')?.addEventListener('submit', async e => {
    e.preventDefault(); await submitCondemnation();
  });
}

function calculateLoss() {
  const productId = document.getElementById('selectedProductId')?.value;
  const qty = parseInt(document.getElementById('condemnQuantity')?.value) || 0;
  const lossEl = document.getElementById('estimatedLoss');
  if (!lossEl) return;
  if (!productId || !qty) { lossEl.textContent = '₱0.00'; return; }
  const product = condemnInventoryData.find(p => p.id == productId);
  if (!product) { lossEl.textContent = '₱0.00'; return; }
  const loss = parseFloat(product.price) * qty;
  lossEl.textContent = '₱' + loss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function submitCondemnation() {
  const productId = document.getElementById('selectedProductId')?.value;
  const quantity  = parseInt(document.getElementById('condemnQuantity')?.value);
  const reason    = document.getElementById('condemnReason')?.value;
  const notes     = document.getElementById('condemnNotes')?.value || '';

  if (!productId) { alert('Please select a product'); return; }
  if (!quantity || quantity < 1) { alert('Please enter a valid quantity'); return; }
  if (!reason) { alert('Please select a reason'); return; }

  const product = condemnInventoryData.find(p => p.id == productId);
  if (!product) { alert('Invalid product'); return; }
  if (quantity > parseInt(product.stock_quantity ?? 0)) {
    alert(`Only ${product.stock_quantity} units available`); return;
  }

  const unit_price = parseFloat(product.price);
  const total_loss = unit_price * quantity;

  try {
    // 1. Insert condemnation record
    const res = await fetch(`${_CD_URL}/rest/v1/condemnations`, {
      method: 'POST', headers: _CD_H,
      body: JSON.stringify({ inventory_id: parseInt(productId), quantity, reason, notes, unit_price, total_loss })
    });
    if (!res.ok) throw new Error(await res.text());

    // 2. Deduct stock
    const newStock = parseInt(product.stock_quantity) - quantity;
    await fetch(`${_CD_URL}/rest/v1/inventory?id=eq.${productId}`, {
      method: 'PATCH', headers: _CD_H, body: JSON.stringify({ stock_quantity: newStock })
    });

    // 3. Log to stock_logs
    await fetch(`${_CD_URL}/rest/v1/stock_logs`, {
      method: 'POST', headers: _CD_H,
      body: JSON.stringify({ inventory_id: parseInt(productId), type: 'Stock Out', quantity: -quantity, reason: `Condemned: ${reason}`, processed_by: 'Manager' })
    });

    alert('Item condemned successfully!');
    closeCondemnModal();
    await loadCondemnationData();
    await loadCondemnInventoryData();
    applyCondemnFilters();
    if (typeof window.fetchInventoryFromDB === 'function') window.fetchInventoryFromDB();

  } catch (err) {
    console.error('Submit condemnation error:', err);
    alert('Server error. Check console.');
  }
}

function renderProductList(search = '') {
  const container = document.getElementById('productList');
  if (!container) return;
  container.innerHTML = '';
  const filtered = condemnInventoryData.filter(p =>
    (p.product_name || '').toLowerCase().includes(search) ||
    (p.sku || '').toLowerCase().includes(search)
  );
  if (!filtered.length) { container.innerHTML = '<div class="condemn-product-empty">No products found</div>'; return; }
  filtered.forEach(product => {
    const item = document.createElement('div');
    item.className = 'condemn-product-item';
    item.innerHTML = `
      <div class="condemn-product-name">${product.product_name}</div>
      <div class="condemn-product-meta">
        <span>SKU: ${product.sku}</span><span>${product.category}</span>
        <span>Stock: ${product.stock_quantity}</span>
        <span>₱${parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>`;
    item.addEventListener('click', () => selectProduct(product));
    container.appendChild(item);
  });
}

function selectProduct(product) {
  const idEl = document.getElementById('selectedProductId');
  if (idEl) idEl.value = product.id;
  const displayEl = document.getElementById('productDisplay');
  if (displayEl) displayEl.textContent = product.product_name;
  document.getElementById('productDropdownBtn')?.classList.add('selected');
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('displaySKU', product.sku);
  el('displayCategory', product.category);
  el('displayStock', product.stock_quantity);
  el('displayPrice', '₱' + parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 }));
  document.getElementById('productInfoCard')?.classList.add('show');
  const qtyInput = document.getElementById('condemnQuantity');
  if (qtyInput) { qtyInput.max = product.stock_quantity; qtyInput.value = ''; }
  const lossEl = document.getElementById('estimatedLoss');
  if (lossEl) lossEl.textContent = '₱0.00';
  document.getElementById('productSelectionModal')?.classList.remove('show');
}

function renderCondemnTable() {
  const tbody = document.getElementById('condemnationTableBody');
  const emptyState = document.getElementById('emptyState');
  if (!tbody || !emptyState) return;
  if (!filteredRecords.length) { tbody.innerHTML = ''; emptyState.classList.add('show'); renderPagination(); return; }
  emptyState.classList.remove('show');
  tbody.innerHTML = '';
  const start = (condemnCurrentPage - 1) * condemnItemsPerPage;
  const pageData = filteredRecords.slice(start, start + condemnItemsPerPage);
  pageData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatCondemnDate(item.condemned_date || item.created_at)}</td>
      <td><span class="product-name">${item.product_name}</span></td>
      <td>${item.sku}</td>
      <td><span class="category-badge">${item.category}</span></td>
      <td>${item.quantity}</td>
      <td>₱${parseFloat(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td><span class="loss-amount">₱${parseFloat(item.total_loss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></td>
      <td>${item.reason || 'N/A'}</td>
      <td>${item.condemned_by || 'Manager'}</td>`;
    tbody.appendChild(row);
  });
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredRecords.length / condemnItemsPerPage) || 1;
  const pageNumbers = document.getElementById('pageNumbers');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  if (pageNumbers) {
    pageNumbers.innerHTML = '';
    const start = Math.max(1, condemnCurrentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
      const btn = document.createElement('button');
      btn.className = 'page-num' + (i === condemnCurrentPage ? ' active' : '');
      btn.textContent = i;
      btn.addEventListener('click', () => { condemnCurrentPage = i; renderCondemnTable(); });
      pageNumbers.appendChild(btn);
    }
  }
  if (prevBtn) { prevBtn.disabled = condemnCurrentPage === 1; prevBtn.onclick = () => { if (condemnCurrentPage > 1) { condemnCurrentPage--; renderCondemnTable(); } }; }
  if (nextBtn) { nextBtn.disabled = condemnCurrentPage >= totalPages; nextBtn.onclick = () => { if (condemnCurrentPage < totalPages) { condemnCurrentPage++; renderCondemnTable(); } }; }
}

function setupCondemnFilters() {
  document.getElementById('categoryFilter')?.addEventListener('change', applyCondemnFilters);
  let timeout;
  document.getElementById('condemnSearch')?.addEventListener('input', () => {
    clearTimeout(timeout); timeout = setTimeout(applyCondemnFilters, 300);
  });
}

function applyCondemnFilters() {
  const category = document.getElementById('categoryFilter')?.value || 'all';
  const search = (document.getElementById('condemnSearch')?.value || '').toLowerCase().trim();
  filteredRecords = condemnationRecords.filter(item => {
    if (category !== 'all' && (item.category || '').toLowerCase() !== category.toLowerCase()) return false;
    if (search) {
      const name   = (item.product_name || '').toLowerCase();
      const sku    = (item.sku || '').toLowerCase();
      const reason = (item.reason || '').toLowerCase();
      if (!name.includes(search) && !sku.includes(search) && !reason.includes(search)) return false;
    }
    return true;
  });
  condemnCurrentPage = 1;
  renderCondemnTable();
}

function resetCondemnForm() {
  document.getElementById('condemnationForm')?.reset();
  document.getElementById('selectedProductId') && (document.getElementById('selectedProductId').value = '');
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('productDisplay', 'Select a product...');
  el('estimatedLoss', '₱0.00');
  document.getElementById('productDropdownBtn')?.classList.remove('selected');
  document.getElementById('productInfoCard')?.classList.remove('show');
}

function formatCondemnDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

window.resetCondemnation = function () {
  condemnationInitialized = false;
  condemnationRecords = []; condemnInventoryData = [];
  filteredRecords = []; condemnCurrentPage = 1;
};