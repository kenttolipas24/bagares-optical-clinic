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
    'condemnation-placeholder',
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
      const framePlaceholder = document.getElementById('frame-placeholder');
      if (framePlaceholder) {
        framePlaceholder.style.display = 'block';
        updateDropdownText('Inventory');
      }
      break;
      
    case 'condemnation':
      const condemnPlaceholder = document.getElementById('condemnation-placeholder');
      if (condemnPlaceholder) {
        condemnPlaceholder.style.display = 'block';
        updateDropdownText('Condemnation');
        
        // Initialize condemnation with delay to ensure HTML is loaded
        setTimeout(() => {
          if (typeof initCondemnation === 'function') {
            initCondemnation();
          }
        }, 100);
      } else {
        console.error('condemnation-placeholder not found!');
      }
      break;

    // case 'condemnation':
    //   const condemnationPlaceholder = document.getElementById('condemnation-placeholder');
    //   if(condemnationPlaceholder) {
    //     condemnationPlaceholder.style.display = 'block';
    //     updateDropdownText('Condemnation');
    //   }
    //   break;

    case 'purchase':
      const purchasePlaceholder = document.getElementById('purchase-placeholder');
      if (purchasePlaceholder) {
        purchasePlaceholder.style.display = 'block';
        updateDropdownText('Purchase');
      }
      break;

    case 'supplier':
      const supplierPlaceholder = document.getElementById('supplier-placeholder');
      if (supplierPlaceholder) {
        supplierPlaceholder.style.display = 'block';
        updateDropdownText('Supplier');
      }
      break;
      
    case 'reports':
      const reportsPlaceholder = document.getElementById('reports-placeholder');
      if (reportsPlaceholder) {
        reportsPlaceholder.style.display = 'block';
      }
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

// ✅ ADD THIS MISSING FUNCTION
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
  if (pageId === 'inventory' || pageId === 'condemnation') {
    const inventoryBtn = document.querySelector('.nav-dropdown .nav-button');
    if (inventoryBtn) inventoryBtn.classList.add('active');
  } else if (pageId === 'reports') {
    const reportsBtn = document.querySelector('.nav-button[onclick*="reports"]');
    if (reportsBtn) reportsBtn.classList.add('active');
  }
}

// Handle notification (placeholder function)
function handleNotification() {
  alert('Notifications - Coming Soon!');
}