// Load reports.html
fetch('../components/manager/reports.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('reports-placeholder').innerHTML = data;
    setDefaultDates();
    attachSearchListener();
  })
  .catch(error => console.error('Error loading reports:', error));

// Attach search listener
function attachSearchListener() {
  const searchInput = document.getElementById('reportSearch');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterReportTable);
  }
}

// Filter report table by search
function filterReportTable() {
  const searchValue = document.getElementById('reportSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#inventory-report .report-table tbody tr');
  
  rows.forEach(row => {
    const productName = row.cells[0].textContent.toLowerCase();
    const category = row.cells[1].textContent.toLowerCase();
    
    if (productName.includes(searchValue) || category.includes(searchValue)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Generate Custom Report
function generateCustomReport() {
  alert('Custom Report Builder\n\nThis would open a modal with:\n- Select report type\n- Choose date range\n- Select columns to include\n- Add filters and conditions\n- Choose export format (PDF/Excel)\n- Schedule recurring reports');
}

// Auto-set today's date for date inputs
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const inventoryDate = document.getElementById('inventoryDate');
  
  if (inventoryDate) {
    inventoryDate.value = today;
  }
}