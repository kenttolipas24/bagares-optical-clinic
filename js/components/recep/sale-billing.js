const SUPA_URL_SB = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const SUPA_KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const SB_H = {
  'apikey': SUPA_KEY_SB,
  'Authorization': `Bearer ${SUPA_KEY_SB}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function sbGet(table, params = '') {
  const res = await fetch(`${SUPA_URL_SB}/rest/v1/${table}${params}`, { headers: SB_H });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function sbPost(table, body) {
  const res = await fetch(`${SUPA_URL_SB}/rest/v1/${table}`, { method: 'POST', headers: SB_H, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function sbPatch(table, body, params = '') {
  const res = await fetch(`${SUPA_URL_SB}/rest/v1/${table}${params}`, { method: 'PATCH', headers: SB_H, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

let saleItems = [];
let selectedPaymentMethod = null;
let salesInitialized = false;
let inventoryData = [];
let currentStaff = null;
let discountInfo = { type: 'none', value: 0, idNumber: '' };
let currentVoidSaleId = null;

fetch('../components/receptionist/sale-billing.html')
  .then(res => res.text())
  .then(html => {
    const holder = document.getElementById('sales-placeholder');
    if (!holder) return;
    holder.innerHTML = html;
    console.log('✅ Sales HTML loaded');
  })
  .catch(console.error);

window.initSalesBilling = async function () {
  if (salesInitialized) return;
  salesInitialized = true;
  console.log('🔄 Initializing Sales & Billing...');

  await getCurrentStaff();
  await loadInventoryFromDB();

  setupHeaderFields();
  setupCategoryFilter();
  setupInventorySearch();
  setupInventoryClick();
  setupButtons();
  setupPaymentModal();
  setupDiscountHandlers();
  setupSalesHistoryModal();
  setupVoidModal();
  setupViewSaleModal();
  renderInventory('frames');

  setTimeout(() => {
    setupPatientModalSearch();
    console.log('✅ Patient modal listeners set up');
  }, 500);

  console.log('✅ Sales billing initialized');
};

// ── GET CURRENT STAFF FROM LOCALSTORAGE ──────────────────────────────────
async function getCurrentStaff() {
  try {
    const user = window.__staffUser || JSON.parse(localStorage.getItem('bag_staff_user') || '{}');
    if (user && user.id) {
      currentStaff = { id: user.id, name: (user.firstname || '') + ' ' + (user.lastname || '') };
      console.log('✅ Current staff:', currentStaff.name);
    } else {
      currentStaff = { id: null, name: 'Unknown Staff' };
    }
  } catch (err) {
    currentStaff = { id: null, name: 'Unknown Staff' };
  }
}

// ── LOAD INVENTORY FROM SUPABASE ─────────────────────────────────────────
async function loadInventoryFromDB() {
  const list = document.getElementById('inventoryList');
  if (list) list.innerHTML = `<div style="text-align:center;padding:40px;color:#666;">Loading inventory...</div>`;

  try {
    const data = await sbGet('inventory', '?order=product_name.asc');
    inventoryData = data.map(item => ({
      id:       item.id,
      name:     item.product_name,
      category: (item.category || '').toLowerCase().trim(),
      price:    parseFloat(item.price) || 0,
      sku:      item.sku || '',
      stock:    parseInt(item.stock) || 0
    }));
    console.log(`✅ Loaded ${inventoryData.length} inventory items`);
  } catch (err) {
    console.error('❌ Error loading inventory:', err);
    inventoryData = [];
    if (list) list.innerHTML = `<div class="empty-cart" style="color:#e74c3c;">⚠️ Error loading inventory</div>`;
  }
}

// ── PATIENT SEARCH FROM SUPABASE ─────────────────────────────────────────
function setupPatientModalSearch() {
  const dropdownBtn  = document.getElementById('patientDropdownBtn');
  const modal        = document.getElementById('salesPatientModal');
  const modalInput   = document.getElementById('salesPatientSearch');
  const list         = document.getElementById('salesPatientList');

  if (!dropdownBtn || !modal || !modalInput || !list) {
    console.error('❌ Patient dropdown elements missing');
    return;
  }

  let debounce;

  dropdownBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    modal.classList.add('show');
    dropdownBtn.classList.add('open');
    modalInput.value = '';
    modalInput.focus();
    fetchPatients('');
  });

  modalInput.addEventListener('input', () => {
    document.getElementById('patientId').value = '';
    clearTimeout(debounce);
    debounce = setTimeout(() => fetchPatients(modalInput.value.trim()), 300);
  });

  const closeModal = () => {
    modal.style.display = 'none';
    modal.classList.remove('show');
    dropdownBtn.classList.remove('open');
  };

  document.getElementById('closePatientModal').onclick = closeModal;
  document.getElementById('btnCancelPatient').onclick  = closeModal;
  modal.onclick = e => { if (e.target === modal) closeModal(); };
}

async function fetchPatients(term) {
  const container = document.getElementById('salesPatientList');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:20px;color:#666;">Loading patients...</div>`;

  try {
    const params = term
      ? `?or=(firstname.ilike.*${term}*,lastname.ilike.*${term}*)&order=lastname.asc`
      : '?order=lastname.asc&limit=50';

    const data = await sbGet('patient_records', params);
    container.innerHTML = '';

    if (!data.length) {
      container.innerHTML = `<div class="no-results">No patients found</div>`;
      return;
    }

    data.forEach(p => {
      const fullName = `${p.firstname} ${p.middlename || ''} ${p.lastname}`.trim();
      const card = document.createElement('div');
      card.className = 'patient-card';
      card.innerHTML = `
        <div class="patient-avatar">${getInitials(fullName)}</div>
        <div class="patient-info">
          <h4>${fullName}</h4>
          <div class="meta">ID: ${p.id}</div>
        </div>`;
      card.onclick = () => selectPatient({ id: p.id, name: fullName });
      container.appendChild(card);
    });

  } catch (err) {
    console.error('❌ fetchPatients error:', err);
    container.innerHTML = `<div class="no-results">Error loading patients</div>`;
  }
}

