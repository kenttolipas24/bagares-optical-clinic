const _VD_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _VD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _VD_H = { 'apikey': _VD_KEY, 'Authorization': `Bearer ${_VD_KEY}` };

fetch('../components/modals/manager/view-details-modal.html')
    .then(res => res.text())
    .then(data => {
        const placeholder = document.getElementById('action-viewdetails-modal');
        if (placeholder) placeholder.innerHTML = data;
    })
    .catch(error => console.error('Error loading view-details-modal.html:', error));

let currentViewingProduct = null;

window.openViewDetails = function (itemId) {
    let product = null;
    if (window.inventoryData && Array.isArray(window.inventoryData)) {
        product = window.inventoryData.find(item => item.id == itemId || item.inventory_id == itemId);
    }
    if (!product) { alert('Product not found. Please refresh the page.'); return; }
    currentViewingProduct = product;

    // Refresh stock from Supabase then show modal
    fetch(`${_VD_URL}/rest/v1/inventory?id=eq.${itemId}&select=*`, { headers: _VD_H })
        .then(res => res.json())
        .then(data => {
            if (data[0]) product.stock_quantity = data[0].stock_quantity;
            populateViewDetailsModal(product);
            const modal = document.getElementById('viewDetailsModal');
            if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
        })
        .catch(() => {
            populateViewDetailsModal(product);
            const modal = document.getElementById('viewDetailsModal');
            if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
        });
};

function populateViewDetailsModal(product) {
    const stock = parseInt(product.stock_quantity ?? product.stock ?? 0);
    const initials = product.initials || product.product_name?.substring(0, 2).toUpperCase() || '??';
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

    el('viewProductInitials', initials);
    el('viewProductName', product.product_name || 'Unknown');
    el('viewProductSKU', product.sku || 'N/A');
    el('viewProductPrice', formatCurrency(product.price || 0));
    el('viewProductBrand', product.brand || 'N/A');
    el('viewProductStock', stock);

    const catBadge = document.getElementById('viewProductCategory');
    if (catBadge) { catBadge.textContent = product.category || 'N/A'; catBadge.className = `category-badge ${product.category || ''}`; }

    const statusBadge = document.getElementById('viewProductStatus');
    if (statusBadge) {
        if (stock > 10) { statusBadge.textContent = 'In Stock'; statusBadge.className = 'status-badge in-stock'; }
        else if (stock > 0) { statusBadge.textContent = 'Low Stock'; statusBadge.className = 'status-badge low-stock'; }
        else { statusBadge.textContent = 'Out of Stock'; statusBadge.className = 'status-badge out-of-stock'; }
    }

    populateStockHistory(product);
}

function populateStockHistory(product) {
    const historyBody = document.getElementById('stockHistoryBody');
    if (!historyBody) return;
    historyBody.innerHTML = `<tr class="empty-state"><td colspan="4">No stock history available</td></tr>`;
    // Stock history requires a separate log table — skipped for now
    // Wire this up later when you create a stock_logs table in Supabase
}

function formatCurrency(num) {
    return '₱' + parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

window.closeViewDetailsModal = function () {
    const modal = document.getElementById('viewDetailsModal');
    if (modal) { modal.classList.remove('show'); document.body.style.overflow = ''; }
    currentViewingProduct = null;
};

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeViewDetailsModal();
});