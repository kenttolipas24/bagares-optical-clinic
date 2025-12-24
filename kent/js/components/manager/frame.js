// Load the frame.html content
fetch('../components/manager/frame.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('frame-placeholder').innerHTML = data;
    initializeInventory();
  })
  .catch(error => console.error('Error loading frame:', error));

// Global variables
let currentCategory = 'frames';
let currentSort = { column: null, direction: 'asc' };

// Initialize inventory
function initializeInventory() {
  updateResultCount();
  // Set first tab as active on load
  const firstTab = document.querySelector('.tab');
  if (firstTab) {
    firstTab.classList.add('active');
  }
  // Show only frames initially
  filterByCategory('frames', true);
}

// Filter by category
function filterByCategory(category, isInitialLoad = false) {
  currentCategory = category;
  
  // Update active tab
  if (!isInitialLoad) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');
  }
  
  const rows = document.querySelectorAll('#inventoryTableBody tr');
  
  rows.forEach(row => {
    const rowCategory = row.dataset.category;
    if (category === 'all' || rowCategory === category) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  updateResultCount();
}

// Filter table by search
function filterTable() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#inventoryTableBody tr');
  
  rows.forEach(row => {
    const productName = row.cells[1].textContent.toLowerCase();
    const sku = row.cells[2].textContent.toLowerCase();
    
    if (productName.includes(searchValue) || sku.includes(searchValue)) {
      if (currentCategory === 'all' || row.dataset.category === currentCategory) {
        row.style.display = '';
      }
    } else {
      row.style.display = 'none';
    }
  });
  
  updateResultCount();
}

// Apply filters
function applyFilters() {
  const stockFilter = document.getElementById('stockFilter').value;
  const priceFilter = document.getElementById('priceFilter').value;
  const rows = document.querySelectorAll('#inventoryTableBody tr');
  
  rows.forEach(row => {
    let showRow = true;
    
    // Check category filter
    if (currentCategory !== 'all' && row.dataset.category !== currentCategory) {
      showRow = false;
    }
    
    // Check stock filter
    if (stockFilter !== 'all') {
      const stock = parseInt(row.dataset.stock);
      if (stockFilter === 'in-stock' && stock <= 0) showRow = false;
      if (stockFilter === 'low-stock' && (stock <= 0 || stock > 10)) showRow = false;
      if (stockFilter === 'out-of-stock' && stock > 0) showRow = false;
    }
    
    // Check price filter
    if (priceFilter !== 'all') {
      const price = parseInt(row.dataset.price);
      if (priceFilter === '0-2000' && (price < 0 || price > 2000)) showRow = false;
      if (priceFilter === '2000-5000' && (price < 2000 || price > 5000)) showRow = false;
      if (priceFilter === '5000+' && price < 5000) showRow = false;
    }
    
    row.style.display = showRow ? '' : 'none';
  });
  
  updateResultCount();
}

// Sort table
function sortTable(column) {
  const tbody = document.getElementById('inventoryTableBody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // Determine sort direction
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.column = column;
    currentSort.direction = 'asc';
  }
  
  // Get column index
  const columnMap = { product: 1, sku: 2, category: 3, price: 4, stock: 5 };
  const columnIndex = columnMap[column];
  
  // Sort rows
  rows.sort((a, b) => {
    let aValue = a.cells[columnIndex].textContent.trim();
    let bValue = b.cells[columnIndex].textContent.trim();
    
    // Handle numeric columns
    if (column === 'price') {
      aValue = parseFloat(aValue.replace(/[₱,]/g, ''));
      bValue = parseFloat(bValue.replace(/[₱,]/g, ''));
    } else if (column === 'stock') {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    }
    
    if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Re-append sorted rows
  rows.forEach(row => tbody.appendChild(row));
}

// Toggle select all
function toggleSelectAll() {
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.row-checkbox');
  
  checkboxes.forEach(checkbox => {
    if (checkbox.closest('tr').style.display !== 'none') {
      checkbox.checked = selectAll.checked;
    }
  });
}

// Update result count
function updateResultCount() {
  const visibleRows = Array.from(document.querySelectorAll('#inventoryTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  document.getElementById('resultCount').textContent = `Showing ${visibleRows.length} items`;
  document.getElementById('showingStart').textContent = visibleRows.length > 0 ? '1' : '0';
  document.getElementById('showingEnd').textContent = visibleRows.length;
  document.getElementById('totalItems').textContent = visibleRows.length;
}

// View item
function viewItem(button) {
  const row = button.closest('tr');
  const product = row.cells[1].textContent.trim();
  const sku = row.cells[2].textContent.trim();
  const category = row.cells[3].textContent.trim();
  const price = row.cells[4].textContent.trim();
  const stock = row.cells[5].textContent.trim();
  
  alert(`Product Details:\n\nName: ${product}\nSKU: ${sku}\nCategory: ${category}\nPrice: ${price}\nStock: ${stock}`);
}

// Edit item
function editItem(button) {
  const row = button.closest('tr');
  const product = row.cells[1].textContent.trim();
  
  const newStock = prompt(`Edit stock quantity for ${product}:`, row.cells[5].textContent.trim());
  
  if (newStock !== null && !isNaN(newStock)) {
    const stockValue = parseInt(newStock);
    row.cells[5].textContent = stockValue;
    row.dataset.stock = stockValue;
    
    // Update status badge
    const statusBadge = row.cells[6].querySelector('.status-badge');
    if (stockValue > 10) {
      statusBadge.className = 'status-badge in-stock';
      statusBadge.textContent = 'In Stock';
    } else if (stockValue > 0) {
      statusBadge.className = 'status-badge low-stock';
      statusBadge.textContent = 'Low Stock';
    } else {
      statusBadge.className = 'status-badge out-of-stock';
      statusBadge.textContent = 'Out of Stock';
    }
    
    alert('Stock updated successfully!');
  }
}

// Delete item
function deleteItem(button) {
  const row = button.closest('tr');
  const product = row.cells[1].textContent.trim();
  
  if (confirm(`Are you sure you want to delete ${product}?`)) {
    row.remove();
    updateResultCount();
    alert('Item deleted successfully!');
  }
}

// Export data
function exportData() {
  const rows = Array.from(document.querySelectorAll('#inventoryTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  let csv = 'Product,SKU,Category,Price,Stock,Status\n';
  
  rows.forEach(row => {
    const cells = row.cells;
    const product = cells[1].textContent.trim();
    const sku = cells[2].textContent.trim();
    const category = cells[3].textContent.trim();
    const price = cells[4].textContent.trim();
    const stock = cells[5].textContent.trim();
    const status = cells[6].textContent.trim();
    
    csv += `"${product}","${sku}","${category}","${price}","${stock}","${status}"\n`;
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory_export.csv';
  a.click();
  window.URL.revokeObjectURL(url);
  
  alert('Data exported successfully!');
}

// Open add item modal
function openAddItemModal() {
  alert('Add Item Modal - This would open a form to add new items to inventory.\n\nFeatures:\n- Product name\n- SKU\n- Category selection\n- Price\n- Initial stock\n- Product image upload\n- Description');
}

// Pagination functions
function previousPage() {
  alert('Previous page functionality');
}

function nextPage() {
  alert('Next page functionality');
}