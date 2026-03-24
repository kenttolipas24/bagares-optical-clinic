fetch('../components/optometrists/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
    changePage('appointment');
  })
  .catch(error => console.error('Error loading navbar:', error));

function changePage(pageId, event) {
  console.log('Switching to:', pageId);

  document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-button[onclick*="${pageId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const sections = [
    'Cal&Det-placeholder',
    'patient-record-placeholder',
    'eye-exam-results-placeholder',
    'reports-placeholder'
  ];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const map = {
    'appointment':      'Cal&Det-placeholder',
    'patient-record':   'patient-record-placeholder',
    'eye-exam-results': 'eye-exam-results-placeholder',
    'reports':          'reports-placeholder'
  };

  const target = document.getElementById(map[pageId]);
  if (target) target.style.display = 'block';
}

// Stubs to prevent "not defined" errors
window.toggleProfileDropdown = function() {};
window.handleNotification    = function() { alert('Notifications — Coming Soon!'); };