function selectPatient(patient) {
  const dropdownBtn  = document.getElementById('patientDropdownBtn');
  const displaySpan  = document.getElementById('patientNameDisplay');
  displaySpan.textContent = patient.name;
  document.getElementById('patientName').value = patient.name;
  document.getElementById('patientId').value   = patient.id;
  dropdownBtn.classList.add('has-selection');
  document.getElementById('salesPatientModal').style.display = 'none';
  document.getElementById('salesPatientModal').classList.remove('show');
  dropdownBtn.classList.remove('open');
  console.log('✅ Selected patient:', patient.name);
}

function getInitials(name) {
  if (!name) return '?';
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[1]?.[0] || '')).toUpperCase();
}

function setupHeaderFields() {
  const date = document.getElementById('saleDate');
  if (date) date.value = new Date().toISOString().split('T')[0];
}

function setupDiscountHandlers() {
  const discountType  = document.getElementById('discountType');
  const customRow     = document.getElementById('customDiscountRow');
  const idRow         = document.getElementById('discountIdRow');
  const customValue   = document.getElementById('customDiscountValue');
  const customUnit    = document.getElementById('customDiscountUnit');
  if (!discountType) return;

  discountType.addEventListener('change', () => {
    const type = discountType.value;
    customRow.style.display = (type === 'promo' || type === 'custom') ? 'block' : 'none';
    idRow.style.display     = (type === 'senior' || type === 'pwd')   ? 'block' : 'none';
    discountInfo.type  = type;
    discountInfo.value = (type === 'senior' || type === 'pwd') ? 20 : (type === 'none' ? 0 : discountInfo.value);
    updateTotal();
  });

  if (customValue) customValue.addEventListener('input', () => { discountInfo.value = parseFloat(customValue.value) || 0; updateTotal(); });
  if (customUnit)  customUnit.addEventListener('change', updateTotal);

  const idInput = document.getElementById('discountIdNumber');
  if (idInput) idInput.addEventListener('input', () => { discountInfo.idNumber = idInput.value; });
}

function setupCategoryFilter() {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderInventory(btn.dataset.category);
    };
  });
}

