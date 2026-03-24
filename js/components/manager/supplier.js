const _SP_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _SP_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _SP_H = { 'apikey': _SP_KEY, 'Authorization': `Bearer ${_SP_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

let allSuppliers = [];
if (typeof window.supplierData === 'undefined') window.supplierData = [];

fetch('../components/manager/supplier.html')
  .then(res => res.text())
  .then(html => {
    const placeholder = document.getElementById('supplier-placeholder');
    if (placeholder) { placeholder.innerHTML = html; loadSuppliers(); }
  })
  .catch(err => console.error('Error loading supplier component:', err));

async function loadSuppliers() {
  try {
    const res = await fetch(`${_SP_URL}/rest/v1/suppliers?select=*&order=supplier_name.asc`, { headers: _SP_H });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    allSuppliers = data; window.supplierData = data;
    renderSupplierTable(data);
  } catch (err) {
    console.warn('Supplier load error:', err);
    renderSupplierTable([]);
  }
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.split(' ').filter(p => p.length > 0);
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
}

function filterSuppliers() {
  const searchTerm = document.getElementById('searchSupplierInput')?.value.toLowerCase() || '';
  applySupplierFilters(searchTerm);
}

function applySupplierFilters(searchTerm = '') {
  if (!searchTerm) searchTerm = document.getElementById('searchSupplierInput')?.value.toLowerCase() || '';
  const statusFilter   = document.getElementById('statusFilterSupplier')?.value || 'all';
  const categoryFilter = document.getElementById('categoryFilterSupplier')?.value || 'all';
  const filtered = allSuppliers.filter(sup => {
    const matchesSearch   = (sup.supplier_name || '').toLowerCase().includes(searchTerm) || (sup.contact_person || '').toLowerCase().includes(searchTerm);
    const matchesStatus   = statusFilter === 'all' || (sup.status || '').toLowerCase() === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (sup.category || '').toLowerCase() === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });
  renderSupplierTable(filtered);
}

let supplierSortDirection = true;
function sortSupplierTable(column) {
  supplierSortDirection = !supplierSortDirection;
  const sorted = [...allSuppliers].sort((a, b) => {
    let aVal, bVal;
    if (column === 'name')    { aVal = (a.supplier_name || '').toLowerCase(); bVal = (b.supplier_name || '').toLowerCase(); }
    else if (column === 'contact') { aVal = (a.contact_person || '').toLowerCase(); bVal = (b.contact_person || '').toLowerCase(); }
    else if (column === 'orders')  { aVal = parseInt(a.total_orders || 0); bVal = parseInt(b.total_orders || 0); }
    else return 0;
    if (aVal < bVal) return supplierSortDirection ? -1 : 1;
    if (aVal > bVal) return supplierSortDirection ? 1 : -1;
    return 0;
  });
  renderSupplierTable(sorted);
}

function renderSupplierTable(suppliers) {
  const tbody = document.getElementById('supplierTableBody');
  if (!tbody) return;
  if (!suppliers || !suppliers.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#6b7280;">No suppliers found.</td></tr>';
    return;
  }
  tbody.innerHTML = suppliers.map(sup => {
    const catSlug    = (sup.category || 'none').toLowerCase();
    const statusSlug = (sup.status || 'inactive').toLowerCase();
    return `
    <tr data-category="${catSlug}" data-status="${statusSlug}">
      <td><div class="supplier-logo">${getInitials(sup.supplier_name)}</div></td>
      <td><span class="supplier-name">${sup.supplier_name}</span></td>
      <td>${sup.contact_person || '—'}</td>
      <td>${sup.email || '—'}</td>
      <td>${sup.phone || '—'}</td>
      <td><span class="category-badge ${catSlug}">${sup.category || '—'}</span></td>
      <td><strong>${sup.total_orders || 0}</strong></td>
      <td><span class="status-badge ${statusSlug}">${sup.status || '—'}</span></td>
      <td>
        <div class="menu-container">
          <button class="menu-dot-btn" onclick="toggleMenu(event, ${sup.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          <div id="dropdown-${sup.id}" class="menu-dropdown">
            <button onclick="viewSupplier(${sup.id})">View Details</button>
            <button onclick="editSupplier(${sup.id})">Edit Supplier</button>
          </div>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openAddSupplierModal() {
  const modal = document.getElementById('addSupplierModal');
  if (modal) modal.style.display = 'block';
}

function closeSupplierModal() {
  const modal = document.getElementById('addSupplierModal');
  if (modal) { modal.style.display = 'none'; document.getElementById('addSupplierForm')?.reset(); }
}

async function handleCreateSupplier(event) {
  event.preventDefault();
  const payload = {
    supplier_name:  document.getElementById('supName').value,
    contact_person: document.getElementById('supContact').value,
    email:          document.getElementById('supEmail').value,
    phone:          document.getElementById('supPhone').value,
    category:       document.getElementById('supCategory').value,
    status:         'Active'
  };
  try {
    const res = await fetch(`${_SP_URL}/rest/v1/suppliers`, {
      method: 'POST', headers: _SP_H, body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    alert('Supplier added successfully!');
    closeSupplierModal();
    loadSuppliers();
  } catch (err) {
    console.error('Create supplier error:', err);
    alert('Failed to save supplier. Check console.');
  }
}

function toggleMenu(event, id) {
  event.stopPropagation();
  document.querySelectorAll('.menu-dropdown').forEach(el => { if (el.id !== `dropdown-${id}`) el.classList.remove('show'); });
  document.getElementById(`dropdown-${id}`)?.classList.toggle('show');
}

window.addEventListener('click', () => { document.querySelectorAll('.menu-dropdown').forEach(el => el.classList.remove('show')); });