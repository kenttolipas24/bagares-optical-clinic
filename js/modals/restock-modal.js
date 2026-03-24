const _RS_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _RS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _RS_H = { 'apikey': _RS_KEY, 'Authorization': `Bearer ${_RS_KEY}`, 'Content-Type': 'application/json' };

fetch('../components/modals/manager/restock-modal.html')
    .then(res => res.text())
    .then(data => {
        const placeholder = document.getElementById('restock-modal-placeholder');
        if (placeholder) placeholder.innerHTML = data;
    })
    .catch(error => console.error('Error loading restock-modal.html:', error));

let currentRestockProduct = null;

window.restockItem = function (itemId) {
    let product = null;
    if (window.inventoryData && Array.isArray(window.inventoryData)) {
        product = window.inventoryData.find(item =>
            item.id == itemId || item.inventory_id == itemId || item.sku == itemId
        );
    }
    if (!product) {
        const tableRows = document.querySelectorAll('#inventoryTableBody tr');
        for (let row of tableRows) {
            if (row.dataset.inventoryId == itemId) {
                const cells = row.cells;
                product = {
                    id: row.dataset.inventoryId,
                    product_name: cells[0]?.querySelector('.product-cell span')?.textContent.trim() || 'Unknown',
                    initials: cells[0]?.querySelector('.product-image')?.textContent.trim() || '??',
                    sku: cells[1]?.textContent.trim() || 'N/A',
                    stock_quantity: cells[4]?.textContent.trim() || '0'
                };
                break;
            }
        }
    }
    if (!product) { alert('Product not found. Please try again.'); return; }
    currentRestockProduct = product;
    populateRestockModal(product);
    const modal = document.getElementById('restockModal');
    if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
    const form = document.getElementById('restockForm');
    if (form) form.reset();
};

function populateRestockModal(product) {
    const stock = parseInt(product.stock_quantity ?? product.stock ?? 0);
    const initials = product.initials || product.product_name?.substring(0, 2).toUpperCase() || '??';
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('restockProductInitials', initials);
    el('restockProductName', product.product_name || product.name || 'Unknown');
    el('restockProductSKU', product.sku || 'N/A');
    el('restockCurrentStock', stock);
    const statusBadge = document.getElementById('restockCurrentStatus');
    if (statusBadge) {
        if (stock > 10) { statusBadge.textContent = 'In Stock'; statusBadge.className = 'status-badge in-stock'; }
        else if (stock > 0) { statusBadge.textContent = 'Low Stock'; statusBadge.className = 'status-badge low-stock'; }
        else { statusBadge.textContent = 'Out of Stock'; statusBadge.className = 'status-badge out-of-stock'; }
    }
}

window.handleRestockSubmit = async function (event) {
    event.preventDefault();
    if (!currentRestockProduct) { alert('No product selected'); return; }
    const quantity = parseInt(document.getElementById('restockQuantity').value);
    if (!quantity || quantity <= 0) { alert('Please enter a valid quantity'); return; }

    const itemId = currentRestockProduct.id || currentRestockProduct.inventory_id;
    const currentStock = parseInt(currentRestockProduct.stock_quantity ?? currentRestockProduct.stock ?? 0);
    const newStock = currentStock + quantity;

    try {
        const res = await fetch(`${_RS_URL}/rest/v1/inventory?id=eq.${itemId}`, {
            method: 'PATCH',
            headers: { ..._RS_H, 'Prefer': 'return=representation' },
            body: JSON.stringify({ stock_quantity: newStock })
        });
        if (!res.ok) throw new Error(await res.text());
        alert(`Successfully restocked ${quantity} units!\nNew stock: ${newStock}`);
        if (window.fetchInventoryFromDB) await window.fetchInventoryFromDB();
        closeRestockModal();
    } catch (error) {
        console.error('Restock error:', error);
        alert('Error restocking item. Please try again.');
    }
};

window.closeRestockModal = function () {
    const modal = document.getElementById('restockModal');
    if (modal) { modal.classList.remove('show'); document.body.style.overflow = ''; }
    currentRestockProduct = null;
};

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeRestockModal();
});