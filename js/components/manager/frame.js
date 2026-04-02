const _M_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _M_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _M_H = { 'apikey': _M_KEY, 'Authorization': `Bearer ${_M_KEY}`, 'Content-Type': 'application/json' };

fetch('../components/manager/frame.html')
    .then(res => res.text())
    .then(data => {
        const placeholder = document.getElementById('frame-placeholder');
        if (placeholder) { placeholder.innerHTML = data; initializeInventory(); }
    })
    .catch(error => console.error('Error loading frame.html:', error));

let inventoryData = [];
let currentCategory = 'all';
let currentSort = { column: null, direction: 'asc' };

function formatCurrency(num) {
    return '₱' + parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function getStockStatus(stock) {
    const qty = parseInt(stock);
    if (isNaN(qty) || qty <= 0) return { cls: 'out-of-stock', text: 'Out of Stock' };
    if (qty <= 10)              return { cls: 'low-stock',     text: 'Low Stock' };
    return                             { cls: 'in-stock',      text: 'In Stock' };
}

window.fetchInventoryFromDB = async function () {
    try {
        const res = await fetch(`${_M_URL}/rest/v1/inventory?select=*&order=product_name.asc`, { headers: _M_H });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        // Normalize: always use 'stock' field, fallback to stock_quantity
        inventoryData = data.map(item => ({
            ...item,
            stock: parseInt(item.stock ?? item.stock_quantity ?? 0)
        }));
        window.inventoryData = inventoryData;

        renderInventoryTable();
        window.filterByCategory('frames');
    } catch (error) {
        console.error('Inventory fetch failed:', error);
    }
};

function initializeInventory() {
    window.fetchInventoryFromDB();
    document.addEventListener('click', function (event) {
        if (!event.target.closest('details')) {
            document.querySelectorAll('details[open]').forEach(d => d.removeAttribute('open'));
        }
    });
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    inventoryData.forEach(item => {
        // Use the already-normalized stock value
        const stock = parseInt(item.stock ?? item.stock_quantity ?? 0);
        const status = getStockStatus(stock);
        const initials = item.initials || (item.product_name?.substring(0, 2).toUpperCase() || '??');
        const category = item.category || 'none';

        const row = document.createElement('tr');
        row.dataset.category    = category;
        row.dataset.price       = item.price;
        row.dataset.stock       = stock;
        row.dataset.inventoryId = item.id;

        row.innerHTML = `
            <td>
                <div class="product-cell">
                    <div class="product-image">${initials}</div>
                    <span>${item.product_name || 'Unknown'}</span>
                </div>
            </td>
            <td>${item.sku || 'N/A'}</td>
            <td><span class="category-badge ${category}">${category}</span></td>
            <td>${formatCurrency(item.price || 0)}</td>
            <td>${stock}</td>
            <td><span class="status-badge ${status.cls}">${status.text}</span></td>
            <td>
                <div class="action-cell">
                    <details class="action-dropdown">
                        <summary class="action-menu-btn">⋮</summary>
                        <div class="action-menu">
                            <button class="action-menu-item" onclick="openViewDetails('${item.id}')">View</button>
                            <button class="action-menu-item" onclick="restockItem('${item.id}')">Restock</button>
                            <button class="action-menu-item danger" onclick="removeItem('${item.id}')">Remove</button>
                        </div>
                    </details>
                </div>
            </td>`;
        tbody.appendChild(row);
    });

    updateResultCount();
    applyCurrentView();
}

function applyCurrentView() {
    const searchValue = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const stockFilter = document.getElementById('stockFilter')?.value || 'all';

    document.querySelectorAll('#inventoryTableBody tr').forEach(row => {
        const rowText     = row.innerText.toLowerCase();
        const rowCategory = row.dataset.category;
        const rowStock    = parseInt(row.dataset.stock);

        const matchesSearch   = rowText.includes(searchValue);
        const matchesCategory = currentCategory === 'all' || rowCategory === currentCategory;

        let matchesStock = true;
        if      (stockFilter === 'in-stock')     matchesStock = rowStock > 10;
        else if (stockFilter === 'low-stock')    matchesStock = rowStock > 0 && rowStock <= 10;
        else if (stockFilter === 'out-of-stock') matchesStock = rowStock === 0;

        row.style.display = matchesSearch && matchesCategory && matchesStock ? '' : 'none';
    });

    updateResultCount();
}

window.filterByCategory = function (category) {
    currentCategory = category;
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.onclick?.toString().includes(`'${category}'`));
    });
    applyCurrentView();
};

window.filterTable  = applyCurrentView;
window.applyFilters = applyCurrentView;

function updateResultCount() {
    const visible = [...document.querySelectorAll('#inventoryTableBody tr')]
        .filter(r => r.style.display !== 'none').length;
    const el1 = document.getElementById('showingEnd');
    const el2 = document.getElementById('totalItems');
    if (el1) el1.textContent = visible;
    if (el2) el2.textContent = visible;
}

window.sortTable = function (column) {
    const tbody = document.getElementById('inventoryTableBody');
    const rows  = Array.from(tbody.querySelectorAll('tr'));

    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column    = column;
        currentSort.direction = 'asc';
    }

    const columnMap = { product: 0, sku: 1, category: 2, price: 3, stock: 4 };
    const index     = columnMap[column];

    rows.sort((a, b) => {
        let aVal = a.cells[index].innerText.replace('₱', '').replace(',', '').trim();
        let bVal = b.cells[index].innerText.replace('₱', '').replace(',', '').trim();

        if (column === 'price' || column === 'stock') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }

        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    rows.forEach(row => tbody.appendChild(row));
};

window.openViewDetails = function (itemId) {
    const product = window.inventoryData?.find(item => item.id == itemId);
    if (!product) { alert('Product not found. Please refresh.'); return; }

    fetch(`${_M_URL}/rest/v1/inventory?id=eq.${itemId}&select=*`, { headers: _M_H })
        .then(res => res.json())
        .then(data => {
            if (data[0]) product.stock = parseInt(data[0].stock ?? data[0].stock_quantity ?? 0);
            if (typeof populateViewDetailsModal === 'function') {
                populateViewDetailsModal(product);
                const modal = document.getElementById('viewDetailsModal');
                if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
            }
        })
        .catch(() => {
            if (typeof populateViewDetailsModal === 'function') {
                populateViewDetailsModal(product);
                const modal = document.getElementById('viewDetailsModal');
                if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
            }
        });
};

window.restockItem = function (itemId) {
    const product = window.inventoryData?.find(item => item.id == itemId);
    if (!product) { alert('Product not found. Please refresh.'); return; }

    if (typeof populateRestockModal === 'function') {
        populateRestockModal(product);
        const modal = document.getElementById('restockModal');
        if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
        const form = document.getElementById('restockForm');
        if (form) form.reset();
    }
};

window.removeItem = async function (itemId) {
    if (!confirm('Remove this item from inventory?')) return;
    try {
        const res = await fetch(`${_M_URL}/rest/v1/inventory?id=eq.${itemId}`, {
            method: 'DELETE', headers: _M_H
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Item removed.');
        window.fetchInventoryFromDB();
    } catch (err) {
        console.error('Remove error:', err);
        alert('Failed to remove item.');
    }
};