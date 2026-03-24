// ================================================
// Custom Report Modal - Fixed for Real API Integration
// ================================================

// Load the modal HTML
fetch('../components/modals/optometrist/report-modal.html')
  .then(res => {
    if (!res.ok) throw new Error(`Failed to load modal HTML: HTTP ${res.status}`);
    return res.text();
  })
  .then(html => {
    const placeholder = document.getElementById('custom-report-placeholder');
    if (placeholder) {
      placeholder.innerHTML = html;
      console.log('Custom report modal HTML loaded successfully');
      attachModalListeners();
      populateColumnOptions();
    } else {
      console.error('Element #custom-report-placeholder not found in DOM');
    }
  })
  .catch(err => {
    console.error('Error loading custom report modal:', err);
  });

// Attach modal event listeners
function attachModalListeners() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeCustomReportModal();
      }
    });
  }

  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCustomReportModal);
  }

  const reportType = document.getElementById('customReportType');
  if (reportType) {
    reportType.addEventListener('change', populateColumnOptions);
  }

  console.log('Modal listeners attached');
}

// Column mapping: Display Name -> API Field Name
const columnMappings = {
  inventory: {
    'Product Name': 'product_name',
    'SKU': 'sku',
    'Category': 'category',
    'Quantity': 'current_stock',
    'Unit Price': 'unit_price',
    'Total Value': 'total_value',
    'Status': 'status'
  },
  sales: {
    'Date': 'sale_date',
    'Invoice Number': 'sale_id',
    'Product Name': 'product_summary',
    'Quantity Sold': 'total_quantity',
    'Total Amount': 'total_amount',
    'Customer Name': 'patient_name',
    'Payment Method': 'payment_status'
  },
  patient: {
    'Patient Name': 'full_name',
    'Age': 'age',
    'Contact Number': 'phone',
    'Address': 'address',
    'Last Exam Date': 'last_exam_date',
    'ADD': 'add',
    'PD': 'pd'
  },
  Condemnation: {
    'Product Name': 'product_name',
    'SKU': 'sku',
    'Category': 'category',
    'Quantity': 'quantity',
    'Reason': 'reason',
    'Date Condemned': 'condemned_date',
    'Unit Price': 'unit_price',
    'Total Loss': 'total_loss',
    'Notes': 'notes'
  }
};