function setupInventorySearch() {
  const search = document.getElementById('inventorySearch');
  if (!search) return;
  search.oninput = e => {
    const cat = document.querySelector('.category-btn.active')?.dataset.category || 'frames';
    renderInventory(cat, e.target.value.toLowerCase());
  };
}

function renderInventory(category, search = '') {
  const list = document.getElementById('inventoryList');
  if (!list) return;
  const items = inventoryData.filter(i =>
    i.category === category.toLowerCase().trim() &&
    i.name.toLowerCase().includes(search.toLowerCase().trim())
  );
  list.innerHTML = '';
  if (!items.length) { list.innerHTML = `<div class="empty-cart">No ${category} found</div>`; return; }
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'inventory-item';
    el.dataset.id = item.id;
    const stockClass = item.stock <= 0 ? 'out-of-stock' : item.stock < 10 ? 'low-stock' : '';
    const stockText  = item.stock <= 0 ? 'Out of Stock' : `${item.stock} in stock`;
    el.innerHTML = `
      <div>
        <div class="item-name">${item.name}</div>
        <div class="item-category">${item.category} • SKU: ${item.sku}</div>
        <div class="item-stock ${stockClass}">${stockText}</div>
      </div>
      <div class="item-price">₱${item.price.toLocaleString(undefined, {minimumFractionDigits:2})}</div>`;
    if (item.stock <= 0) { el.style.opacity = '0.5'; el.style.cursor = 'not-allowed'; }
    list.appendChild(el);
  });
}

function setupInventoryClick() {
  document.addEventListener('click', e => {
    const item = e.target.closest('.inventory-item');
    if (!item) return;
    const id = +item.dataset.id;
    const inv = inventoryData.find(i => i.id === id);
    if (inv && inv.stock > 0) addToSale(id);
    else if (inv) alert('This item is out of stock');
  });
}

function addToSale(id) {
  const item = inventoryData.find(i => i.id === id);
  if (!item) return;
  const existing = saleItems.find(i => i.id === id);
  if (existing) {
    if (existing.quantity >= item.stock) { alert(`Only ${item.stock} units available`); return; }
    existing.quantity++;
  } else {
    saleItems.push({ ...item, quantity: 1 });
  }
  renderSaleItems();
  updateTotal();
}

function renderSaleItems() {
  const body = document.getElementById('saleItemsBody');
  if (!body) return;
  body.innerHTML = saleItems.length ? '' : `<div class="empty-cart">🛒 No items added</div>`;
  saleItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'sale-item-row';
    row.innerHTML = `
      <div>${item.name}</div>
      <div>₱${item.price.toFixed(2)}</div>
      <div>
        <button class="qty" data-id="${item.id}" data-d="-1">−</button>
        ${item.quantity}
        <button class="qty" data-id="${item.id}" data-d="1">+</button>
      </div>
      <div>₱${(item.price * item.quantity).toFixed(2)}</div>
      <button class="remove" data-id="${item.id}">×</button>`;
    body.appendChild(row);
  });
  document.querySelectorAll('.qty').forEach(b => b.onclick = () => changeQuantity(b.dataset.id, +b.dataset.d));
  document.querySelectorAll('.remove').forEach(b => b.onclick = () => removeItem(b.dataset.id));
}

function changeQuantity(id, d) {
  const item = saleItems.find(i => i.id == id);
  if (!item) return;
  const inv = inventoryData.find(i => i.id == id);
  const newQty = item.quantity + d;
  if (d > 0 && inv && newQty > inv.stock) { alert(`Only ${inv.stock} units available`); return; }
  item.quantity = newQty;
  if (item.quantity <= 0) removeItem(id);
  else { renderSaleItems(); updateTotal(); }
}

function removeItem(id) {
  saleItems = saleItems.filter(i => i.id != id);
  renderSaleItems();
  updateTotal();
}

