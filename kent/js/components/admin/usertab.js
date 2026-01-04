// Load HTML first, THEN render data
fetch('../components/admin/user-tab.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('usersTab-placeholder').innerHTML = data;
        
        // NOW render the users after HTML is loaded
        renderUsers();
    })
    .catch(error => console.error('Error loading user tab:', error));

let users = [
    { id: 1, name: 'Juan Dela Cruz', username: 'juan.delacruz', email: 'juan@bagares.com', role: 'Staff', status: 'Active', lastLogin: '2026-01-04 09:30 AM', createdDate: '2025-12-01' },
    { id: 2, name: 'Maria Santos', username: 'maria.santos', email: 'maria@bagares.com', role: 'Receptionist', status: 'Active', lastLogin: '2026-01-04 08:15 AM', createdDate: '2025-12-05' },
    { id: 3, name: 'Dr. Pedro Garcia', username: 'pedro.garcia', email: 'pedro@bagares.com', role: 'Optometrist', status: 'Active', lastLogin: '2026-01-03 04:20 PM', createdDate: '2025-11-20' },
    { id: 4, name: 'Ana Reyes', username: 'ana.reyes', email: 'ana@bagares.com', role: 'Staff', status: 'Inactive', lastLogin: '2025-12-28 02:10 PM', createdDate: '2025-11-15' },
    { id: 5, name: 'Jose Mercado', username: 'jose.mercado', email: 'jose@bagares.com', role: 'Admin', status: 'Active', lastLogin: '2026-01-04 10:00 AM', createdDate: '2025-11-01' }
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

    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>
                <div class="user-info">${user.name}</div>
                <div class="user-id">ID: ${user.id}</div>
            </td>
            <td><span class="username">${user.username}</span></td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role.toLowerCase()}">${user.role}</span></td>
            <td><span class="badge badge-${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${user.lastLogin}</td>
            <td>
                <div class="actions">
                    <button class="action-btn action-edit" onclick="openEditUserModal(${user.id})" title="Edit User">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button class="action-btn action-reset" onclick="resetPassword(${user.id})" title="Reset Password">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </button>
                    <button class="action-btn action-delete" onclick="deleteUser(${user.id})" title="Delete User">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('roleFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';

    const filtered = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) ||
                              user.email.toLowerCase().includes(searchTerm) ||
                              user.username.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    renderUsers(filtered);
}

// Export for global use
window.users = users;
window.renderUsers = renderUsers;
window.filterUsers = filterUsers;