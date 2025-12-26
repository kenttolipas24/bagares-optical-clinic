// Load the modal HTML
fetch('../components/modals/manager/reports-modal.html')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  })
  .then(data => {
    document.getElementById('custom-report-placeholder').innerHTML = data;
    attachModalListeners();
    loadExternalLibraries();
  })
  .catch(error => {
    console.error('Error loading custom report modal:', error);
  });

// Load external libraries for PDF and Excel generation
function loadExternalLibraries() {
  // Load jsPDF for PDF generation
  if (!window.jspdf) {
    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(jsPDFScript);
  }

  // Load jsPDF AutoTable for tables in PDF
  if (!window.jspdf || !window.jspdf.jsPDF.API.autoTable) {
    const autoTableScript = document.createElement('script');
    autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
    document.head.appendChild(autoTableScript);
  }

  // Load SheetJS for Excel generation
  if (!window.XLSX) {
    const xlsxScript = document.createElement('script');
    xlsxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(xlsxScript);
  }
}

// Attach all modal event listeners
function attachModalListeners() {
  const reportTypeSelect = document.getElementById('customReportType');
  if (reportTypeSelect) {
    reportTypeSelect.addEventListener('change', (e) => {
      populateColumns(e.target.value);
    });
  }

  const recurringCheckbox = document.getElementById('scheduleRecurring');
  if (recurringCheckbox) {
    recurringCheckbox.addEventListener('change', (e) => {
      const recurringOptions = document.getElementById('recurringOptions');
      if (recurringOptions) {
        recurringOptions.style.display = e.target.checked ? 'block' : 'none';
      }
    });
  }

  const modalOverlay = document.querySelector('.modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeCustomReportModal();
      }
    });
  }
}

// Columns for each report type
const columnOptions = {
  inventory: [
    'Product Name', 'SKU', 'Category', 'Current Stock',
    'Unit Price', 'Total Value', 'Status'
  ],
  purchases: [
    'PO Number', 'Date', 'Supplier', 'Items',
    'Amount', 'Status', 'Expected Delivery'
  ],
  sales: [
    'Invoice No.', 'Date', 'Customer', 'Product',
    'Quantity', 'Amount', 'Payment'
  ],
  'stock-movement': [
    'Date', 'Product', 'Type', 'Quantity',
    'Reference', 'Before', 'After', 'User'
  ]
};

// Sample data for each report type (Replace with real data from your database)
const sampleData = {
  inventory: [
    { 'Product Name': 'Ray-Ban Aviator', 'SKU': 'RB-AV-001', 'Category': 'Frames', 'Current Stock': 48, 'Unit Price': '₱400.00', 'Total Value': '₱19,200.00', 'Status': 'In Stock' },
    { 'Product Name': 'Progressive Lenses', 'SKU': 'PL-001', 'Category': 'Lenses', 'Current Stock': 30, 'Unit Price': '₱300.00', 'Total Value': '₱9,000.00', 'Status': 'In Stock' },
    { 'Product Name': 'Designer Reading Glasses', 'SKU': 'DG-002', 'Category': 'Frames', 'Current Stock': 5, 'Unit Price': '₱70.00', 'Total Value': '₱350.00', 'Status': 'Low Stock' },
    { 'Product Name': 'Blue Light Blocking Glasses', 'SKU': 'BL-003', 'Category': 'Frames', 'Current Stock': 25, 'Unit Price': '₱100.00', 'Total Value': '₱2,500.00', 'Status': 'In Stock' },
  ],
  purchases: [
    { 'PO Number': 'PO-2024-001', 'Date': '2024-12-20', 'Supplier': 'Vision Plus Supply', 'Items': 'Frames (50 units)', 'Amount': '₱25,000', 'Status': 'Received', 'Expected Delivery': '2024-12-25' },
    { 'PO Number': 'PO-2024-002', 'Date': '2024-12-22', 'Supplier': 'Lens Corp', 'Items': 'Lenses (100 units)', 'Amount': '₱30,000', 'Status': 'Pending', 'Expected Delivery': '2024-12-30' },
  ],
  sales: [
    { 'Invoice No.': 'INV-2024-124', 'Date': '2024-12-23', 'Customer': 'John Doe', 'Product': 'Ray-Ban Aviator', 'Quantity': 2, 'Amount': '₱8,000.00', 'Payment': 'Paid' },
    { 'Invoice No.': 'INV-2024-125', 'Date': '2024-12-24', 'Customer': 'Maria Santos', 'Product': 'Progressive Lenses', 'Quantity': 1, 'Amount': '₱2,500.00', 'Payment': 'Paid' },
  ],
  'stock-movement': [
    { 'Date': '2024-12-23', 'Product': 'Ray-Ban Aviator', 'Type': 'Stock Out', 'Quantity': -2, 'Reference': 'INV-2024-125', 'Before': 50, 'After': 48, 'User': 'Manager' },
    { 'Date': '2024-12-23', 'Product': 'Progressive Lenses', 'Type': 'Stock Out', 'Quantity': -2, 'Reference': 'INV-2024-125', 'Before': 10, 'After': 8, 'User': 'Cashier' },
  ]
};

