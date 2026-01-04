// audit-tab.js
fetch('../components/admin/audit-tab.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('auditTab-placeholder').innerHTML = data;
        
        // FIXED: Call renderAuditLogs() not renderAudit()
        renderAuditLogs();
    })
    .catch(error => console.error('Error loading audit tab:', error));

let auditLogs = [
    { id: 1, user: 'Juan Dela Cruz', action: 'Added new patient record', module: 'Patient Records', details: 'Added patient: Maria Clara Santos', timestamp: '2026-01-04 10:15 AM', ipAddress: '192.168.1.101' },
    { id: 2, user: 'Maria Santos', action: 'Created appointment', module: 'Appointments', details: 'Appointment scheduled for Dr. Garcia', timestamp: '2026-01-04 09:45 AM', ipAddress: '192.168.1.102' },
    { id: 3, user: 'Jose Mercado', action: 'Updated user role', module: 'User Management', details: 'Changed role from Staff to Receptionist', timestamp: '2026-01-04 09:30 AM', ipAddress: '192.168.1.100' },
    { id: 4, user: 'Dr. Pedro Garcia', action: 'Updated examination results', module: 'Eye Examination', details: 'Updated prescription for patient ID: 1234', timestamp: '2026-01-04 09:00 AM', ipAddress: '192.168.1.103' },
    { id: 5, user: 'Juan Dela Cruz', action: 'Processed sales transaction', module: 'Sales & Billing', details: 'Invoice #INV-2026-001 - ₱15,000.00', timestamp: '2026-01-04 08:30 AM', ipAddress: '192.168.1.101' },
    { id: 6, user: 'Jose Mercado', action: 'Generated inventory report', module: 'Reports', details: 'Generated stock movement report', timestamp: '2026-01-03 05:45 PM', ipAddress: '192.168.1.100' },
    { id: 7, user: 'Maria Santos', action: 'Updated stock levels', module: 'Inventory', details: 'Stock adjustment for Ray-Ban Aviator', timestamp: '2026-01-03 04:20 PM', ipAddress: '192.168.1.102' },
    { id: 8, user: 'Jose Mercado', action: 'Deleted user account', module: 'User Management', details: 'Removed inactive user: Test User', timestamp: '2026-01-03 02:10 PM', ipAddress: '192.168.1.100' }
];

function addAuditLog(action, module, details) {
    const newLog = {
        id: auditLogs.length + 1,
        user: 'Admin User',
        action,
        module,
        details,
        timestamp: new Date().toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: true
        }),
        ipAddress: '192.168.1.100'
    };
    auditLogs.unshift(newLog);
    renderAuditLogs();
}

function renderAuditLogs(filteredLogs = auditLogs) {
    const tbody = document.getElementById('auditsTableBody');

    if (!tbody) {
        console.error('auditsTableBody not found!');
        return;
    }

    if (filteredLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #6b7280;">No audit logs found</td></tr>';
        return;
    }

    const getModuleBadgeClass = (module) => {
        const map = {
            'User Management': 'badge-module',
            'Patient Records': 'badge-patient',
            'Appointments': 'badge-appointment',
            'Sales & Billing': 'badge-sales',
            'Inventory': 'badge-inventory',
            'System': 'badge-system',
            'Eye Examination': 'badge-exam',
            'Reports': 'badge-exam'
        };
        return map[module] || 'badge-module';
    };

    tbody.innerHTML = filteredLogs.map(log => `
        <tr>
            <td><div class="user-info">${log.user}</div></td>
            <td>${log.action}</td>
            <td><span class="badge ${getModuleBadgeClass(log.module)}">${log.module}</span></td>
            <td><div class="log-details">${log.details}</div></td>
            <td>${log.timestamp}</td>
            <td><span class="ip-address">${log.ipAddress}</span></td>
        </tr>
    `).join('');
}

function filterAuditLogs() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const moduleFilter = document.getElementById('roleFilter')?.value || 'all';

    const filtered = auditLogs.filter(log => {
        const matchesSearch = searchTerm === '' ||
            log.user.toLowerCase().includes(searchTerm) ||
            log.action.toLowerCase().includes(searchTerm) ||
            log.details.toLowerCase().includes(searchTerm);
        const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
        return matchesSearch && matchesModule;
    });

    renderAuditLogs(filtered);
}

function exportAuditLogs() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const moduleFilter = document.getElementById('roleFilter')?.value || 'all';

    const filtered = auditLogs.filter(log => {
        const matchesSearch = searchTerm === '' ||
            log.user.toLowerCase().includes(searchTerm) ||
            log.action.toLowerCase().includes(searchTerm) ||
            log.details.toLowerCase().includes(searchTerm);
        const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
        return matchesSearch && matchesModule;
    });

    const csv = [
        ['User', 'Action', 'Module', 'Details', 'Timestamp', 'IP Address'],
        ...filtered.map(log => [log.user, log.action, log.module, log.details, log.timestamp, log.ipAddress])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Export for global use
window.auditLogs = auditLogs;
window.addAuditLog = addAuditLog;
window.renderAuditLogs = renderAuditLogs;
window.filterAuditLogs = filterAuditLogs;
window.exportAuditLogs = exportAuditLogs;