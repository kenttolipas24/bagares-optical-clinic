/**
 * reports-modal.js - Bagares Optical Clinic
 * NATIVE INVENTORY EXPORT (No External Libraries)
 */

// 1. Load the modal HTML structure
fetch('../components/modals/manager/reports-modal.html')
  .then(res => res.text())
  .then(data => {
    const placeholder = document.getElementById('custom-report-placeholder');
    if (placeholder) {
        placeholder.innerHTML = data;
        populateColumns();
    }
  })
  .catch(err => console.error('Error loading reports modal:', err));

/**
 * POPULATE COLUMNS
 * Shows the ACTUAL columns that exist on the Reports table
 */
function populateColumns() {
  const select = document.getElementById('customColumns');
  if (!select) return;

  // We use the exact index (0-6) of the table columns as the value
  const columns = [
    { value: 0, label: 'Product Name' },
    { value: 1, label: 'Category' },
    { value: 2, label: 'Current Stock' },
    { value: 3, label: 'Transaction Type' },
    { value: 4, label: 'Date' },
    { value: 5, label: 'Quantity Changed' },
    { value: 6, label: 'User & Reason' }
  ];

  select.innerHTML = '';
  columns.forEach(col => {
    const opt = document.createElement('option');
    opt.value = col.value;
    opt.textContent = col.label;
    opt.selected = true; // Pre-select all for the user
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
 * Only exports the columns the user actually selected!
 */
window.generateFinalCustomReport = function() {
  const select = document.getElementById('customColumns');
  if (!select) return;

  // 1. Find out which columns the user highlighted in the modal
  const selectedIndexes = Array.from(select.selectedOptions).map(opt => parseInt(opt.value));

  if (selectedIndexes.length === 0) {
    alert("Please select at least one column to export.");
    return;
  }

  // 2. Grab the visible rows from the Reports table
  const visibleRows = Array.from(document.querySelectorAll('#reportTableBody tr'))
                           .filter(row => row.style.display !== 'none');

  // Prevent exporting the "No logs found" message
  if (visibleRows.length === 0 || (visibleRows.length === 1 && visibleRows[0].cells.length === 1)) {
    alert("There is no data to export based on your current filters.");
    window.closeCustomReportModal();
    return;
  }

  // 3. Set up the headers based ONLY on what was selected
  const allHeaders = ['Product Name', 'Category', 'Current Stock', 'Transaction Type', 'Date', 'Quantity Changed', 'User & Reason'];
  const headers = selectedIndexes.map(index => allHeaders[index]);
  const csvRows = [headers.join(',')];

  // 4. Map the table data to the selected columns
  visibleRows.forEach(row => {
    const cells = Array.from(row.cells);
    const rowData = selectedIndexes.map(index => {
      // If the cell exists, format it. We replace new lines with " | " so the User & Reason cell exports cleanly
      let text = cells[index] ? cells[index].innerText.replace(/\n/g, " | ").trim() : "";
      return `"${text.replace(/"/g, '""')}"`; 
    });
    csvRows.push(rowData.join(','));
  });

  // 5. Trigger the CSV Download
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Bagares_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  window.closeCustomReportModal();
};