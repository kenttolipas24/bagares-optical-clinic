fetch('modals/Vpatient/view-patient.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('view-patient-placeholder').innerHTML = data;
    
    // Initialize table after loading
    initializePatientTable();
  })