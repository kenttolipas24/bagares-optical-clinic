// reports.js

// Load the reports HTML component
fetch('../components/optometrists/reports.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('reports-placeholder').innerHTML = data;
    
    // Initialize reports after HTML is loaded
    initializeReports();
  })
  .catch(error => {
    console.error('Error loading reports component:', error);
  });

// Initialize all reports functionality
function initializeReports() {
  console.log('Reports module initialized');
  
  // Make switchTab function global so onclick handlers work
  window.switchTab = switchTab;
  
  // Initialize event listeners
  initializeFilters();
  initializeActionButtons();
  initializePagination();
  initializeSearch();
  initializeGenerateButton();
}

// Tab switching functionality
function switchTab(tabId) {
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Remove active class from all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Add active class to clicked button
  event.target.classList.add('active');

  // Show corresponding tab content
  document.getElementById(tabId + '-tab').classList.add('active');
}

// Initialize filter buttons
function initializeFilters() {
  const applyBtns = document.querySelectorAll('.apply-btn');
  applyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      console.log('Applying filters...');
      // Add your filter logic here
      alert('Filters applied successfully!');
    });
  });
}

// Initialize action buttons (Print, PDF, Excel)
function initializeActionButtons() {
  const actionBtns = document.querySelectorAll('.action-btn');
  
  actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const btnText = this.textContent;
      
      if (btnText.includes('Print')) {
        window.print();
      } else if (btnText.includes('PDF')) {
        console.log('Exporting to PDF...');
        alert('PDF export functionality - to be implemented');
      } else if (btnText.includes('Excel')) {
        console.log('Exporting to Excel...');
        alert('Excel export functionality - to be implemented');
      }
    });
  });

  // View and More action buttons in table
  const iconBtns = document.querySelectorAll('.icon-action-btn');
  iconBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.title === 'View') {
        console.log('Viewing record...');
        alert('View record functionality - to be implemented');
      } else if (this.title === 'More') {
        console.log('Showing more options...');
        alert('More options - Edit, Delete, etc.');
      }
    });
  });
}

// Initialize pagination
function initializePagination() {
  const pageBtns = document.querySelectorAll('.page-btn');
  pageBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.textContent.includes('Prev') || this.textContent.includes('Next')) {
        console.log('Navigating pages...');
        // Add pagination logic here
      } else if (!this.textContent.includes('...')) {
        // Remove active from all
        pageBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        this.classList.add('active');
        console.log('Loading page:', this.textContent);
        // Add page loading logic here
      }
    });
  });
}

// Initialize search functionality (real-time)
function initializeSearch() {
  const searchInputs = document.querySelectorAll('.filter-input[placeholder*="Search"]');
  searchInputs.forEach(input => {
    input.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      console.log('Searching for:', searchTerm);
      
      // Get the parent tab content
      const tabContent = this.closest('.tab-content');
      const tableRows = tabContent.querySelectorAll('.report-table tbody tr');
      
      // Filter table rows
      tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
}

// Initialize Generate Custom Report button
function initializeGenerateButton() {
  const generateBtn = document.querySelector('.generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', function() {
      console.log('Opening custom report generator...');
      alert('Custom Report Generator - to be implemented\n\nThis will allow you to:\n- Select multiple report types\n- Choose custom date ranges\n- Combine data from different reports\n- Export in various formats');
    });
  }
}

// Optional: Add sorting functionality
function sortTable(columnIndex, tabId) {
  const table = document.querySelector(`#${tabId}-tab .report-table`);
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  rows.sort((a, b) => {
    const aText = a.cells[columnIndex].textContent;
    const bText = b.cells[columnIndex].textContent;
    return aText.localeCompare(bText);
  });
  
  rows.forEach(row => tbody.appendChild(row));
}

// Optional: Add date range filter
function filterByDateRange(fromDate, toDate, tabId) {
  const table = document.querySelector(`#${tabId}-tab .report-table`);
  const rows = table.querySelectorAll('tbody tr');
  
  rows.forEach(row => {
    const dateCell = row.cells[1]; // Assuming date is in 2nd column
    const rowDate = new Date(dateCell.textContent);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (rowDate >= from && rowDate <= to) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}