// Populate column options based on report type
function populateColumnOptions() {
  const reportType = document.getElementById('customReportType')?.value || 'inventory';
  const columnsSelect = document.getElementById('customColumns');
  
  if (!columnsSelect) return;

  const columnOptions = {
    inventory: ['Product Name', 'SKU', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Status'],
    sales: ['Date', 'Invoice Number', 'Product Name', 'Quantity Sold', 'Total Amount', 'Customer Name', 'Payment Method'],
    patient: ['Patient Name', 'Age', 'Contact Number', 'Address', 'Last Exam Date', 'ADD', 'PD'],
    Condemnation: ['Product Name', 'SKU', 'Category', 'Quantity', 'Reason', 'Date Condemned', 'Unit Price', 'Total Loss', 'Notes']
  };

  columnsSelect.innerHTML = '';

  const columns = columnOptions[reportType] || columnOptions.inventory;
  columns.forEach(col => {
    const option = document.createElement('option');
    option.value = col;
    option.textContent = col;
    option.selected = true;
    columnsSelect.appendChild(option);
  });
}

// Open the modal
function generateCustomReport() {
  const modal = document.getElementById('customReportModal');
  if (!modal) {
    console.warn('Custom Report Modal not found yet. HTML may still be loading...');
    alert('Modal is loading... Please wait a second and try again.');
    return;
  }

  modal.classList.add('active');

  const reportType = document.getElementById('customReportType');
  if (reportType) reportType.value = 'inventory';

  const dateFrom = document.getElementById('customDateFrom');
  const dateTo = document.getElementById('customDateTo');
  if (dateFrom && dateTo) {
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    dateFrom.value = lastMonth.toISOString().split('T')[0];
    dateTo.value = today;
  }

  populateColumnOptions();
  console.log('Custom report modal opened');
}

// Close modal
function closeCustomReportModal() {
  const modal = document.getElementById('customReportModal');
  if (modal) {
    modal.classList.remove('active');
    console.log('Custom report modal closed');
  }
}

// Generate the final report
function generateFinalCustomReport() {
  const modal = document.getElementById('customReportModal');
  if (!modal) return;

  const type = document.getElementById('customReportType')?.value || 'inventory';
  const dateFrom = document.getElementById('customDateFrom')?.value || '';
  const dateTo = document.getElementById('customDateTo')?.value || '';
  const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv';

  const columnsSelect = document.getElementById('customColumns');
  const selectedCols = Array.from(columnsSelect.selectedOptions).map(opt => opt.value);

  if (selectedCols.length === 0) {
    alert('Please select at least one column.');
    return;
  }
  if (!dateFrom || !dateTo) {
    alert('Please select a valid date range.');
    return;
  }

  if (new Date(dateFrom) > new Date(dateTo)) {
    alert('Start date cannot be after end date.');
    return;
  }

  console.log('Report Parameters:', {
    type,
    dateFrom,
    dateTo,
    format,
    columns: selectedCols
  });

  fetchReportData(type, dateFrom, dateTo, selectedCols, format);
}

// Fetch report data from API
function fetchReportData(reportType, dateFrom, dateTo, columns, format) {
  const generateBtn = document.querySelector('.generate-final-btn');
  const originalText = generateBtn.textContent;
  generateBtn.textContent = 'Generating...';
  generateBtn.disabled = true;

  // Build API URL based on report type
  let apiUrl = `/bagares(html)/api/get_${reportType}_report.php`;
  
  // Add date parameters for sales report
  if (reportType === 'sales') {
    apiUrl += `?date_from=${dateFrom}&date_to=${dateTo}`;
  }

  fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(response => {
      if (!response.success) {
        throw new Error(response.error || 'API returned error');
      }
      
      // Extract data array from response
      const data = response.data || [];
      
      if (data.length === 0) {
        alert('No data found for the selected criteria.');
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        return;
      }

      downloadReport(reportType, columns, dateFrom, dateTo, data, format);
      
      generateBtn.textContent = originalText;
      generateBtn.disabled = false;
      
      closeCustomReportModal();
    })
    .catch(err => {
      console.error('Error fetching report data:', err);
      alert('Failed to generate report: ' + err.message);
      generateBtn.textContent = originalText;
      generateBtn.disabled = false;
    });
}

// Download report
function downloadReport(reportType, columns, dateFrom, dateTo, data, format) {
  if (format === 'csv' || format === 'excel') {
    downloadCSV(reportType, columns, dateFrom, dateTo, data);
  }
}

// Download as CSV file
function downloadCSV(reportType, columns, dateFrom, dateTo, data) {
  // Get the field mappings for this report type
  const fieldMap = columnMappings[reportType] || {};
  
  // Map display column names to API field names
  const apiFields = columns.map(col => fieldMap[col] || col);
  
  // Create CSV header (use display names)
  const header = columns.join(',');
  
  // Create CSV rows
  const rows = data.map(row => {
    return apiFields.map(field => {
      const value = row[field] !== undefined && row[field] !== null ? row[field] : '';
      // Escape commas and quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  // Combine into final CSV
  const csv = [
    `${reportType.toUpperCase()} REPORT`,
    `Date Range: ${dateFrom} to ${dateTo}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Total Records: ${data.length}`,
    '',
    header,
    ...rows
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${reportType}-report-${dateFrom}-to-${dateTo}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('CSV report downloaded successfully');
}

// Make functions globally available
window.generateCustomReport = generateCustomReport;
window.closeCustomReportModal = closeCustomReportModal;
window.generateFinalCustomReport = generateFinalCustomReport;