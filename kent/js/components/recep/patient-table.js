// Load the patient table HTML content into the placeholder
fetch('../components/receptionist/patient-table.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('patient_table-placeholder').innerHTML = data;
    
    // Initialize table after loading
    initializePatientTable();
  })
  .catch(error => {
    console.error('Error loading patient table:', error);
  });

function initializePatientTable() {
  // Wait a bit for HTML to render
  setTimeout(() => {
    // Load and display initial data
    updatePatientTable();
    
    // Initialize search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.patient-table tbody tr');
        
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
      });
    }

    // Add event listeners for closing dropdown
    setupDropdownListeners();
  }, 100);
}

// Make updatePatientTable function global so modal can call it
window.updatePatientTable = function() {
  const tbody = document.querySelector('.patient-table tbody');
  if (!tbody) {
    console.error('Patient table body not found');
    return;
  }
  
  // Load patients from localStorage
  let patients = JSON.parse(localStorage.getItem('patients')) || [
    {
      id: 1,
      firstName: 'Kent Dave',
      middleInitial: 'E',
      lastName: 'Tolipas',
      email: 'kent@example.com',
      age: 28,
      dateOfBirth: '1997-03-15',
      address: 'balite',
      sex: 'Male',
      contactNumber: '09123456789',
      lastVisit: '11-24-2025',
      prescription: 'No prescription yet',
      status: 'Active'
    },
    {
      id: 2,
      firstName: 'Rechelle',
      middleInitial: 'P.',
      lastName: 'Aldea',
      email: 'rechelle@example.com',
      age: 25,
      dateOfBirth: '1999-05-07',
      address: 'Catubig',
      sex: 'Female',
      contactNumber: '09198765432',
      lastVisit: '07-05-2024',
      prescription: '+2.25 | -0.50 | 90\n+2.25 | -0.50 | 90',
      status: 'Active'
    }
  ];
  
  // Save to localStorage if it's the first time
  if (!localStorage.getItem('patients')) {
    localStorage.setItem('patients', JSON.stringify(patients));
  }
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  // Add all patients to table
  patients.forEach((patient) => {
    const fullName = `${patient.firstName} ${patient.middleInitial} ${patient.lastName}`;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${fullName}</td>
      <td>${patient.address}</td>
      <td>${patient.lastVisit}</td>
      <td>${patient.prescription.replace(/\n/g, '<br>')}</td>
      <td><span class="status ${patient.status.toLowerCase()}">${patient.status}</span></td>
      <td>
        <div class="action-btn-container">
          <button class="action-btn" onclick="toggleActionDropdown(event, ${patient.id})">⋮</button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Store current patient ID
let currentPatientId = null;

// Toggle action dropdown
window.toggleActionDropdown = function(event, patientId) {
  event.stopPropagation();
  
  const dropdown = document.getElementById('actionDropdown');
  const overlay = document.querySelector('.dropdown-overlay');
  const button = event.currentTarget;
  const isOpen = dropdown.classList.contains('show');
  
  // Close if already open
  if (isOpen && currentPatientId === patientId) {
    closeAllDropdowns();
    return;
  }
  
  // Close any open dropdown first
  closeAllDropdowns();
  
  // Store current patient ID
  currentPatientId = patientId;
  
  // Position dropdown relative to button
  const rect = button.getBoundingClientRect();
  dropdown.style.position = 'fixed';
  dropdown.style.top = `${rect.bottom + 5}px`;
  dropdown.style.left = `${rect.left - 150}px`; // Align to the right of button
  
  // Show dropdown and overlay
  dropdown.classList.add('show');
  overlay.classList.add('show');
}

// Close all dropdowns
window.closeAllDropdowns = function() {
  const dropdown = document.getElementById('actionDropdown');
  const overlay = document.querySelector('.dropdown-overlay');
  
  if (dropdown) dropdown.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
  currentPatientId = null;
}

// View patient
window.viewPatient = function() {
  console.log('View patient:', currentPatientId);
  
  // Get patient data
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    // Call your existing view patient modal function
    // window.openViewPatientModal(patient);
    alert(`Viewing patient: ${patient.firstName} ${patient.lastName}\n\nImplement your view patient modal here.`);
  }
  
  closeAllDropdowns();
}

// Edit patient
window.editPatient = function() {
  console.log('Edit patient:', currentPatientId);
  
  // Get patient data
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    // Call your existing edit patient modal function
    window.openPatientModal('edit', patient);
  }
  
  closeAllDropdowns();
}

// Remove patient
window.removePatient = function() {
  console.log('Remove patient:', currentPatientId);
  
  // Get patient data
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  const patient = patients.find(p => p.id === currentPatientId);
  
  if (patient) {
    if (confirm(`Are you sure you want to remove ${patient.firstName} ${patient.lastName}?`)) {
      // Remove patient from array
      patients = patients.filter(p => p.id !== currentPatientId);
      
      // Update localStorage
      localStorage.setItem('patients', JSON.stringify(patients));
      
      // Refresh table
      updatePatientTable();
      
      alert('Patient removed successfully.');
    }
  }
  
  closeAllDropdowns();
}

// Setup dropdown listeners
function setupDropdownListeners() {
  // Close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('actionDropdown');
    if (!dropdown) return;
    
    const isClickInside = dropdown.contains(event.target) || 
                         event.target.classList.contains('action-btn');
    
    if (!isClickInside) {
      closeAllDropdowns();
    }
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}