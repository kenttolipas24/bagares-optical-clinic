// Load the user tab HTML first, THEN render data
fetch('../components/admin/user-tab.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('usersTab-placeholder').innerHTML = data;
        renderUsers();
    })
    .catch(error => console.error('Error loading user tab:', error));

/*  */
let users = [];  

function renderUsers(filteredUsers = users) {
    const tbody = document.getElementById('usersTableBody');

    if (!tbody) {
        console.error('usersTableBody not found!');
        return;
    }

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:2rem; color:#6b7280;">
                    No users found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = filteredUsers.map(user => {
        const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}${user.suffix ? ', ' + user.suffix : ''}`;

        return `
        <tr>
            <td>
                <div class="user-info">${fullName}</div>
                <div class="user-id">ID: ${user.id}</div>
            </td>
            <td><span class="username">${user.username}</span></td>
            <td>${user.email}</td>
            <td><span class="badge badge-role">${user.role}</span></td>
            <td><span class="badge badge-status badge-${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${user.lastLogin}</td>
            <td>
                <div class="actions-menu">
                    <button class="action-menu-btn"
                        onclick="toggleActionsMenu(event, ${user.id})">
                        ⋮
                    </button>

                    <div class="actions-dropdown hidden" id="actions-dropdown-${user.id}">
                        <button class="dropdown-item" onclick="openEditUserModal(${user.id})">
                            Edit User
                        </button>
                        <button class="dropdown-item" onclick="resetPassword(${user.id})">
                            Reset Password
                        </button>
                        <button class="dropdown-item danger" onclick="deleteUser(${user.id})">
                            Delete User
                        </button>
                    </div>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('roleFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';

    const filtered = users.filter(user => {
        const fullName = `${user.firstname} ${user.middlename || ''} ${user.lastname} ${user.suffix || ''}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm);

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    renderUsers(filtered);
}

function toggleActionsMenu(event, userId) {
    event.stopPropagation();

    document.querySelectorAll('.actions-dropdown').forEach(dropdown => {
        if (dropdown.id !== `actions-dropdown-${userId}`) {
            dropdown.classList.add('hidden');
        }
    });

    const dropdown = document.getElementById(`actions-dropdown-${userId}`);
    dropdown.classList.toggle('hidden');
}

// Close dropdowns on outside click
document.addEventListener('click', () => {
    document.querySelectorAll('.actions-dropdown').forEach(dropdown => {
        dropdown.classList.add('hidden');
    });
});

/* Placeholder actions */
function openEditUserModal(id) {
    console.log('Edit user:', id);
}

function resetPassword(id) {
    console.log('Reset password for:', id);
}

function deleteUser(id) {
    console.log('Delete user:', id);
}

/* Export for future API / Add User modal */
window.users = users;
window.renderUsers = renderUsers;
window.filterUsers = filterUsers;
