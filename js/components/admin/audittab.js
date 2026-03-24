// audit-tab.js
fetch('../components/admin/audit-tab.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('auditTab-placeholder').innerHTML = data;
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

let currentPage = 1;
const logsPerPage = 10;

function addAuditLog(action, module, details, user = 'Current User') {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    const newLog = {
        id: auditLogs.length + 1,
        user,
        action,
        module,
        details,
        timestamp,
        ipAddress: '192.168.1.100'
    };
    auditLogs.unshift(newLog);
    renderAuditLogs();
}

function renderAuditLogs() {
    const filtered = getFilteredLogs();
    const totalLogs = filtered.length;
    const totalPages = Math.ceil(totalLogs / logsPerPage);
    const start = (currentPage - 1) * logsPerPage;
    const end = Math.min(start + logsPerPage, totalLogs);
    const pageLogs = filtered.slice(start, end);

    const tbody = document.getElementById('auditsTableBody');
    if (!tbody) return;

    if (pageLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: #6b7280;">No audit logs found</td></tr>';
    } else {
        tbody.innerHTML = pageLogs.map(log => `
            <tr>
                <td><div class="user-info">${log.user}</div></td>
                <td><div class="log-action">${log.action}</div></td>
                <td><span class="badge badge-module">${log.module}</span></td>
                <td><div class="log-details">${log.details}</div></td>
                <td><div class="log-timestamp">${log.timestamp}</div></td>
                <td><span class="ip-address">${log.ipAddress}</span></td>
            </tr>
        `).join('');
    }

    // Update pagination info
    document.getElementById('auditShowingStart').textContent = totalLogs === 0 ? 0 : start + 1;
    document.getElementById('auditShowingEnd').textContent = end;
    document.getElementById('totalAudits').textContent = totalLogs;

    // Update page buttons
    updatePagination(totalPages);
}

function getFilteredLogs() {
    const searchTerm = (document.getElementById('auditSearch')?.value || '').toLowerCase();
    const moduleFilter = document.getElementById('moduleFilter')?.value || 'all';
    const dateFrom = document.getElementById('dateFromFilter')?.value;
    const dateTo = document.getElementById('dateToFilter')?.value;

    return auditLogs.filter(log => {
        const matchesSearch = !searchTerm ||
            log.user.toLowerCase().includes(searchTerm) ||
            log.action.toLowerCase().includes(searchTerm) ||
            log.details.toLowerCase().includes(searchTerm) ||
            log.module.toLowerCase().includes(searchTerm);

        const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;

        // Date filtering (simple string compare on YYYY-MM-DD part)
        let matchesDate = true;
        if (dateFrom || dateTo) {
            const logDate = log.timestamp.split(', ')[0]; // e.g., "01/04/2026"
            const [month, day, year] = logDate.split('/');
            const logDateStr = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;

            if (dateFrom && logDateStr < dateFrom) matchesDate = false;
            if (dateTo && logDateStr > dateTo) matchesDate = false;
        }

        return matchesSearch && matchesModule && matchesDate;
    });
}

function filterAuditLogs() {
    currentPage = 1;
    renderAuditLogs();
}

function changePage(delta) {
    const filtered = getFilteredLogs();
    const totalPages = Math.ceil(filtered.length / logsPerPage);
    currentPage = Math.max(1, Math.min(totalPages, currentPage + delta));
    renderAuditLogs();
}

function updatePagination(totalPages) {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-number';
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => {
            currentPage = i;
            renderAuditLogs();
        };
        pageNumbers.appendChild(btn);
    }

    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === totalPages || totalPages === 0;
}

function exportAuditLogs() {
    const filtered = getFilteredLogs();
    if (filtered.length === 0) {
        alert('No logs to export.');
        return;
    }

    const headers = ['User', 'Action', 'Module', 'Details', 'Timestamp', 'IP Address'];
    const rows = filtered.map(log => [
        log.user, log.action, log.module, log.details, log.timestamp, log.ipAddress
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Global exports
window.auditLogs = auditLogs;
window.addAuditLog = addAuditLog;
window.renderAuditLogs = renderAuditLogs;
window.filterAuditLogs = filterAuditLogs;
window.exportAuditLogs = exportAuditLogs;