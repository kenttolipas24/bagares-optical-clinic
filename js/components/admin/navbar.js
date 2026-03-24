fetch('../components/admin/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
    setTimeout(() => switchTab('users'), 300);
  })
  .catch(error => console.error('Error loading navbar:', error));

function switchTab(pageId) {
  const usersTab = document.getElementById('usersTab-placeholder');
  const auditTab = document.getElementById('auditTab-placeholder');

  if (usersTab) usersTab.style.display = 'none';
  if (auditTab) auditTab.style.display = 'none';

  if (pageId === 'users' && usersTab) usersTab.style.display = 'block';
  if (pageId === 'audit' && auditTab) auditTab.style.display = 'block';

  document.querySelectorAll('.nav-button').forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';
    btn.classList.toggle('active', onclick.includes(`'${pageId}'`) || onclick.includes(`"${pageId}"`));
  });
}

window.switchTab  = switchTab;
window.changePage = switchTab;