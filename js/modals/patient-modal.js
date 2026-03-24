const SUPA_URL_PM = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const SUPA_KEY_PM = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';

fetch('../components/modals/patient-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('patient-modals-placeholder').innerHTML = data;
    initializePatientModal();
  })
  .catch(error => console.error('Error loading patient modal:', error));

function initializePatientModal() {
  const patientForm = document.getElementById('patientRecordForm');
  if (patientForm) {
    patientForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const firstname  = document.getElementById('patientFirstName')?.value?.trim() || '';
      const middlename = document.getElementById('patientMiddleInitial')?.value?.trim() || '';
      const lastname   = document.getElementById('patientLastName')?.value?.trim() || '';
      const suffix     = document.getElementById('patientSuffix')?.value?.trim() || '';
      const email      = document.getElementById('patientEmail')?.value?.trim() || '';
      const birthdate  = document.getElementById('patientDateOfBirth')?.value || '';
      const address    = document.getElementById('patientAddress')?.value?.trim() || '';
      const phone      = document.getElementById('patientContactNumber')?.value?.trim() || '';

      if (!firstname || !lastname || !birthdate) {
        alert('Please fill in all required fields: First Name, Last Name, and Date of Birth');
        return;
      }

      const patientId = patientForm.dataset.patientId;
      const isEdit = !!patientId;

      const payload = { firstname, middlename, lastname, suffix, email, birthdate, address, phone };

      const submitBtn = patientForm.querySelector('.patient-btn-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving...'; }

      try {
        let res;
        if (isEdit) {
          res = await fetch(
            `${SUPA_URL_PM}/rest/v1/patient_records?id=eq.${patientId}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': SUPA_KEY_PM,
                'Authorization': `Bearer ${SUPA_KEY_PM}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(payload)
            }
          );
        } else {
          res = await fetch(
            `${SUPA_URL_PM}/rest/v1/patient_records`,
            {
              method: 'POST',
              headers: {
                'apikey': SUPA_KEY_PM,
                'Authorization': `Bearer ${SUPA_KEY_PM}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(payload)
            }
          );
        }

        if (!res.ok) throw new Error(await res.text());

        alert(isEdit ? 'Patient updated successfully!' : 'Patient added successfully!');
        if (typeof window.updatePatientTable === 'function') window.updatePatientTable();
        closePatientModal();

      } catch (err) {
        console.error('Patient save error:', err);
        alert('Failed to save patient: ' + err.message);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = isEdit ? 'Update Patient' : 'Add Patient'; }
      }
    });
  }

  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('patient-modal-overlay')) closePatientModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('patientRecordModal');
      if (modal && modal.classList.contains('active')) closePatientModal();
    }
  });
}

window.openPatientModal = function(mode = 'add', patientData = null) {
  const modal = document.getElementById('patientRecordModal');
  if (!modal) { console.error('Patient modal not found!'); return; }

  const modalTitle = document.getElementById('patientModalTitle');
  const form = document.getElementById('patientRecordForm');
  const submitBtn = form.querySelector('.patient-btn-submit');

  if (mode === 'edit' && patientData) {
    modalTitle.textContent = 'Edit Patient';
    submitBtn.textContent = 'Update Patient';
    form.dataset.patientId = patientData.id;
    document.getElementById('patientFirstName').value    = patientData.firstname || '';
    document.getElementById('patientMiddleInitial').value = patientData.middlename || '';
    document.getElementById('patientLastName').value     = patientData.lastname || '';
    document.getElementById('patientSuffix').value       = patientData.suffix || '';
    document.getElementById('patientEmail').value        = patientData.email || '';
    document.getElementById('patientDateOfBirth').value  = patientData.birthdate || '';
    document.getElementById('patientAddress').value      = patientData.address || '';
    document.getElementById('patientContactNumber').value = patientData.phone || '';
  } else {
    modalTitle.textContent = 'Add Patient';
    submitBtn.textContent = 'Add Patient';
    delete form.dataset.patientId;
    form.reset();
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

window.closePatientModal = function() {
  const modal = document.getElementById('patientRecordModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}