// Open Custom Report Modal
function generateCustomReport() {
  const modal = document.getElementById('customReportModal');
  if (!modal) {
    console.error('Custom Report Modal not found');
    return;
  }

  const reportTypeSelect = document.getElementById('customReportType');
  if (reportTypeSelect) reportTypeSelect.value = 'inventory';

  const dateFrom = document.getElementById('customDateFrom');
  const dateTo = document.getElementById('customDateTo');
  
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split('T')[0];
  
  if (dateFrom) dateFrom.value = lastMonthStr;
  if (dateTo) dateTo.value = today;

  const recurringCheckbox = document.getElementById('scheduleRecurring');
  if (recurringCheckbox) recurringCheckbox.checked = false;

  const recurringOptions = document.getElementById('recurringOptions');
  if (recurringOptions) recurringOptions.style.display = 'none';

  populateColumns('inventory');
  modal.classList.add('active');
}

// Populate column options when report type changes
function populateColumns(type) {
  const select = document.getElementById('customColumns');
  if (!select) return;

  select.innerHTML = '';
  const options = columnOptions[type] || [];

  options.forEach(col => {
    const opt = document.createElement('option');
    opt.value = col;
    opt.textContent = col;
    opt.selected = true;
    select.appendChild(opt);
  });
}

// Close modal
function closeCustomReportModal() {
  const modal = document.getElementById('customReportModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Generate PDF Report
function generatePDFReport(reportType, selectedColumns, dateFrom, dateTo, data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text(`${reportType.replace('-', ' ').toUpperCase()} REPORT`, 14, 20);

  // Add report info
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Bagares Optical Clinic`, 14, 30);
  doc.text(`Date Range: ${dateFrom} to ${dateTo}`, 14, 36);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

  // Prepare table data
  const headers = [selectedColumns];
  const rows = data.map(item => 
    selectedColumns.map(col => item[col] || 'N/A')
  );

  // Add table
  doc.autoTable({
    head: headers,
    body: rows,
    startY: 50,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { top: 50 }
  });

  // Save the PDF
  const filename = `${reportType}-report-${new Date().getTime()}.pdf`;
  doc.save(filename);
}

// Generate Excel Report
function generateExcelReport(reportType, selectedColumns, dateFrom, dateTo, data) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare data with headers
  const wsData = [
    [`${reportType.toUpperCase()} REPORT`],
    ['Bagares Optical Clinic'],
    [`Date Range: ${dateFrom} to ${dateTo}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [], // Empty row
    selectedColumns, // Headers
    ...data.map(item => selectedColumns.map(col => item[col] || 'N/A'))
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = selectedColumns.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, reportType.substring(0, 30));

  // Save the file
  const filename = `${reportType}-report-${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Final generation with real download
function generateFinalCustomReport() {
  const type = document.getElementById('customReportType')?.value || 'inventory';
  const dateFrom = document.getElementById('customDateFrom')?.value || '';
  const dateTo = document.getElementById('customDateTo')?.value || '';
  
  const columnsSelect = document.getElementById('customColumns');
  const selectedCols = columnsSelect 
    ? Array.from(columnsSelect.selectedOptions).map(o => o.value)
    : [];

  const formatRadio = document.querySelector('input[name="exportFormat"]:checked');
  const format = formatRadio ? formatRadio.value : 'pdf';

  const recurringCheckbox = document.getElementById('scheduleRecurring');
  const recurring = recurringCheckbox ? recurringCheckbox.checked : false;

  const frequencySelect = document.getElementById('recurringFrequency');
  const frequency = recurring && frequencySelect ? frequencySelect.value : null;

  // Validation
  if (selectedCols.length === 0) {
    alert('Please select at least one column to include in the report.');
    return;
  }

  if (!dateFrom || !dateTo) {
    alert('Please select a valid date range.');
    return;
  }

  // Get data for the report type
  // TODO: Replace sampleData with real data from your database/API
  const reportData = sampleData[type] || [];

  if (reportData.length === 0) {
    alert('No data available for this report type.');
    return;
  }

  // Build summary
  let summary = `Custom ${type.replace('-', ' ')} report generated!\n\n`;
  summary += `Date Range: ${dateFrom} to ${dateTo}\n`;
  summary += `Columns: ${selectedCols.join(', ')}\n`;
  summary += `Format: ${format.toUpperCase()}\n`;
  if (recurring) summary += `Scheduled: ${frequency}\n`;
  summary += `\nReport is being prepared and will be downloaded shortly.`;

  alert(summary);

  // Generate report based on format
  setTimeout(() => {
    try {
      switch(format) {
        case 'pdf':
          generatePDFReport(type, selectedCols, dateFrom, dateTo, reportData);
          break;
        case 'excel':
          generateExcelReport(type, selectedCols, dateFrom, dateTo, reportData);
          break;
        default:
          alert('Invalid format selected');
          return;
      }
      
      console.log('Report downloaded successfully!');
      closeCustomReportModal();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please check console for details.');
    }
  }, 500);
}

// Make functions globally available
window.generateCustomReport = generateCustomReport;
window.closeCustomReportModal = closeCustomReportModal;
window.generateFinalCustomReport = generateFinalCustomReport;