function updateTotal() {
  const subtotal     = saleItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountType = document.getElementById('discountType')?.value || 'none';
  const customUnit   = document.getElementById('customDiscountUnit')?.value || 'percent';
  let discountAmount = 0;

  if (discountType === 'senior' || discountType === 'pwd') discountAmount = subtotal * 0.20;
  else if ((discountType === 'promo' || discountType === 'custom') && discountInfo.value > 0) {
    discountAmount = customUnit === 'percent' ? subtotal * (discountInfo.value / 100) : discountInfo.value;
  }

  discountAmount = Math.min(discountAmount, subtotal);
  const total = subtotal - discountAmount;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('subtotalAmount', `₱${subtotal.toFixed(2)}`);
  set('totalAmount', `₱${total.toFixed(2)}`);

  const discountRowEl = document.getElementById('discountRowDisplay');
  if (discountRowEl) discountRowEl.style.display = discountAmount > 0 ? 'flex' : 'none';
  if (discountAmount > 0) {
    set('discountLabel', discountType === 'senior' ? 'Senior 20%' : discountType === 'pwd' ? 'PWD 20%' : customUnit === 'percent' ? `${discountInfo.value}%` : 'Fixed');
    set('discountAmount', `-₱${discountAmount.toFixed(2)}`);
  }

  const btnProcess = document.getElementById('btnProcess');
  if (btnProcess) btnProcess.disabled = !saleItems.length;

  window.currentSaleSubtotal = subtotal;
  window.currentSaleDiscount = discountAmount;
  window.currentSaleTotal    = total;
}

function setupButtons() {
  document.getElementById('btnProcess').onclick = openPaymentModal;
  document.getElementById('btnCancel').onclick  = () => { if (confirm('Cancel sale?')) resetSale(); };
  const historyBtn = document.getElementById('btnSalesHistory');
  if (historyBtn) historyBtn.onclick = openSalesHistoryModal;
}

function resetSale() {
  saleItems = [];
  selectedPaymentMethod = null;
  discountInfo = { type: 'none', value: 0, idNumber: '' };
  const fields = ['patientName','patientId','customDiscountValue','discountIdNumber'];
  fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const displaySpan = document.getElementById('patientNameDisplay');
  if (displaySpan) displaySpan.textContent = 'Select a patient...';
  const dropdownBtn = document.getElementById('patientDropdownBtn');
  if (dropdownBtn) dropdownBtn.classList.remove('has-selection');
  const discountType = document.getElementById('discountType');
  if (discountType) discountType.value = 'none';
  ['customDiscountRow','discountIdRow','examLinkingRow'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  renderSaleItems();
  updateTotal();
}

function setupPaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (!modal) return;
  document.getElementById('closeModal').onclick =
  document.getElementById('btnModalCancel').onclick = () => modal.style.display = 'none';
  modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

  document.querySelectorAll('.payment-method-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPaymentMethod = btn.dataset.method;
      document.getElementById('cashTenderingSection').style.display = selectedPaymentMethod === 'cash' ? 'block' : 'none';
      document.getElementById('referenceSection').style.display     = selectedPaymentMethod !== 'cash' ? 'block' : 'none';
      if (selectedPaymentMethod === 'cash') document.getElementById('amountTendered').focus();
      else document.getElementById('referenceNumber').focus();
      validatePayment();
    };
  });

  const amountInput = document.getElementById('amountTendered');
  if (amountInput) amountInput.addEventListener('input', () => { calculateChange(); validatePayment(); });

  document.querySelectorAll('.quick-cash').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('amountTendered').value = btn.dataset.amount === 'exact' ? window.currentSaleTotal.toFixed(2) : btn.dataset.amount;
      calculateChange(); validatePayment();
    };
  });

  const refInput = document.getElementById('referenceNumber');
  if (refInput) refInput.addEventListener('input', validatePayment);
  document.getElementById('btnModalConfirm').onclick = completeSale;
}

function openPaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (!modal) return;
  document.getElementById('modalSubtotal').textContent = `₱${window.currentSaleSubtotal.toFixed(2)}`;
  document.getElementById('modalTotal').textContent    = `₱${window.currentSaleTotal.toFixed(2)}`;
  const discountRow = document.getElementById('modalDiscountRow');
  if (window.currentSaleDiscount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('modalDiscount').textContent = `-₱${window.currentSaleDiscount.toFixed(2)}`;
  } else { discountRow.style.display = 'none'; }
  document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
  selectedPaymentMethod = null;
  document.getElementById('cashTenderingSection').style.display = 'none';
  document.getElementById('referenceSection').style.display     = 'none';
  document.getElementById('amountTendered').value  = '';
  document.getElementById('referenceNumber').value = '';
  document.getElementById('btnModalConfirm').disabled = true;
  document.getElementById('changeAmount').textContent = '₱0.00';
  document.getElementById('changeDisplay').classList.remove('insufficient');
  modal.style.display = 'flex';
}

