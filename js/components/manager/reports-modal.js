/**
 * reports-modal.js - Bagares Optical Clinic
 * NATIVE INVENTORY EXPORT (No External Libraries)
 */

// 1. Load the modal HTML structure
fetch('../components/modals/manager/reports-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('custom-report-placeholder').innerHTML = data;
    // Initial setup of columns once the HTML is loaded
    populateColumns();
  })
  .catch(err => console.error('Error loading reports modal:', err));

/**
 * POPULATE COLUMNS
 * Automatically selects all inventory columns by default.
 */
function populateColumns() {
  const select = document.getElementById('customColumns');
  if (!select) return;

  const columns = [
    { value: 'product_name', label: 'Product Name' },
    { value: 'sku', label: 'SKU' },
    { value: 'category', label: 'Category' },
    { value: 'stock', label: 'Stock' },
    { value: 'price', label: 'Unit Price' }
  ];

  select.innerHTML = '';
  columns.forEach(col => {
    const opt = document.createElement('option');
    opt.value = col.value;
    opt.textContent = col.label;
    opt.selected = true; // Pre-select for the user
    select.appendChild(opt);
  });
}

/**
 * OPEN MODAL
 */
window.generateCustomReport = function() {
  const modal = document.getElementById('customReportModal');
  if (modal) modal.classList.add('active');
};

/**
 * CLOSE MODAL
 */
window.closeCustomReportModal = function() {
  const modal = document.getElementById('customReportModal');
  if (modal) modal.classList.remove('active');
};

/**
 * NATIVE CSV EXPORT
 * Scans the visible table to create the CSV file.
 */
window.generateFinalCustomReport = function() {
  const visibleRows = Array.from(document.querySelectorAll('#reportTableBody tr'))
                           .filter(row => row.style.display !== 'none');

  const headers = ['Product', 'Category', 'Stock', 'Status', 'Date', 'Quantity', 'User'];
  const csvRows = [headers.join(',')];

  visibleRows.forEach(row => {
    const rowData = Array.from(row.cells).map(cell => {
      // Clean text for CSV compatibility
      let text = cell.innerText.replace(/\n/g, " ").trim();
      return `"${text.replace(/"/g, '""')}"`;
    });
    csvRows.push(rowData.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Bagares_Report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  window.closeCustomReportModal();
};