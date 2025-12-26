// Load reports.html
fetch('../components/manager/reports.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('reports-placeholder').innerHTML = data;
  })
  .catch(error => console.error('Error loading reports:', error));

// Switch report tabs
function switchReportTab(tabName) {
  // Remove active class from all tabs and contents
  document.querySelectorAll('.report-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.report-content').forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked tab
  event.target.closest('.report-tab').classList.add('active');
  
  // Show corresponding content
  const contentMap = {
    'inventory': 'inventory-report',
    'purchases': 'purchases-report',
    'sales': 'sales-report',
    'stock-movement': 'stock-movement-report'
  };
  
  const contentId = contentMap[tabName];
  if (contentId) {
    document.getElementById(contentId).classList.add('active');
  }
}

// Inventory Report Functions
function applyInventoryFilters() {
  const category = document.getElementById('inventoryCategory').value;
  const stock = document.getElementById('inventoryStock').value;
  const date = document.getElementById('inventoryDate').value;
  
  console.log('Applying inventory filters:', { category, stock, date });
  alert(`Inventory filters applied!\nCategory: ${category}\nStock Level: ${stock}\nDate: ${date || 'Current'}`);
}

function exportInventoryReport() {
  alert('Exporting Inventory Report to PDF...\n\nReport will include:\n- Total items summary\n- Stock levels by category\n- Product details\n- Value calculations\n- Generated on: ' + new Date().toLocaleDateString());
  
  // Simulate PDF download
  console.log('Generating inventory report PDF...');
}

// Purchases Report Functions
function applyPurchaseFilters() {
  const dateFrom = document.getElementById('purchaseDateFrom').value;
  const dateTo = document.getElementById('purchaseDateTo').value;
  const supplier = document.getElementById('purchaseSupplier').value;
  const status = document.getElementById('purchaseStatus').value;
  
  console.log('Applying purchase filters:', { dateFrom, dateTo, supplier, status });
  alert(`Purchase filters applied!\nDate Range: ${dateFrom || 'Start'} to ${dateTo || 'End'}\nSupplier: ${supplier}\nStatus: ${status}`);
}

function exportPurchaseReport() {
  alert('Exporting Purchases Report to PDF...\n\nReport will include:\n- All purchase orders\n- Supplier details\n- Order status\n- Total amounts\n- Payment terms\n- Generated on: ' + new Date().toLocaleDateString());
  
  console.log('Generating purchases report PDF...');
}

// Sales Report Functions
function applySalesFilters() {
  const dateFrom = document.getElementById('salesDateFrom').value;
  const dateTo = document.getElementById('salesDateTo').value;
  const category = document.getElementById('salesCategory').value;
  
  console.log('Applying sales filters:', { dateFrom, dateTo, category });
  alert(`Sales filters applied!\nDate Range: ${dateFrom || 'Start'} to ${dateTo || 'End'}\nCategory: ${category}`);
}

function exportSalesReport() {
  alert('Exporting Sales Report to PDF...\n\nReport will include:\n- Total revenue\n- Transaction details\n- Top selling products\n- Payment breakdown\n- Sales trends\n- Generated on: ' + new Date().toLocaleDateString());
  
  console.log('Generating sales report PDF...');
}

// Stock Movement Report Functions
function applyMovementFilters() {
  const dateFrom = document.getElementById('movementDateFrom').value;
  const dateTo = document.getElementById('movementDateTo').value;
  const type = document.getElementById('movementType').value;
  const search = document.getElementById('movementSearch').value;
  
  console.log('Applying movement filters:', { dateFrom, dateTo, type, search });
  alert(`Stock Movement filters applied!\nDate Range: ${dateFrom || 'Start'} to ${dateTo || 'End'}\nType: ${type}\nSearch: ${search || 'All'}`);
}

function exportMovementReport() {
  alert('Exporting Stock Movement Report to PDF...\n\nReport will include:\n- All stock movements\n- In/Out transactions\n- Adjustments\n- User actions\n- Before/After quantities\n- Reference numbers\n- Generated on: ' + new Date().toLocaleDateString());
  
  console.log('Generating stock movement report PDF...');
}

// Generate Custom Report
function generateCustomReport() {
  alert('Custom Report Builder\n\nThis would open a modal with:\n- Select report type\n- Choose date range\n- Select columns to include\n- Add filters and conditions\n- Choose export format (PDF/Excel)\n- Schedule recurring reports');
}

// Print Report Function (can be called from any report)
function printCurrentReport() {
  window.print();
}

// Auto-set today's date for date inputs (helper function)
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = document.querySelectorAll('input[type="date"]');
  
  dateInputs.forEach(input => {
    if (input.id.includes('To') || input.id === 'inventoryDate') {
      input.value = today;
    }
  });
}

// Initialize dates when reports load
setTimeout(() => {
  if (document.getElementById('inventoryDate')) {
    setDefaultDates();
  }
}, 500);