function calculateChange() {
  const tendered = parseFloat(document.getElementById('amountTendered').value) || 0;
  const change   = tendered - window.currentSaleTotal;
  const display  = document.getElementById('changeDisplay');
  const amount   = document.getElementById('changeAmount');
  if (tendered > 0 && change < 0) {
    display.classList.add('insufficient');
    amount.textContent = `₱${Math.abs(change).toFixed(2)} short`;
  } else {
    display.classList.remove('insufficient');
    amount.textContent = `₱${Math.max(0, change).toFixed(2)}`;
  }
}

function validatePayment() {
  const confirmBtn = document.getElementById('btnModalConfirm');
  if (!confirmBtn || !selectedPaymentMethod) { if (confirmBtn) confirmBtn.disabled = true; return; }
  confirmBtn.disabled = selectedPaymentMethod === 'cash'
    ? (parseFloat(document.getElementById('amountTendered').value) || 0) < window.currentSaleTotal
    : false;
}

// ── COMPLETE SALE — save to Supabase ─────────────────────────────────────
async function completeSale() {
  const patientId   = document.getElementById('patientId').value || null;
  const patientName = document.getElementById('patientName').value || 'Walk-in Customer';
  const saleDate    = document.getElementById('saleDate').value;
  const discountType      = document.getElementById('discountType')?.value || 'none';
  const discountIdNumber  = document.getElementById('discountIdNumber')?.value || '';
  const amountTendered    = selectedPaymentMethod === 'cash' ? parseFloat(document.getElementById('amountTendered').value) || 0 : null;
  const referenceNumber   = selectedPaymentMethod !== 'cash' ? document.getElementById('referenceNumber')?.value || '' : null;

  const confirmBtn = document.getElementById('btnModalConfirm');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Processing...';

  try {
    // 1. Insert sale record
    const saleData = await sbPost('sales', {
      patient_id:        patientId,
      patient_name:      patientName,
      sale_date:         saleDate,
      payment_method:    selectedPaymentMethod,
      subtotal:          window.currentSaleSubtotal,
      discount_type:     discountType,
      discount_amount:   window.currentSaleDiscount,
      discount_id_number: discountIdNumber,
      total_amount:      window.currentSaleTotal,
      amount_tendered:   amountTendered,
      change_amount:     amountTendered ? amountTendered - window.currentSaleTotal : null,
      reference_number:  referenceNumber,
      staff_id:          currentStaff?.id,
      staff_name:        currentStaff?.name,
      payment_status:    'paid'
    });

    const saleId = saleData[0]?.id;

    // 2. Insert sale items
    if (saleId) {
      await sbPost('sale_items', saleItems.map(i => ({
        sale_id:      saleId,
        inventory_id: i.id,
        product_name: i.name,
        quantity:     i.quantity,
        price:        i.price
      })));

      // 3. Update inventory stock
      for (const item of saleItems) {
        const inv = inventoryData.find(i => i.id === item.id);
        if (inv) {
          await sbPatch('inventory', { stock: inv.stock - item.quantity }, `?id=eq.${item.id}`);
        }
      }
    }

    if (selectedPaymentMethod === 'cash' && amountTendered - window.currentSaleTotal > 0) {
      alert(`Sale completed!\n\nChange: ₱${(amountTendered - window.currentSaleTotal).toFixed(2)}`);
    } else {
      alert('Sale saved successfully!');
    }

    document.getElementById('paymentModal').style.display = 'none';
    resetSale();
    await loadInventoryFromDB();
    renderInventory(document.querySelector('.category-btn.active')?.dataset.category || 'frames');

  } catch (err) {
    console.error('❌ Error saving sale:', err);
    alert('Error saving sale: ' + err.message);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Payment';
  }
}

