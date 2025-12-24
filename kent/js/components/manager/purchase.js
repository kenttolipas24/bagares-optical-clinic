// Load the purchase.html content
fetch('../components/manager/purchase.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('purchase-placeholder').innerHTML = data;
  })
  .catch(error => console.error('Error loading purchase orders:', error));

// All your other functions stay the same (filterOrders, applyOrderFilters, etc.)

// Function to change pages
function changePage(page, event) {
  event.preventDefault();
  
  // Hide all sections
  const framePlaceholder = document.getElementById('frame-placeholder');
  const purchasePlaceholder = document.getElementById('purchase-placeholder');
  const supplierPlaceholder = document.getElementById('supplier-placeholder');
  
  if (framePlaceholder) framePlaceholder.style.display = 'none';
  if (purchasePlaceholder) purchasePlaceholder.style.display = 'none';
  if (supplierPlaceholder) supplierPlaceholder.style.display = 'none';
  
  // Get dropdown text element
  const dropdownText = document.getElementById('inventoryDropdownText');
  
  // Show selected section and update dropdown text
  if (page === 'inventory') {
    if (framePlaceholder) framePlaceholder.style.display = 'block';
    if (dropdownText) dropdownText.textContent = 'Inventory';
  } else if (page === 'purchase-orders') {
    if (purchasePlaceholder) purchasePlaceholder.style.display = 'block';
    if (dropdownText) dropdownText.textContent = 'Purchase Orders';
  } else if (page === 'suppliers') {
    if (supplierPlaceholder) supplierPlaceholder.style.display = 'block';
    if (dropdownText) dropdownText.textContent = 'Suppliers';
  }
  
  // Close dropdown after selection
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('show');
  });
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    dropdown.classList.remove('active');
  });
}
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

// Sort table
function sortOrderTable(column) {
  const tbody = document.getElementById('purchaseTableBody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  const columnMap = { po: 1, supplier: 2, date: 3, delivery: 4, items: 5, total: 6 };
  const columnIndex = columnMap[column];
  
  rows.sort((a, b) => {
    let aValue = a.cells[columnIndex].textContent.trim();
    let bValue = b.cells[columnIndex].textContent.trim();
    
    if (column === 'total') {
      aValue = parseFloat(aValue.replace(/[₱,]/g, ''));
      bValue = parseFloat(bValue.replace(/[₱,]/g, ''));
    } else if (column === 'items') {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    }
    
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });
  
  rows.forEach(row => tbody.appendChild(row));
}

// Toggle select all
function toggleSelectAllOrders() {
  const selectAll = document.getElementById('selectAllOrders');
  const checkboxes = document.querySelectorAll('.order-checkbox');
  
  checkboxes.forEach(checkbox => {
    if (checkbox.closest('tr').style.display !== 'none') {
      checkbox.checked = selectAll.checked;
    }
  });
}

// Update count
function updateOrderCount() {
  const visibleRows = Array.from(document.querySelectorAll('#purchaseTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  document.getElementById('orderResultCount').textContent = `Showing ${visibleRows.length} orders`;
  document.getElementById('orderShowingStart').textContent = visibleRows.length > 0 ? '1' : '0';
  document.getElementById('orderShowingEnd').textContent = visibleRows.length;
  document.getElementById('totalOrders').textContent = visibleRows.length;
}

// View order details
function viewOrder(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[1].textContent.trim();
  const supplier = row.cells[2].textContent.trim();
  const orderDate = row.cells[3].textContent.trim();
  const delivery = row.cells[4].textContent.trim();
  const items = row.cells[5].textContent.trim();
  const total = row.cells[6].textContent.trim();
  const status = row.cells[7].textContent.trim();
  
  alert(`Purchase Order Details:\n\nPO Number: ${poNumber}\nSupplier: ${supplier}\nOrder Date: ${orderDate}\nExpected Delivery: ${delivery}\nItems: ${items}\nTotal: ${total}\nStatus: ${status}`);
}

// Edit order
function editOrder(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[1].textContent.trim();
  
  alert(`Edit Purchase Order: ${poNumber}\n\nThis would open a form to edit:\n- Supplier\n- Items and quantities\n- Delivery date\n- Notes`);
}

// Approve order
function approveOrder(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[1].textContent.trim();
  
  if (confirm(`Approve purchase order ${poNumber}?`)) {
    const statusBadge = row.cells[7].querySelector('.status-badge');
    statusBadge.className = 'status-badge approved';
    statusBadge.textContent = 'Approved';
    row.dataset.status = 'approved';
    
    // Update action buttons
    const actionsCell = row.cells[8];
    actionsCell.innerHTML = `
      <div class="action-buttons">
        <button class="action-btn view" onclick="viewOrder(this)" title="View Details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="action-btn receive" onclick="markReceived(this)" title="Mark as Received">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
        </button>
        <button class="action-btn delete" onclick="deleteOrder(this)" title="Cancel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    alert(`Purchase order ${poNumber} has been approved!`);
  }
}

// Mark as received
function markReceived(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[1].textContent.trim();
  
  if (confirm(`Mark purchase order ${poNumber} as received?`)) {
    const statusBadge = row.cells[7].querySelector('.status-badge');
    statusBadge.className = 'status-badge received';
    statusBadge.textContent = 'Received';
    row.dataset.status = 'received';
    
    // Update action buttons
    const actionsCell = row.cells[8];
    actionsCell.innerHTML = `
      <div class="action-buttons">
        <button class="action-btn view" onclick="viewOrder(this)" title="View Details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="action-btn print" onclick="printOrder(this)" title="Print">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
        </button>
      </div>
    `;
    
    alert(`Purchase order ${poNumber} marked as received!\nInventory will be updated automatically.`);
  }
}

// Print order
function printOrder(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[1].textContent.trim();
  
  alert(`Printing purchase order: ${poNumber}\n\nThis would generate a PDF with:\n- PO details\n- Supplier information\n- Item list with quantities\n- Total amount\n- Terms and conditions`);
}

// Delete/Cancel order
function deleteOrder(button) {
  const row = button.closest('tr');
  const poNumber = row.cells[1].textContent.trim();
  
  if (confirm(`Cancel purchase order ${poNumber}?`)) {
    const statusBadge = row.cells[7].querySelector('.status-badge');
    statusBadge.className = 'status-badge cancelled';
    statusBadge.textContent = 'Cancelled';
    row.dataset.status = 'cancelled';
    
    alert(`Purchase order ${poNumber} has been cancelled.`);
  }
}

// Export orders
function exportOrders() {
  const rows = Array.from(document.querySelectorAll('#purchaseTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  let csv = 'PO Number,Supplier,Order Date,Expected Delivery,Items,Total Amount,Status\n';
  
  rows.forEach(row => {
    const cells = row.cells;
    const po = cells[1].textContent.trim();
    const supplier = cells[2].textContent.trim();
    const orderDate = cells[3].textContent.trim();
    const delivery = cells[4].textContent.trim();
    const items = cells[5].textContent.trim();
    const total = cells[6].textContent.trim();
    const status = cells[7].textContent.trim();
    
    csv += `"${po}","${supplier}","${orderDate}","${delivery}","${items}","${total}","${status}"\n`;
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