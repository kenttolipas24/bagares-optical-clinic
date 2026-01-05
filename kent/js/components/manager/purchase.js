// Load the purchase.html content
fetch('../components/manager/purchase.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('purchase-placeholder').innerHTML = data;
  })
  .catch(error => console.error('Error loading purchase orders:', error));

// REMOVE THIS ENTIRE FUNCTION - it's already in navbar.js
// function changePage(page, event) { ... }

// Apply filters
function applyOrderFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  const dateFilter = document.getElementById('dateFilter').value;
  const supplierFilter = document.getElementById('supplierFilter').value;
  const rows = document.querySelectorAll('#purchaseTableBody tr');
  
  rows.forEach(row => {
    let showRow = true;
    
    // Status filter
    if (statusFilter !== 'all') {
      const rowStatus = row.dataset.status;
      if (rowStatus !== statusFilter) showRow = false;
    }
    
    // Supplier filter
    if (supplierFilter !== 'all') {
      const rowSupplier = row.dataset.supplier;
      if (rowSupplier !== supplierFilter) showRow = false;
    }
    
    row.style.display = showRow ? '' : 'none';
  });
  
  updateOrderCount();
}

// Filter orders by search
function filterOrders() {
  const searchValue = document.getElementById('searchOrderInput').value.toLowerCase();
  const rows = document.querySelectorAll('#purchaseTableBody tr');
  
  rows.forEach(row => {
    const poNumber = row.cells[0].textContent.toLowerCase();
    const supplier = row.cells[1].textContent.toLowerCase();
    
    if (poNumber.includes(searchValue) || supplier.includes(searchValue)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  updateOrderCount();
}

// Sort table
function sortOrderTable(column) {
  const tbody = document.getElementById('purchaseTableBody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  const columnMap = { po: 0, supplier: 1, date: 2, delivery: 3, items: 4, total: 5 };
  const columnIndex = columnMap[column];
  
  rows.sort((a, b) => {
    let aValue = a.cells[columnIndex].textContent.trim();
    let bValue = b.cells[columnIndex].textContent.trim();
    
    if (column === 'total') {
      aValue = parseFloat(aValue.replace(/[₱,]/g, ''));
      bValue = parseFloat(bValue.replace(/[₱,]/g, ''));
    } else if (column === 'items') {
      aValue = parseInt(aValue);
      bValue = parseInt(aValue);
    }
    
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });
  
  rows.forEach(row => tbody.appendChild(row));
}

// Update count
function updateOrderCount() {
  const visibleRows = Array.from(document.querySelectorAll('#purchaseTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  const startCount = visibleRows.length > 0 ? 1 : 0;
  const endCount = visibleRows.length;
  
  const showingStart = document.getElementById('orderShowingStart');
  const showingEnd = document.getElementById('orderShowingEnd');
  const totalOrders = document.getElementById('totalOrders');
  
  if (showingStart) showingStart.textContent = startCount;
  if (showingEnd) showingEnd.textContent = endCount;
  if (totalOrders) totalOrders.textContent = endCount;
}

// View order details
function viewOrder(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[0].querySelector('.po-number').textContent.trim();
  const supplier = row.cells[1].textContent.trim();
  const orderDate = row.cells[2].textContent.trim();
  const delivery = row.cells[3].textContent.trim();
  const items = row.cells[4].textContent.trim();
  const total = row.cells[5].textContent.trim();
  
  alert(`Purchase Order Details:\n\nPO Number: ${poNumber}\nSupplier: ${supplier}\nOrder Date: ${orderDate}\nExpected Delivery: ${delivery}\nItems: ${items}\nTotal: ${total}`);
}

// Edit order
function editOrder(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[0].querySelector('.po-number').textContent.trim();
  
  alert(`Edit Purchase Order: ${poNumber}\n\nThis would open a form to edit:\n- Supplier\n- Items and quantities\n- Delivery date\n- Notes`);
}

// Delete/Cancel order
function deleteOrder(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[0].querySelector('.po-number').textContent.trim();
  
  if (confirm(`Cancel purchase order ${poNumber}?`)) {
    row.remove();
    updateOrderCount();
    alert(`Purchase order ${poNumber} has been cancelled.`);
  }
}

// Export orders
function exportOrders() {
  const rows = Array.from(document.querySelectorAll('#purchaseTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  let csv = 'PO Number,Supplier,Order Date,Expected Delivery,Items,Total Amount\n';
  
  rows.forEach(row => {
    const cells = row.cells;
    const po = cells[0].querySelector('.po-number').textContent.trim();
    const supplier = cells[1].textContent.trim();
    const orderDate = cells[2].textContent.trim();
    const delivery = cells[3].textContent.trim();
    const items = cells[4].textContent.trim();
    const total = cells[5].textContent.trim();
    
    csv += `"${po}","${supplier}","${orderDate}","${delivery}","${items}","${total}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'purchase_orders_export.csv';
  a.click();
  window.URL.revokeObjectURL(url);
  
  alert('Purchase orders exported successfully!');
}

// Open add order modal
function openAddOrderModal() {
  alert('Create Purchase Order\n\nThis would open a form with:\n- Select Supplier\n- Add Items (search and select)\n- Quantities for each item\n- Expected delivery date\n- Notes/Terms\n- Total calculation');
}

// Pagination
function previousOrderPage() {
  alert('Previous page');
}

function nextOrderPage() {
  alert('Next page');
}