// ── SALES HISTORY — from Supabase ────────────────────────────────────────
function setupSalesHistoryModal() {
  const modal = document.getElementById('salesHistoryModal');
  if (!modal) return;
  document.getElementById('closeHistoryModal').onclick = () => modal.style.display = 'none';
  modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
  const today = new Date();
  const ago   = new Date(today); ago.setDate(ago.getDate() - 30);
  document.getElementById('historyDateTo').value   = today.toISOString().split('T')[0];
  document.getElementById('historyDateFrom').value = ago.toISOString().split('T')[0];
  document.getElementById('btnFilterHistory').onclick = loadSalesHistory;
}

function openSalesHistoryModal() {
  document.getElementById('salesHistoryModal').style.display = 'flex';
  loadSalesHistory();
}

async function loadSalesHistory() {
  const tbody    = document.getElementById('historyTableBody');
  const dateFrom = document.getElementById('historyDateFrom').value;
  const dateTo   = document.getElementById('historyDateTo').value;
  const status   = document.getElementById('historyStatus').value;
  tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;">Loading...</td></tr>`;

  try {
    let params = `?order=created_at.desc`;
    if (dateFrom) params += `&sale_date=gte.${dateFrom}`;
    if (dateTo)   params += `&sale_date=lte.${dateTo}`;
    if (status)   params += `&payment_status=eq.${status}`;

    const sales = await sbGet('sales', params);
    tbody.innerHTML = '';

    if (!sales.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:#6b7280;">No sales found</td></tr>`;
      return;
    }

    sales.forEach(sale => {
      const isVoided   = sale.payment_status === 'voided';
      const statusClass = isVoided ? 'status-voided' : 'status-paid';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>#${sale.id}</td>
        <td>${formatDate(sale.sale_date)}</td>
        <td>${sale.patient_name || 'Walk-in'}</td>
        <td>—</td>
        <td>₱${parseFloat(sale.total_amount).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
        <td>${capitalizeFirst(sale.payment_method || 'N/A')}</td>
        <td>${sale.staff_name || 'N/A'}</td>
        <td><span class="status-badge ${statusClass}">${sale.payment_status}</span></td>
        <td class="history-actions">
          <button class="btn-icon view" data-sale-id="${sale.id}" title="View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="btn-icon void" data-sale-id="${sale.id}" title="Void" ${isVoided ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </button>
        </td>`;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll('.btn-icon.view').forEach(btn => btn.onclick = () => viewSaleDetails(btn.dataset.saleId));
    tbody.querySelectorAll('.btn-icon.void:not([disabled])').forEach(btn => btn.onclick = () => openVoidModal(btn.dataset.saleId));

  } catch (err) {
    console.error('❌ Error loading sales history:', err);
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:#e74c3c;">Error loading sales</td></tr>`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}
function capitalizeFirst(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

function setupViewSaleModal() {
  const modal = document.getElementById('viewSaleModal');
  if (!modal) return;
  document.getElementById('closeViewSaleModal').onclick =
  document.getElementById('btnCloseViewSale').onclick = () => modal.style.display = 'none';
  modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
  document.getElementById('btnPrintReceipt').onclick = () => {
    const saleId = document.getElementById('viewSaleId').textContent.replace('#','');
    window.print();
  };
}

async function viewSaleDetails(saleId) {
  try {
    const sales = await sbGet('sales', `?id=eq.${saleId}`);
    const items = await sbGet('sale_items', `?sale_id=eq.${saleId}`);
    if (!sales.length) throw new Error('Sale not found');
    const sale = sales[0];

    document.getElementById('viewSaleId').textContent        = `#${sale.id}`;
    document.getElementById('viewSaleDate').textContent      = formatDate(sale.sale_date);
    document.getElementById('viewPatientName').textContent   = sale.patient_name || 'Walk-in';
    document.getElementById('viewStaffName').textContent     = sale.staff_name || 'N/A';
    document.getElementById('viewPaymentMethod').textContent = capitalizeFirst(sale.payment_method || 'N/A');

    const statusEl = document.getElementById('viewStatus');
    statusEl.textContent = capitalizeFirst(sale.payment_status);
    statusEl.className   = sale.payment_status === 'voided' ? 'status-badge status-voided' : 'status-badge status-paid';

    const itemsBody = document.getElementById('viewSaleItems');
    itemsBody.innerHTML = '';
    let subtotal = 0;
    items.forEach(item => {
      const itemSub = item.price * item.quantity;
      subtotal += itemSub;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.product_name || 'Unknown'}</td>
        <td>₱${parseFloat(item.price).toFixed(2)}</td>
        <td>${item.quantity}</td>
        <td>₱${itemSub.toFixed(2)}</td>`;
      itemsBody.appendChild(row);
    });

    document.getElementById('viewSubtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('viewTotal').textContent    = `₱${parseFloat(sale.total_amount).toFixed(2)}`;

    const discountRow = document.getElementById('viewDiscountRow');
    if (sale.discount_amount && parseFloat(sale.discount_amount) > 0) {
      discountRow.style.display = 'flex';
      document.getElementById('viewDiscount').textContent = `-₱${parseFloat(sale.discount_amount).toFixed(2)}`;
    } else { discountRow.style.display = 'none'; }

    document.getElementById('viewSaleModal').style.display = 'flex';

  } catch (err) {
    console.error('❌ Error loading sale details:', err);
    alert('Error loading sale details: ' + err.message);
  }
}

function setupVoidModal() {
  const modal = document.getElementById('voidSaleModal');
  if (!modal) return;
  document.getElementById('closeVoidModal').onclick =
  document.getElementById('btnCancelVoid').onclick = () => { modal.style.display = 'none'; currentVoidSaleId = null; };
  modal.onclick = e => { if (e.target === modal) { modal.style.display = 'none'; currentVoidSaleId = null; } };
  document.getElementById('voidReason').onchange = e => {
    document.getElementById('voidNotesGroup').style.display = e.target.value === 'other' ? 'block' : 'none';
    document.getElementById('btnConfirmVoid').disabled = !e.target.value;
  };
  document.getElementById('btnConfirmVoid').onclick = confirmVoidSale;
}

async function openVoidModal(saleId) {
  currentVoidSaleId = saleId;
  try {
    const sales = await sbGet('sales', `?id=eq.${saleId}`);
    if (!sales.length) throw new Error('Sale not found');
    const sale = sales[0];
    document.getElementById('voidSaleId').textContent    = `#${sale.id}`;
    document.getElementById('voidPatientName').textContent = sale.patient_name || 'Walk-in';
    document.getElementById('voidAmount').textContent    = `₱${parseFloat(sale.total_amount).toFixed(2)}`;
    document.getElementById('voidDate').textContent      = formatDate(sale.sale_date);
    document.getElementById('voidReason').value          = '';
    document.getElementById('voidNotes').value           = '';
    document.getElementById('voidNotesGroup').style.display = 'none';
    document.getElementById('btnConfirmVoid').disabled   = true;
    document.getElementById('voidSaleModal').style.display = 'flex';
  } catch (err) {
    console.error('❌ Error loading sale for void:', err);
    alert('Error: ' + err.message);
  }
}

async function confirmVoidSale() {
  if (!currentVoidSaleId) return;
  const reason = document.getElementById('voidReason').value;
  if (!reason) { alert('Please select a reason'); return; }

  const confirmBtn = document.getElementById('btnConfirmVoid');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Processing...';

  try {
    await sbPatch('sales', { payment_status: 'voided', void_reason: reason }, `?id=eq.${currentVoidSaleId}`);

    // Restore inventory stock
    const items = await sbGet('sale_items', `?sale_id=eq.${currentVoidSaleId}`);
    for (const item of items) {
      const inv = inventoryData.find(i => i.id === item.inventory_id);
      if (inv) {
        await sbPatch('inventory', { stock: inv.stock + item.quantity }, `?id=eq.${item.inventory_id}`);
      }
    }

    alert('Sale voided. Stock restored.');
    document.getElementById('voidSaleModal').style.display = 'none';
    currentVoidSaleId = null;
    loadSalesHistory();
    await loadInventoryFromDB();
    renderInventory(document.querySelector('.category-btn.active')?.dataset.category || 'frames');

  } catch (err) {
    console.error('❌ Error voiding sale:', err);
    alert('Error: ' + err.message);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Void';
  }
}