const _PO_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _PO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _PO_H = { 'apikey': _PO_KEY, 'Authorization': `Bearer ${_PO_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

if (typeof window.inventoryData === 'undefined') window.inventoryData = [];

fetch('../components/manager/purchase.html')
  .then(res => res.text())
  .then(html => {
    const placeholder = document.getElementById('purchase-placeholder');
    if (placeholder) { placeholder.innerHTML = html; loadPurchaseOrders(); }
  })
  .catch(err => console.error('Error loading purchase component:', err));

async function loadPurchaseOrders() {
  try {
    const res = await fetch(
      `${_PO_URL}/rest/v1/purchase_orders?select=*,suppliers(supplier_name)&order=created_at.desc`,
      { headers: _PO_H }
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const mapped = data.map(o => ({
      ...o,
      po_number:     o.po_number || o.id,
      supplier_name: o.suppliers?.supplier_name || '—',
      order_date:    o.order_date || '—',
      delivery_date: o.delivery_date || '—',
      total_amount:  o.total_amount || 0
    }));
    renderPurchaseTable(mapped);
  } catch (err) {
    console.error('Load purchase orders error:', err);
    renderPurchaseTable([]);
  }
}

function renderPurchaseTable(orders) {
  const tbody = document.getElementById('purchaseTableBody');
  if (!tbody) return;
  if (!orders || !orders.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">No purchase orders found.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><span class="po-number">${order.po_number}</span></td>
      <td>${order.supplier_name}</td>
      <td>${order.order_date}</td>
      <td>${order.delivery_date}</td>
      <td>${order.item_count || '—'}</td>
      <td><strong>₱${parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
      <td><button class="action-btn" onclick="viewOrderDetails(${order.id})">View</button></td>
    </tr>`).join('');
}

async function openAddOrderModal() {
  try {
    const [invRes, supRes] = await Promise.all([
      fetch(`${_PO_URL}/rest/v1/inventory?select=*&order=product_name.asc`, { headers: _PO_H }),
      fetch(`${_PO_URL}/rest/v1/suppliers?select=*&status=eq.Active&order=supplier_name.asc`, { headers: _PO_H })
    ]);
    window.inventoryData = await invRes.json();
    const suppliers = await supRes.json();
    const supplierSelect = document.getElementById('poSupplier');
    if (supplierSelect) {
      supplierSelect.innerHTML = '<option value="">Select a supplier</option>' +
        suppliers.map(s => `<option value="${s.id}">${s.supplier_name}</option>`).join('');
    }
    const modal = document.getElementById('createOrderModal');
    if (modal) {
      modal.style.display = 'block';
      document.getElementById('poOrderDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('poItemsBody').innerHTML = '';
      document.getElementById('poGrandTotal').textContent = '₱0.00';
      addItemRow();
    }
  } catch (err) {
    console.error('Open order modal error:', err);
    alert('Failed to load data for order form.');
  }
}

function closeOrderModal() {
  document.getElementById('createOrderModal').style.display = 'none';
  document.getElementById('purchaseOrderForm')?.reset();
}

function addItemRow() {
  const tbody = document.getElementById('poItemsBody');
  const rowId = Date.now();
  const productOptions = (window.inventoryData || []).map(item =>
    `<option value="${item.id}" data-price="${item.price}">${item.product_name} (${item.sku})</option>`
  ).join('');
  const tr = document.createElement('tr');
  tr.id = `row-${rowId}`;
  tr.innerHTML = `
    <td><select class="item-select" required onchange="autoFillPrice(${rowId})">
      <option value="">-- Select Product --</option>${productOptions}</select></td>
    <td><input type="number" class="qty-input" value="1" min="1" oninput="calculateTotals()"></td>
    <td><input type="number" class="cost-input" value="0" step="0.01" oninput="calculateTotals()"></td>
    <td class="row-subtotal">₱0.00</td>
    <td><button type="button" class="action-btn delete" onclick="removeRow(${rowId})">&times;</button></td>`;
  tbody.appendChild(tr);
}

function removeRow(rowId) {
  document.getElementById(`row-${rowId}`)?.remove();
  calculateTotals();
}

function autoFillPrice(rowId) {
  const row = document.getElementById(`row-${rowId}`);
  const select = row.querySelector('.item-select');
  const price = select.options[select.selectedIndex].getAttribute('data-price');
  if (price) row.querySelector('.cost-input').value = price;
  calculateTotals();
}

function calculateTotals() {
  let grandTotal = 0;
  document.querySelectorAll('#poItemsBody tr').forEach(row => {
    const qty  = parseFloat(row.querySelector('.qty-input').value) || 0;
    const cost = parseFloat(row.querySelector('.cost-input').value) || 0;
    const subtotal = qty * cost;
    row.querySelector('.row-subtotal').textContent = `₱${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    grandTotal += subtotal;
  });
  document.getElementById('poGrandTotal').textContent = `₱${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

async function handleCreateOrder(event) {
  event.preventDefault();
  const supplierId     = document.getElementById('poSupplier').value;
  const orderDate      = document.getElementById('poOrderDate').value;
  const deliveryDate   = document.getElementById('poDeliveryDate').value;
  const totalAmountStr = document.getElementById('poGrandTotal').textContent.replace(/[₱,]/g, '');
  const totalAmount    = parseFloat(totalAmountStr) || 0;

  const items = [];
  document.querySelectorAll('#poItemsBody tr').forEach(row => {
    items.push({
      inventory_id: parseInt(row.querySelector('.item-select').value),
      quantity:     parseInt(row.querySelector('.qty-input').value),
      unit_cost:    parseFloat(row.querySelector('.cost-input').value)
    });
  });

  if (!supplierId) { alert('Please select a supplier.'); return; }

  try {
    // 1. Generate PO number
    const poNumber = 'PO-' + Date.now().toString(36).toUpperCase().slice(-6);

    // 2. Insert purchase order
    const poRes = await fetch(`${_PO_URL}/rest/v1/purchase_orders`, {
      method: 'POST', headers: _PO_H,
      body: JSON.stringify({ po_number: poNumber, supplier_id: parseInt(supplierId), order_date: orderDate, delivery_date: deliveryDate, total_amount: totalAmount, status: 'pending', item_count: items.length })
    });
    if (!poRes.ok) throw new Error(await poRes.text());
    const [poRecord] = await poRes.json();

    // 3. Insert order items
    const itemPayload = items.map(item => ({ ...item, po_id: poRecord.id }));
    await fetch(`${_PO_URL}/rest/v1/purchase_order_items`, {
      method: 'POST', headers: _PO_H, body: JSON.stringify(itemPayload)
    });

    alert('Purchase order saved!');
    closeOrderModal();
    loadPurchaseOrders();
  } catch (err) {
    console.error('Create order error:', err);
    alert('Failed to save order. Check console.');
  }
}