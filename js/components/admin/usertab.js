/* ===============================
   SUPABASE CONFIG
================================ */
const SUPA_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';

const _supaH = {
  'apikey': SUPA_KEY,
  'Authorization': `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function _supaGet(table, params = '') {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}${params}`, { headers: _supaH });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function _supaPost(table, body) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, { method: 'POST', headers: _supaH, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function _supaPatch(table, body, params = '') {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}${params}`, { method: 'PATCH', headers: _supaH, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function _supaDelete(table, params = '') {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}${params}`, { method: 'DELETE', headers: _supaH });
  if (!res.ok) throw new Error(await res.text());
}

let users = [];

fetch('../components/admin/user-tab.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('usersTab-placeholder').innerHTML = html;
    loadUsers();
  })
  .catch(err => console.error('Error loading user tab:', err));

async function loadUsers() {
  try {
    const data = await _supaGet('user_accounts', '?order=created_at.desc');
    users = data;
    renderUsers();
  } catch (err) {
    console.error('Failed to load users:', err);
    const tbody = document.getElementById('usersTableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#dc2626;">Failed to load users.</td></tr>`;
  }
}

function renderUsers(filteredUsers = users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  if (!filteredUsers.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#6b7280">No users found</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredUsers.map(user => {
    const fullName = [
      user.firstname,
      user.middlename || '',
      user.lastname,
      user.suffix ? ', ' + user.suffix : ''
    ].filter(Boolean).join(' ').trim();

    const createdDate = user.created_at
      ? new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : 'N/A';

    return `
      <tr>
        <td>
          <div class="user-info">${fullName}</div>
          <div class="user-id">ID: ${user.id}</div>
        </td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><span class="badge badge-role">${user.role}</span></td>
        <td>${createdDate}</td>
      </tr>`;
  }).join('');
}

function filterUsers() {
  const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
  const roleFilter = document.getElementById('roleFilter')?.value || 'all';

  const filtered = users.filter(user => {
    const fullName = `${user.firstname} ${user.middlename || ''} ${user.lastname} ${user.suffix || ''}`.toLowerCase();
    return (
      (fullName.includes(searchTerm) ||
       user.email.toLowerCase().includes(searchTerm) ||
       user.username.toLowerCase().includes(searchTerm)) &&
      (roleFilter === 'all' || user.role === roleFilter)
    );
  });

  renderUsers(filtered);
}

async function addUser(userData) {
  try {
    await _supaPost('user_accounts', userData);
    await loadUsers();
    return { success: true };
  } catch (err) {
    console.error('Add user error:', err);
    return { success: false, error: err.message };
  }
}

async function editUser(id, updates) {
  try {
    await _supaPatch('user_accounts', updates, `?id=eq.${id}`);
    await loadUsers();
    return { success: true };
  } catch (err) {
    console.error('Edit user error:', err);
    return { success: false, error: err.message };
  }
}

async function deleteUser(id) {
  try {
    await _supaDelete('user_accounts', `?id=eq.${id}`);
    await loadUsers();
    return { success: true };
  } catch (err) {
    console.error('Delete user error:', err);
    return { success: false, error: err.message };
  }
}

// ✅ NO openAddUserModal here — addit.js owns it
window.loadUsers   = loadUsers;
window.filterUsers = filterUsers;
window.addUser     = addUser;
window.editUser    = editUser;
window.deleteUser  = deleteUser;