// Load HTML first, THEN render data
fetch('../components/admin/user-tab.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('usersTab-placeholder').innerHTML = data;
        renderUsers();
    })
    .catch(error => console.error('Error loading user tab:', error));

let users = [
    { 
        id: 1, 
        firstname: 'Juan', middlename: 'Dela', lastname: 'Cruz', suffix: '', 
        username: 'juan.delacruz', 
        email: 'juan@bagares.com', 
        role: 'Secretary/Cashier', 
        status: 'Active', 
        lastLogin: '2026-01-04 09:30 AM', 
        createdDate: '2025-12-01' 
    },
    { 
        id: 2, 
        firstname: 'Maria', middlename: '', lastname: 'Santos', suffix: '', 
        username: 'maria.santos', 
        email: 'maria@bagares.com', 
        role: 'Manager', 
        status: 'Active', 
        lastLogin: '2026-01-04 08:15 AM', 
        createdDate: '2025-12-05' 
    },
    { 
        id: 3, 
        firstname: 'Pedro', middlename: '', lastname: 'Garcia', suffix: 'MD', 
        username: 'pedro.garcia', 
        email: 'pedro@bagares.com', 
        role: 'Optometrist', 
        status: 'Active', 
        lastLogin: '2026-01-03 04:20 PM', 
        createdDate: '2025-11-20' 
    },
    { 
        id: 4, 
        firstname: 'Ana', middlename: '', lastname: 'Reyes', suffix: '', 
        username: 'ana.reyes', 
        email: 'ana@bagares.com', 
        role: 'Secretary/Cashier', 
        status: 'Inactive', 
        lastLogin: '2025-12-28 02:10 PM', 
        createdDate: '2025-11-15' 
    },
    { 
        id: 5, 
        firstname: 'Jose', middlename: '', lastname: 'Mercado', suffix: '', 
        username: 'jose.mercado', 
        email: 'jose@bagares.com', 
        role: 'Admin', 
        status: 'Active', 
        lastLogin: '2026-01-04 10:00 AM', 
        createdDate: '2025-11-01' 
    }
];

function renderUsers(filteredUsers = users) {
    const tbody = document.getElementById('usersTableBody');

    if (!tbody) {
        console.error('usersTableBody not found!');
        return;
    }

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">No users found</td></tr>';
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
                    <button class="action-menu-btn" onclick="toggleActionsMenu(event, ${user.id})" title="More actions">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                    
                    <div class="actions-dropdown hidden" id="actions-dropdown-${user.id}">
                        <button class="dropdown-item" onclick="openEditUserModal(${user.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            Edit User
                        </button>
                        <button class="dropdown-item" onclick="resetPassword(${user.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Reset Password
                        </button>
                        <button class="dropdown-item danger" onclick="deleteUser(${user.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            Delete User
                        </button>
                    </div>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('roleFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';

    const filtered = users.filter(user => {
        const fullName = `${user.firstname} ${user.middlename || ''} ${user.lastname} ${user.suffix || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm) ||
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
    
    // Close all other dropdowns
    document.querySelectorAll('.actions-dropdown').forEach(dropdown => {
        if (dropdown.id !== `actions-dropdown-${userId}`) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Toggle current one
    const dropdown = document.getElementById(`actions-dropdown-${userId}`);
    dropdown.classList.toggle('hidden');
}

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.actions-dropdown').forEach(dropdown => {
        dropdown.classList.add('hidden');
    });
});

// Placeholder functions (implement these in your main app)
function openEditUserModal(id) {
    console.log('Edit user:', id);
    alert(`Edit user ${id} (implement openEditUserModal)`);
}

function resetPassword(id) {
    if (confirm(`Reset password for user ${id}?`)) {
        console.log('Reset password for:', id);
        alert('Password reset! (implement resetPassword)');
    }
}

function deleteUser(id) {
    if (confirm(`Delete user ${id}? This cannot be undone.`)) {
        const index = users.findIndex(u => u.id === id);
        if (index > -1) {
            users.splice(index, 1);
            renderUsers();
            filterUsers();
            alert('User deleted!');
        }
    }
}

// Export for global use (for your Add User modal)
window.users = users;
window.renderUsers = renderUsers;
window.filterUsers = filterUsers;