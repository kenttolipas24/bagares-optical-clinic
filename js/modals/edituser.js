// edituser.js
// SUPA_URL and SUPA_KEY are declared in usertab.js — do not redeclare here

fetch('../components/modals/admin/EditUser-modal.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('editUser-modal-placeholder').innerHTML = data;
        console.log('Edit User modal loaded');
    })
    .catch(error => console.error('Failed to load Edit User modal:', error));

let currentEditUserId = null;

function openEditUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) { alert('User not found!'); return; }

    currentEditUserId = userId;

    document.getElementById('editfirstname').value  = user.firstname;
    document.getElementById('editmiddlename').value = user.middlename || '';
    document.getElementById('editlastname').value   = user.lastname;
    document.getElementById('editSuffix').value     = user.suffix || '';
    document.getElementById('editUsername').value   = user.username;
    document.getElementById('editEmail').value      = user.email;
    document.getElementById('editRole').value       = user.role;
    document.getElementById('editStatus').value     = user.status || 'active';

    document.getElementById('editUserModal').classList.add('show');
}

function closeEditUserModal() {
    document.getElementById('editUserModal').classList.remove('show');
    currentEditUserId = null;
}

async function saveEditedUser() {
    if (!currentEditUserId) return;

    const firstname  = document.getElementById('editfirstname').value.trim();
    const middlename = document.getElementById('editmiddlename').value.trim();
    const lastname   = document.getElementById('editlastname').value.trim();
    const suffix     = document.getElementById('editSuffix').value.trim();
    const username   = document.getElementById('editUsername').value.trim();
    const email      = document.getElementById('editEmail').value.trim();
    const role       = document.getElementById('editRole').value;
    const status     = document.getElementById('editStatus').value;

    if (!firstname || !lastname || !username || !email || !role) {
        alert('Please fill in all required fields.');
        return;
    }
    if (username.length < 4) {
        alert('Username must be at least 4 characters.');
        return;
    }

    const btn = document.getElementById('saveEditBtn');
    btn.disabled = true;
    btn.querySelector('.btn-text').classList.add('hidden');
    btn.querySelector('.btn-loading').classList.remove('hidden');

    try {
        const res = await fetch(
            `${SUPA_URL}/rest/v1/user_accounts?id=eq.${currentEditUserId}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPA_KEY,
                    'Authorization': `Bearer ${SUPA_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ firstname, middlename, lastname, suffix, username, email, role, status })
            }
        );

        if (!res.ok) throw new Error(await res.text());

        if (typeof loadUsers === 'function') await loadUsers();
        closeEditUserModal();
        alert('User updated successfully!');

    } catch (err) {
        console.error('Edit user error:', err);
        alert('Failed to update user: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.querySelector('.btn-text').classList.remove('hidden');
        btn.querySelector('.btn-loading').classList.add('hidden');
    }
}

document.addEventListener('click', e => {
    const modal = document.getElementById('editUserModal');
    if (e.target === modal) closeEditUserModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('editUserModal')?.classList.contains('show')) {
        closeEditUserModal();
    }
});

window.openEditUserModal  = openEditUserModal;
window.closeEditUserModal = closeEditUserModal;
window.saveEditedUser     = saveEditedUser;