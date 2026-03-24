const _EE_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _EE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _EE_H = { 'apikey': _EE_KEY, 'Authorization': `Bearer ${_EE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

fetch('../components/modals/optometrist/eye-exam-modal.html')
  .then(res => res.text())
  .then(data => {
    const placeholder = document.getElementById('eye-exam-modal-placeholder');
    if (placeholder) placeholder.innerHTML = data;
  })
  .catch(error => console.error('Error loading eye exam modal:', error));

let currentExamPatientId = null;
let currentExamBookingId = null;

window.openEyeExamModal = async function(patientId, bookingId = null) {
  // ── Guard: don't open if patientId is null/undefined ──
  if (!patientId || patientId === 'null' || patientId === 'undefined') {
    console.error('openEyeExamModal called with invalid patientId:', patientId);
    alert('Cannot open eye exam — patient ID is missing. Please try again.');
    return;
  }

  const modal = document.getElementById('eye-exam-modal');
  if (!modal) { console.error('Eye exam modal not found in DOM'); return; }

  currentExamPatientId = patientId;
  currentExamBookingId = bookingId;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  try {
    const res = await fetch(
      `${_EE_URL}/rest/v1/patient_records?id=eq.${patientId}&select=*`,
      { headers: _EE_H }
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const patient = data[0];
    if (!patient) {
      console.error('Patient not found for ID:', patientId);
      alert('Patient record not found for ID: ' + patientId);
      closeEyeExamModal();
      return;
    }

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    const fullName = `${patient.firstname} ${patient.middlename || ''} ${patient.lastname}`.trim();
    el('patientName',    fullName);
    el('patientAge',     patient.birthdate ? calculateAge(patient.birthdate) + ' years old' : '—');
    el('patientBirthdate', patient.birthdate || '—');
    el('patientEmail',   patient.email   || '—');
    el('patientAddress', patient.address || '—');

    const dateInput = document.getElementById('examDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    // Load most recent existing exam if any
    const examRes = await fetch(
      `${_EE_URL}/rest/v1/eye_exams?patient_id=eq.${patientId}&order=exam_date.desc&limit=1`,
      { headers: _EE_H }
    );
    if (examRes.ok) {
      const exams = await examRes.json();
      if (exams.length) populateExamData(exams[0]);
    }

  } catch (err) {
    console.error('Error loading patient for eye exam:', err);
    alert('Error loading patient info: ' + err.message);
    closeEyeExamModal();
  }
};

function calculateAge(birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() - birth.getMonth() < 0 ||
     (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function populateExamData(exam) {
  const fields = ['od_sph','od_cyl','od_axis','od_add','os_sph','os_cyl','os_axis','os_add','pd'];
  fields.forEach(f => { const e = document.getElementById(f); if (e) e.value = exam[f] || ''; });
  const lt = document.getElementById('lensType');     if (lt) lt.value = exam.lens_type     || '';
  const lm = document.getElementById('lensMaterial'); if (lm) lm.value = exam.lens_material || '';
  const n  = document.getElementById('examNotes');    if (n)  n.value  = exam.notes         || '';
  const d  = document.getElementById('examDate');
  if (d && exam.exam_date) d.value = exam.exam_date;
}

function resetExamForm() {
  document.querySelectorAll('#eye-exam-modal input:not([readonly]), #eye-exam-modal select, #eye-exam-modal textarea')
    .forEach(el => { el.type === 'checkbox' ? el.checked = false : el.value = ''; });
}

window.closeEyeExamModal = function() {
  const modal = document.getElementById('eye-exam-modal');
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; }
  resetExamForm();
  currentExamPatientId = null;
  currentExamBookingId = null;
};

window.saveEyeExam = async function() {
  if (!currentExamPatientId) { alert('No patient selected'); return; }

  const v = id => document.getElementById(id)?.value || null;
  const examDate = v('examDate');
  if (!examDate) { alert('Please select exam date'); return; }

  const payload = {
    od_sph:     v('od_sph'),  od_cyl:  v('od_cyl'),  od_axis: v('od_axis'),
    os_sph:     v('os_sph'),  os_cyl:  v('os_cyl'),  os_axis: v('os_axis'),
    exam_date:  examDate
  };

  try {
    // Save directly to patient_records
    const res = await fetch(
      `${_EE_URL}/rest/v1/patient_records?id=eq.${currentExamPatientId}`,
      { method: 'PATCH', headers: _EE_H, body: JSON.stringify(payload) }
    );
    if (!res.ok) throw new Error(await res.text());

    // Also save to eye_exams for history
    await fetch(`${_EE_URL}/rest/v1/eye_exams`, {
      method: 'POST', headers: _EE_H,
      body: JSON.stringify({
        patient_id:    currentExamPatientId,
        booking_id:    currentExamBookingId || null,
        exam_date:     examDate,
        od_sph:        v('od_sph'),  od_cyl:  v('od_cyl'),  od_axis: v('od_axis'), od_add: v('od_add'),
        os_sph:        v('os_sph'),  os_cyl:  v('os_cyl'),  os_axis: v('os_axis'), os_add: v('os_add'),
        pd:            v('pd'),
        lens_type:     v('lensType'),
        lens_material: v('lensMaterial'),
        notes:         v('examNotes')
      })
    });

    alert('Eye examination saved successfully!');
    closeEyeExamModal();
    if (typeof window.updatePatientTable === 'function') window.updatePatientTable(typeof currentFilter !== 'undefined' ? currentFilter : 'no-exam');
    if (typeof window.loadExamResults === 'function') window.loadExamResults();

  } catch (err) {
    console.error('Save eye exam error:', err);
    alert('Error saving examination: ' + err.message);
  }
};

window.addEventListener('click', e => {
  const m = document.getElementById('eye-exam-modal');
  if (e.target === m) closeEyeExamModal();
});

document.addEventListener('keydown', e => {
  const m = document.getElementById('eye-exam-modal');
  if (e.key === 'Escape' && m?.classList.contains('active')) closeEyeExamModal();
});