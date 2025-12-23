// Load the navbar.html content into the placeholder (if needed)
fetch('../components/manager/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
  })
  .catch(error => console.error('Error loading navbar:', error));

// Change to a specific page
function changePage(pageId, event) {
  console.log(`[v0] Changing to page: ${pageId}`);

  // Prevent default link behavior if event exists
  event?.preventDefault();

  // Hide all pages
  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.remove("active");
  });

  // Handle specific page loading
  switch (pageId) {
    case 'purchase-orders':
      fetch('module/purchase_order.html')
        .then(res => res.text())
        .then(data => {
          const contentArea = document.getElementById('main-content') || document.body; // Adjust target ID as needed
          contentArea.innerHTML = data;
        })
        .catch(error => console.error('Error loading purchase_order.html:', error));
      break;
    case 'inventory':
    case 'suppliers':
    case 'sales-billing':
      // Show existing page if it exists
      const targetPage = document.getElementById(`${pageId}-page`);
      if (targetPage) {
        targetPage.classList.add("active");
      }
      break;
    default:
      console.log("Unknown page ID");
  }

  // Close all dropdowns
  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    menu.classList.remove("show");
    menu.closest(".nav-dropdown")?.classList.remove("active");
  });
}

// Toggle dropdown menu
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(`${dropdownId}-dropdown`);
  const navDropdown = dropdown.closest(".nav-dropdown");

  // Close all other dropdowns
  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    if (menu !== dropdown) {
      menu.classList.remove("show");
      menu.closest(".nav-dropdown")?.classList.remove("active");
    }
  });

  // Toggle current dropdown
  dropdown.classList.toggle("show");
  navDropdown.classList.toggle("active");
}

// Navigation handlers
function handleNavigation(section) {
  console.log(`Navigating to ${section} section`);
  switch (section) {
    case "patient":
      alert("Navigating to Patient section");
      // Add actual navigation logic here (e.g., window.location.href)
      break;
    case "appointment":
      alert("Navigating to Appointment section");
      // Add actual navigation logic here
      break;
    default:
      console.log("Unknown navigation section");
  }
}

// Handle notification click (to be implemented)
function handleNotification() {
  console.log("Notification clicked");
  // Add notification logic here
}

// Handle profile click (to be implemented)
function handleProfile() {
  console.log("Profile clicked");
  // Add profile logic here
}

// Add interactive features on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Bagares Optical Clinic header loaded successfully");

  // Add hover effects or active state
  const navButtons = document.querySelectorAll(".nav-button");
  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      navButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
    });
  });
});

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-dropdown")) {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      menu.classList.remove("show");
      menu.closest(".nav-dropdown")?.classList.remove("active");
    });
  }
});