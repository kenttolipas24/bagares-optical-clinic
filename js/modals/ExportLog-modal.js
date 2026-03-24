// Load the modal HTML
fetch('../components/modals/admin/ExportLog-modal.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('exportlog-placeholder').innerHTML = data;
        console.log('Export Logs modal loaded (pure vanilla)');
    })
    .catch(error => console.error('Failed to load export modal:', error));

function openExportLogsModal() {
    // Copy current filter dates
    const fromFilter = document.getElementById('dateFromFilter');
    const toFilter = document.getElementById('dateToFilter');

    document.getElementById('exportDateFrom').value = fromFilter?.value || '';
    document.getElementById('exportDateTo').value = toFilter?.value || '';

    document.getElementById('exportLogsModal').classList.add('show');
}

function closeExportLogsModal() {
    document.getElementById('exportLogsModal').classList.remove('show');
}

function getExportLogs() {
    const includeFilters = document.getElementById('includeCurrentFilters').checked;
    const fromDate = document.getElementById('exportDateFrom').value;
    const toDate = document.getElementById('exportDateTo').value;

    let logs = auditLogs;

    // Apply current table filters if checked
    if (includeFilters) {
        logs = getFilteredLogs();
    }

    // Apply custom date range if specified
    if (fromDate || toDate) {
        logs = logs.filter(log => {
            const logDatePart = log.timestamp.split(', ')[0]; // "01/05/2026"
            const [month, day, year] = logDatePart.split('/');
            const logDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            if (fromDate && logDate < fromDate) return false;
            if (toDate && logDate > toDate) return false;
            return true;
        });
    }

    return logs;
}

function exportCSVOnly() {
    const logs = getExportLogs();

    if (logs.length === 0) {
        alert('No audit logs match your selected criteria.');
        return;
    }

    const btn = document.getElementById('confirmExportBtn');
    btn.disabled = true;
    btn.querySelector('.btn-text').classList.add('hidden');
    btn.querySelector('.btn-loading').classList.remove('hidden');

    // Simulate processing
    setTimeout(() => {
        const headers = ['User', 'Action', 'Module', 'Details', 'Timestamp', 'IP Address'];
        const rows = logs.map(log => [
            log.user,
            log.action,
            log.module,
            log.details,
            log.timestamp,
            log.ipAddress
        ]);

        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            const escapedRow = row.map(cell => 
                `"${(cell || '').toString().replace(/"/g, '""')}"`
            );
            csvContent += escapedRow.join(',') + '\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `bagares_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        closeExportLogsModal();
        alert(`${logs.length} audit logs exported successfully as CSV!`);

        // Reset button
        btn.disabled = false;
        btn.querySelector('.btn-text').classList.remove('hidden');
        btn.querySelector('.btn-loading').classList.add('hidden');
    }, 1000);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('exportLogsModal');
    if (e.target === modal) {
        closeExportLogsModal();
    }
});

// Close with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeExportLogsModal();
    }
});