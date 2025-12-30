// patient record.js - FINAL WORKING VERSION

fetch('../components/optometrists/patient record.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('patient-record-placeholder').innerHTML = data;

    initializePatientRecords(); // Run everything after HTML is loaded
  })
  .catch(error => {
    console.error('Error loading patient record component:', error);
  });

function initializePatientRecords() {
  const patients = [
    { name: 'Rechelle P. Aldea', date: '07-05-2024', od: '+2.25 / -0.50 / 90', os: '+2.25 / -0.50 / 90', add: '2.50', pd: '65' },
    { name: 'Maria Santos', date: '2024-12-28', od: '+2.25 / -0.50 / 90', os: '+2.25 / -0.50 / 90', add: '2.50', pd: '65' },
    { name: 'Juan Dela Cruz', date: '2024-12-27', od: '+1.50 / -0.75 / 85', os: '+1.75 / -0.75 / 95', add: '2.25', pd: '63' },
    { name: 'Ana Reyes', date: '2024-12-26', od: '-1.25 / -0.50 / 180', os: '-1.00 / -0.50 / 175', add: '1.75', pd: '62' },
    { name: 'Pedro Garcia', date: '2024-12-20', od: '+3.00 / -1.00 / 90', os: '+2.75 / -1.25 / 85', add: '2.75', pd: '64' },
    { name: 'Lisa Gomez', date: '2024-12-15', od: '+2.50 / -0.75 / 90', os: '+2.25 / -0.50 / 95', add: '2.50', pd: '61' },
    { name: 'Carlos Rivera', date: '2024-12-10', od: '+1.75 / -1.00 / 85', os: '+2.00 / -0.75 / 90', add: '2.25', pd: '66' }
  ];

  let currentPatientIndex = -1;

  const tbody = document.getElementById('patientTable');
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('modal');
  const searchInput = document.getElementById('searchPatient'); // Now safe to get

  // Build table
  patients.forEach((p, i) => {
    const row = tbody.insertRow();
    row.insertCell(0).textContent = p.name;
    row.insertCell(1).textContent = p.date;
    row.insertCell(2).textContent = p.od;
    row.insertCell(3).textContent = p.os;
    row.insertCell(4).textContent = p.add;
    row.insertCell(5).textContent = p.pd;

    const actionsCell = row.insertCell(6);
    const btn = document.createElement('button');
    btn.className = 'actions-btn';
    btn.textContent = '⋯';
    btn.setAttribute('data-index', i);
    btn.onclick = (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const rect = e.target.getBoundingClientRect();
      showModal(rect.left - 120, rect.bottom + 5, idx);
    };
    actionsCell.appendChild(btn);
  });

  // Live Search - Now works perfectly
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();
      const rows = tbody.querySelectorAll('tr');

      rows.forEach(row => {
        const patientName = row.cells[0].textContent.toLowerCase();
        row.style.display = patientName.includes(query) ? '' : 'none';
      });
    });
  }

  // Modal functions
  function showModal(x, y, idx) {
    currentPatientIndex = idx;
    modal.innerHTML = `
      <button>View</button>
      <button>Edit</button>
      <button>Examine</button>
      <div class="modal-divider"></div>
      <button class="remove">Remove</button>
    `;
    modal.children[0].onclick = () => doAction('view');
    modal.children[1].onclick = () => doAction('edit');
    modal.children[2].onclick = () => doAction('examine');
    modal.children[4].onclick = () => doAction('remove');

    modal.style.left = x + 'px';
    modal.style.top = y + 'px';
    modal.style.display = 'block';
    overlay.style.display = 'block';
  }

  function doAction(action) {
    const patient = patients[currentPatientIndex];
    alert(`${action.toUpperCase()} Record\nPatient: ${patient.name}`);
    hideModal();
  }

  function hideModal() {
    modal.style.display = 'none';
    overlay.style.display = 'none';
  }

  overlay.onclick = hideModal;
}