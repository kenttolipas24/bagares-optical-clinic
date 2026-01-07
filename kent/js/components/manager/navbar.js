
// Load navbar HTML
fetch('../components/manager/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
    
    // Set initial page
    changePage('inventory');
  })
  .catch(error => console.error('Error loading navbar:', error));

// Toggle dropdown menu
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(`${dropdownId}-dropdown`);
  const allDropdowns = document.querySelectorAll('.dropdown-menu');
  
  // Close other dropdowns
  allDropdowns.forEach(menu => {
    if (menu.id !== `${dropdownId}-dropdown`) {
      menu.classList.remove('show');
    }
  });
  
  // Toggle current dropdown
  dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('show');
    });
  }
});

// Main function to switch pages
function changePage(pageId, event) {
  if (event) {
    event.preventDefault();
  }
  
  console.log('Switching to:', pageId);
  
  // Hide ALL placeholders first
  const placeholders = [
    'frame-placeholder',
    'purchase-placeholder',
    'supplier-placeholder',
    'reports-placeholder'
  ];
  
  placeholders.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });
  
  // Show the correct placeholder based on pageId
  switch(pageId) {
    case 'inventory':
      document.getElementById('frame-placeholder').style.display = 'block';
      updateDropdownText('Inventory');
      break;
      
    case 'purchase-orders':
      document.getElementById('purchase-placeholder').style.display = 'block';
      updateDropdownText('Purchase Orders');
      break;
      
    case 'suppliers':
      document.getElementById('supplier-placeholder').style.display = 'block';
      updateDropdownText('Suppliers');
      break;
      
    // case 'sales-billing':
      // When you create sales-billing placeholder, add it here
      // document.getElementById('sales-billing-placeholder').style.display = 'block';
      // alert('Sales & Billing - Coming Soon!');
      // break;
      
    case 'reports':
      document.getElementById('reports-placeholder').style.display = 'block';
      break;
      
    default:
      console.log('Unknown page:', pageId);
  }
  
  // Close dropdown after selection
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('show');
  });
  
  // Update active state for nav buttons
  updateActiveButton(pageId);
}

// Update dropdown text
function updateDropdownText(text) {
  const dropdownText = document.getElementById('inventoryDropdownText');
  if (dropdownText) {
    dropdownText.textContent = text;
  }
}

// Update active button state
function updateActiveButton(pageId) {
  document.querySelectorAll('.nav-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to the correct button
  if (pageId === 'inventory' || pageId === 'purchase-orders' || pageId === 'suppliers') {
    const inventoryBtn = document.querySelector('.nav-dropdown .nav-button');
    if (inventoryBtn) inventoryBtn.classList.add('active');
  // } else if (pageId === 'sales-billing') {
  //   const salesBtn = document.querySelector('.nav-button[onclick*="sales-billing"]');
  //   if (salesBtn) salesBtn.classList.add('active');
  } else if (pageId === 'reports') {
    const reportsBtn = document.querySelector('.nav-button[onclick*="reports"]');
    if (reportsBtn) reportsBtn.classList.add('active');
  }
}

// Handle notification (placeholder function)
function handleNotification() {
  alert('Notifications - Coming Soon!');
}