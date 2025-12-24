// Load suppliers.html
fetch('../components/manager/supplier.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('supplier-placeholder').innerHTML = data;
  })
  .catch(error => console.error('Error loading suppliers:', error));

// Filter suppliers
function filterSuppliers() {
  const searchValue = document.getElementById('searchSupplierInput').value.toLowerCase();
  const rows = document.querySelectorAll('#supplierTableBody tr');
  
  rows.forEach(row => {
    const supplierName = row.cells[1].textContent.toLowerCase();
    const contactPerson = row.cells[2].textContent.toLowerCase();
    const email = row.cells[3].textContent.toLowerCase();
    
    if (supplierName.includes(searchValue) || contactPerson.includes(searchValue) || email.includes(searchValue)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  updateSupplierCount();
}

// Apply filters
function applySupplierFilters() {
  const statusFilter = document.getElementById('statusFilterSupplier').value;
  const categoryFilter = document.getElementById('categoryFilterSupplier').value;
  const rows = document.querySelectorAll('#supplierTableBody tr');
  
  rows.forEach(row => {
    let showRow = true;
    
    if (statusFilter !== 'all') {
      const rowStatus = row.dataset.status;
      if (rowStatus !== statusFilter) showRow = false;
    }
    
    if (categoryFilter !== 'all') {
      const rowCategory = row.dataset.category;
      if (rowCategory !== categoryFilter) showRow = false;
    }
    
    row.style.display = showRow ? '' : 'none';
  });
  
  updateSupplierCount();
}

// Sort table
function sortSupplierTable(column) {
  const tbody = document.getElementById('supplierTableBody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  const columnMap = { name: 1, contact: 2, email: 3, phone: 4, category: 5, orders: 6 };
  const columnIndex = columnMap[column];
  
  rows.sort((a, b) => {
    let aValue = a.cells[columnIndex].textContent.trim();
    let bValue = b.cells[columnIndex].textContent.trim();
    
    if (column === 'orders') {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    }
    
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });
  
  rows.forEach(row => tbody.appendChild(row));
}

// Toggle select all
function toggleSelectAllSuppliers() {
  const selectAll = document.getElementById('selectAllSuppliers');
  const checkboxes = document.querySelectorAll('.supplier-checkbox');
  
  checkboxes.forEach(checkbox => {
    if (checkbox.closest('tr').style.display !== 'none') {
      checkbox.checked = selectAll.checked;
    }
  });
}

// Update count
function updateSupplierCount() {
  const visibleRows = Array.from(document.querySelectorAll('#supplierTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  document.getElementById('supplierResultCount').textContent = `Showing ${visibleRows.length} suppliers`;
  document.getElementById('supplierShowingStart').textContent = visibleRows.length > 0 ? '1' : '0';
  document.getElementById('supplierShowingEnd').textContent = visibleRows.length;
  document.getElementById('totalSuppliers').textContent = visibleRows.length;
}

// View supplier
function viewSupplier(button) {
  const row = button.closest('tr');
  const supplierName = row.cells[1].textContent.trim();
  const contact = row.cells[2].textContent.trim();
  const email = row.cells[3].textContent.trim();
  const phone = row.cells[4].textContent.trim();
  const category = row.cells[5].textContent.trim();
  const orders = row.cells[6].textContent.trim();
  const status = row.cells[7].textContent.trim();
  
  alert(`Supplier Details:\n\nName: ${supplierName}\nContact Person: ${contact}\nEmail: ${email}\nPhone: ${phone}\nCategory: ${category}\nTotal Orders: ${orders}\nStatus: ${status}`);
}

// Edit supplier
function editSupplier(button) {
  const row = button.closest('tr');
  const supplierName = row.cells[1].textContent.trim();
  
  alert(`Edit Supplier: ${supplierName}\n\nThis would open a form to edit:\n- Company name\n- Contact person\n- Email & phone\n- Address\n- Category\n- Payment terms`);
}

// View supplier orders
function viewSupplierOrders(button) {
  const row = button.closest('tr');
  const supplierName = row.cells[1].textContent.trim();
  const totalOrders = row.cells[6].textContent.trim();
  
  alert(`${supplierName} - Order History\n\nTotal Orders: ${totalOrders}\n\nThis would show:\n- List of all purchase orders\n- Order dates and amounts\n- Delivery status\n- Payment history`);
}

// Delete/Deactivate supplier
function deleteSupplier(button) {
  const row = button.closest('tr');
  const supplierName = row.cells[1].textContent.trim();
  
  if (confirm(`Deactivate supplier: ${supplierName}?`)) {
    const statusBadge = row.cells[7].querySelector('.status-badge');
    statusBadge.className = 'status-badge inactive';
    statusBadge.textContent = 'Inactive';
    row.dataset.status = 'inactive';
    
    // Update action buttons
    const actionsCell = row.cells[8];
    actionsCell.innerHTML = `
      <div class="action-buttons">
        <button class="action-btn view" onclick="viewSupplier(this)" title="View Details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="action-btn activate" onclick="activateSupplier(this)" title="Activate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    `;
    
    alert(`Supplier ${supplierName} has been deactivated.`);
  }
}

// Activate supplier
function activateSupplier(button) {
  const row = button.closest('tr');
  const supplierName = row.cells[1].textContent.trim();
  
  if (confirm(`Activate supplier: ${supplierName}?`)) {
    const statusBadge = row.cells[7].querySelector('.status-badge');
    statusBadge.className = 'status-badge active';
    statusBadge.textContent = 'Active';
    row.dataset.status = 'active';
    
    // Update action buttons
    const actionsCell = row.cells[8];
    actionsCell.innerHTML = `
      <div class="action-buttons">
        <button class="action-btn view" onclick="viewSupplier(this)" title="View Details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="action-btn edit" onclick="editSupplier(this)" title="Edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="action-btn orders" onclick="viewSupplierOrders(this)" title="View Orders">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
        </button>
        <button class="action-btn delete" onclick="deleteSupplier(this)" title="Deactivate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </button>
      </div>
    `;
    
    alert(`Supplier ${supplierName} has been activated.`);
  }
}

// Export suppliers
function exportSuppliers() {
  const rows = Array.from(document.querySelectorAll('#supplierTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  let csv = 'Supplier Name,Contact Person,Email,Phone,Category,Total Orders,Status\n';
  
  rows.forEach(row => {
    const cells = row.cells;
    const name = cells[1].textContent.trim();
    const contact = cells[2].textContent.trim();
    const email = cells[3].textContent.trim();
    const phone = cells[4].textContent.trim();
    const category = cells[5].textContent.trim();
    const orders = cells[6].textContent.trim();
    const status = cells[7].textContent.trim();
    
    csv += `"${name}","${contact}","${email}","${phone}","${category}","${orders}","${status}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'suppliers_export.csv';
  a.click();
  window.URL.revokeObjectURL(url);
  
  alert('Suppliers exported successfully!');
}

// Add supplier modal
function openAddSupplierModal() {
  alert('Add New Supplier\n\nThis would open a form with:\n- Company name\n- Contact person name\n- Email address\n- Phone number\n- Address\n- Category (Frames/Lenses/Both)\n- Payment terms\n- Notes');
}

// Pagination
function previousSupplierPage() {
  alert('Previous page');
}

function nextSupplierPage() {
  alert('Next page');
}