// Load Edit User Modal
fetch('../components/modals/admin/EditUser-modal.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('editUser-modal-placeholder').innerHTML = data;
        console.log('Edit User modal loaded');
    })
    .catch(error => console.error('Failed to load Edit User modal:', error));

// === EDIT USER  ===

let currentEditUserId = null;

function openEditUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        alert('User not found!');
        return;
    }

    currentEditUserId = userId;

    // Fill the form
    document.getElementById('editfirstname').value = user.firstname;
    document.getElementById('editmiddlename').value = user.middlename || '';
    document.getElementById('editlastname').value = user.lastname;
    document.getElementById('editSuffix').value = user.suffix || '';
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editStatus').value = user.status;

    document.getElementById('editUserModal').classList.add('show');
}

function closeEditUserModal() {
    document.getElementById('editUserModal').classList.remove('show');
    currentEditUserId = null;
}

function saveEditedUser() {
    if (!currentEditUserId) return;

    const firstname = document.getElementById('editfirstname').value.trim();
    const middlename = document.getElementById('editmiddlename').value.trim();
    const lastname = document.getElementById('editlastname').value.trim();
    const username = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const role = document.getElementById('editRole').value;

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

    setTimeout(() => {
        const index = users.findIndex(u => u.id === currentEditUserId);
        if (index !== -1) {
            users[index] = {
                ...users[index],
                firstname,
                middlename,
                lastname,
                suffix: document.getElementById('editSuffix').value.trim(),
                username,
                email,
                role,
                status: document.getElementById('editStatus').value
            };

            // Optional: Add audit log
            if (window.addAuditLog) {
                const fullName = `${firstname} ${middlename} ${lastname}`.trim();
                window.addAuditLog('Updated user', 'User Management', `Edited user: ${fullName} (${role})`);
            }

            renderUsers(); // Refresh table
            closeEditUserModal();
            alert('User updated successfully!');
        }

        btn.disabled = false;
        btn.querySelector('.btn-text').classList.remove('hidden');
        btn.querySelector('.btn-loading').classList.add('hidden');
    }, 1000);
}

// Close on outside click or ESC
document.addEventListener('click', e => {
    const modal = document.getElementById('editUserModal');
    if (e.target === modal) closeEditUserModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('editUserModal')?.classList.contains('show')) {
        closeEditUserModal();
    }
});