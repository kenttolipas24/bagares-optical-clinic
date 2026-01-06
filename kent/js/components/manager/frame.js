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

// Fetch from database
// let inventoryData = [];

// async function fetchInventoryData() {
//   const response = await fetch('/api/inventory');
//   inventoryData = await response.json();
//   loadInventoryData();
// }

// Dummy data - Replace this with database fetch later
const inventoryData = [
  {
    name: 'Ray-Ban Aviator',
    initials: 'RB',
    sku: 'RB-AV-001',
    category: 'frames',
    price: 4000.00,
    stock: 20
  },
  {
    name: 'Essilor Progressive',
    initials: 'ES',
    sku: 'ES-PG-002',
    category: 'lenses',
    price: 2500.00,
    stock: 15
  },
  {
    name: 'Oakley Holbrook',
    initials: 'OK',
    sku: 'OK-HB-003',
    category: 'frames',
    price: 5500.00,
    stock: 5
  },
  {
    name: 'Zeiss Single Vision',
    initials: 'ZE',
    sku: 'ZE-SV-004',
    category: 'lenses',
    price: 1800.00,
    stock: 30
  },
  {
    name: 'Gucci Fashion Frame',
    initials: 'GU',
    sku: 'GU-FF-005',
    category: 'frames',
    price: 3200.00,
    stock: 0
  }
];

// Initialize inventory
function initializeInventory() {
  loadInventoryData();
  updateResultCount();
  
  const firstTab = document.querySelector('.tab');
  if (firstTab) {
    firstTab.classList.add('active');
  }
  filterByCategory('frames', true);
  
  // Close action menus when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.action-cell')) {
      closeAllActionMenus();
    }
  });
}

// Load inventory data into table
function loadInventoryData() {
  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = ''; // Clear existing data
  
  inventoryData.forEach(item => {
    const row = createTableRow(item);
    tbody.appendChild(row);
  });
}

// Create table row from data
function createTableRow(item) {
  const row = document.createElement('tr');
  row.dataset.category = item.category;
  row.dataset.price = item.price;
  row.dataset.stock = item.stock;
  
  // Get status
  const status = getStockStatus(item.stock);
  
  row.innerHTML = `
    <td>
      <div class="product-cell">
        <div class="product-image">${item.initials}</div>
        <span>${item.name}</span>
      </div>
    </td>
    <td>${item.sku}</td>
    <td><span class="category-badge ${item.category}">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span></td>
    <td>₱${item.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    <td>${item.stock}</td>
    <td><span class="status-badge ${status.class}">${status.text}</span></td>
    <td>
      <div class="action-cell">
        <button class="action-menu-btn" onclick="toggleActionMenu(event, this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
        <div class="action-menu">
          <button class="action-menu-item" onclick="openViewDetails(this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View Details
          </button>
          <button class="action-menu-item" onclick="editItem(this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Stock
          </button>
          <button class="action-menu-item danger" onclick="deleteItem(this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Delete Item
          </button>
        </div>
      </div>
    </td>
  `;
  
  return row;
}

// Get stock status
function getStockStatus(stock) {
  if (stock > 10) {
    return { class: 'in-stock', text: 'In Stock' };
  } else if (stock > 0) {
    return { class: 'low-stock', text: 'Low Stock' };
  } else {
    return { class: 'out-of-stock', text: 'Out of Stock' };
  }
}

// Toggle action menu
function toggleActionMenu(event, button) {
  event.stopPropagation();
  
  const actionCell = button.closest('.action-cell');
  const menu = actionCell.querySelector('.action-menu');
  const isCurrentlyOpen = menu.classList.contains('show');
  
  closeAllActionMenus();
  
  if (!isCurrentlyOpen) {
    menu.classList.add('show');
  }
}

// Close all action menus
function closeAllActionMenus() {
  document.querySelectorAll('.action-menu').forEach(menu => {
    menu.classList.remove('show');
  });
}

// Filter by category
function filterByCategory(category, isInitialLoad = false) {
  currentCategory = category;
  
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
    const productName = row.cells[0].textContent.toLowerCase();
    const sku = row.cells[1].textContent.toLowerCase();
    
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
  const rows = document.querySelectorAll('#inventoryTableBody tr');
  
  rows.forEach(row => {
    let showRow = true;
    
    if (currentCategory !== 'all' && row.dataset.category !== currentCategory) {
      showRow = false;
    }
    
    if (stockFilter !== 'all') {
      const stock = parseInt(row.dataset.stock);
      if (stockFilter === 'in-stock' && stock <= 0) showRow = false;
      if (stockFilter === 'low-stock' && (stock <= 0 || stock > 10)) showRow = false;
      if (stockFilter === 'out-of-stock' && stock > 0) showRow = false;
    }
    
    row.style.display = showRow ? '' : 'none';
  });
  
  updateResultCount();
}

// Sort table
function sortTable(column) {
  const tbody = document.getElementById('inventoryTableBody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.column = column;
    currentSort.direction = 'asc';
  }
  
  const columnMap = { product: 0, sku: 1, category: 2, price: 3, stock: 4 };
  const columnIndex = columnMap[column];
  
  rows.sort((a, b) => {
    let aValue = a.cells[columnIndex].textContent.trim();
    let bValue = b.cells[columnIndex].textContent.trim();
    
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
  
  rows.forEach(row => tbody.appendChild(row));
}

// Update result count
function updateResultCount() {
  const visibleRows = Array.from(document.querySelectorAll('#inventoryTableBody tr')).filter(
    row => row.style.display !== 'none'
  );
  
  document.getElementById('showingStart').textContent = visibleRows.length > 0 ? '1' : '0';
  document.getElementById('showingEnd').textContent = visibleRows.length;
  document.getElementById('totalItems').textContent = visibleRows.length;
}

// Open view details (placeholder for now)
function openViewDetails(button) {
  closeAllActionMenus();
  
  const row = button.closest('tr');
  const product = row.cells[0].textContent.trim();
  const sku = row.cells[1].textContent.trim();
  const category = row.cells[2].textContent.trim();
  const price = row.cells[3].textContent.trim();
  const stock = row.cells[4].textContent.trim();
  
  alert(`Product Details:\n\nName: ${product}\nSKU: ${sku}\nCategory: ${category}\nPrice: ${price}\nStock: ${stock}`);
}

// Edit item
function editItem(button) {
  closeAllActionMenus();
  
  const row = button.closest('tr');
  const product = row.cells[0].textContent.trim();
  
  const newStock = prompt(`Edit stock quantity for ${product}:`, row.cells[4].textContent.trim());
  
  if (newStock !== null && !isNaN(newStock)) {
    const stockValue = parseInt(newStock);
    row.cells[4].textContent = stockValue;
    row.dataset.stock = stockValue;
    
    const status = getStockStatus(stockValue);
    const statusBadge = row.cells[5].querySelector('.status-badge');
    statusBadge.className = `status-badge ${status.class}`;
    statusBadge.textContent = status.text;
    
    alert('Stock updated successfully!');
  }
}

// Delete item
function deleteItem(button) {
  closeAllActionMenus();
  
  const row = button.closest('tr');
  const product = row.cells[0].textContent.trim();
  
  if (confirm(`Are you sure you want to delete ${product}?`)) {
    row.remove();
    updateResultCount();
    alert('Item deleted successfully!');
  }
}

// Pagination functions
function previousPage() {
  alert('Previous page functionality');
}

function nextPage() {
  alert('Next page functionality');
}