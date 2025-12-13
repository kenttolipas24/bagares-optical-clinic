function toggleDropdown(event) {
  event.preventDefault();
  const dropdown = event.target.nextElementSibling;
  const navDropdown = dropdown.closest('.nav-dropdown');
  dropdown.classList.toggle('show');
  navDropdown.classList.toggle('active');
}

document.addEventListener("DOMContentLoaded", () => {
  loadSalesData();
  setupEventListeners();
  // Simulate user role (replace with actual authentication)
  window.userRole = 'manager'; // Example: 'manager', 'staff'
});

function setupEventListeners() {
  document.getElementById('customerSearch').addEventListener('input', filterSales);
}

function loadSalesData() {
  const salesData = [
    { invoice: "S001", customer: "John Doe", date: "2025-10-06", amount: 150.00, status: "Paid" },
    { invoice: "S002", customer: "Jane Smith", date: "2025-10-06", amount: 200.00, status: "Pending" },
  ];
  updateSalesTable(salesData);
  updateSummary(salesData);
}

function updateSalesTable(salesData) {
  const tbody = document.getElementById('salesTableBody');
  tbody.innerHTML = '';
  salesData.forEach(sale => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sale.invoice}</td>
      <td>${sale.customer}</td>
      <td>${sale.date}</td>
      <td>$${sale.amount.toFixed(2)}</td>
      <td>${sale.status}</td>
      <td><button class="btn-view" onclick="viewInvoice('${sale.invoice}')">View</button></td>
    `;
    tbody.appendChild(row);
  });
}

function updateSummary(salesData) {
  const today = new Date().toISOString().split('T')[0];
  const totalSalesToday = salesData
    .filter(sale => sale.date === today)
    .reduce((sum, sale) => sum + sale.amount, 0);
  const pendingPayments = salesData
    .filter(sale => sale.status === "Pending")
    .reduce((sum, sale) => sum + sale.amount, 0);
  const monthlyRevenue = salesData
    .reduce((sum, sale) => sum + sale.amount, 0);

  document.getElementById('totalSalesToday').textContent = `$${totalSalesToday.toFixed(2)}`;
  document.getElementById('pendingPayments').textContent = `$${pendingPayments.toFixed(2)}`;
  document.getElementById('monthlyRevenue').textContent = `$${monthlyRevenue.toFixed(2)}`;
}

function filterSales() {
  const query = document.getElementById('customerSearch').value.toLowerCase();
  const salesData = [
    { invoice: "S001", customer: "John Doe", date: "2025-10-06", amount: 150.00, status: "Paid" },
    { invoice: "S002", customer: "Jane Smith", date: "2025-10-06", amount: 200.00, status: "Pending" },
  ];
  const filteredData = salesData.filter(sale => sale.customer.toLowerCase().includes(query));
  updateSalesTable(filteredData);
}

function openNewSaleModal() {
  if (window.userRole !== 'manager') {
    alert('Access denied. Only managers can create sales.');
    return;
  }
  document.getElementById('newSaleModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('newSaleModal').style.display = 'none';
  document.getElementById('cartItems').innerHTML = '';
}

function addToCart() {
  const customerName = document.getElementById('customerName').value;
  const product = document.getElementById('productSelect').value;
  const quantity = document.getElementById('quantity').value;
  const price = document.getElementById('price').value;

  if (customerName && product && quantity && price) {
    const cartItem = document.createElement('div');
    cartItem.textContent = `${product} - Qty: ${quantity} - $${(quantity * price).toFixed(2)}`;
    document.getElementById('cartItems').appendChild(cartItem);
    // Simulate inventory update (replace with API call)
    updateInventory(product, quantity);
  }
}

function updateInventory(product, quantity) {
  // Replace with actual API call to Inventory Management
  fetch('/api/inventory/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, quantity })
  }).then(res => res.json()).then(data => console.log(data));
}

function processSale() {
  if (window.userRole !== 'manager') {
    alert('Access denied. Only managers can process sales.');
    return;
  }
  const customerName = document.getElementById('customerName').value;
  const cartItems = document.getElementById('cartItems').innerHTML;
  if (customerName && cartItems) {
    const invoiceNum = `S${Date.now().toString().slice(-6)}`;
    const amount = Array.from(document.getElementById('cartItems').children)
      .reduce((sum, item) => sum + parseFloat(item.textContent.split('$')[1]), 0);
    const sale = { invoice: invoiceNum, customer: customerName, date: new Date().toISOString().split('T')[0], amount, status: "Pending" };
    saveSale(sale);
    generateInvoice(sale);
    issueReceipt(sale);
    closeModal();
    loadSalesData();
  }
}

function saveSale(sale) {
  // Replace with actual database save
  console.log('Sale saved:', sale);
  // Simulated API call
  fetch('/api/sales/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale)
  }).then(res => res.json()).then(data => console.log(data));
}

function generateInvoice(sale) {
  // Replace with jsPDF or backend PDF generation
  console.log(`Invoice ${sale.invoice} generated for ${sale.customer} - Amount: $${sale.amount.toFixed(2)}`);
}

function issueReceipt(sale) {
  // Replace with receipt generation
  console.log(`Receipt issued for ${sale.invoice} - Amount: $${sale.amount.toFixed(2)}`);
}

function viewInvoice(invoiceNum) {
  console.log(`Viewing invoice ${invoiceNum}`);
  // Implement invoice details view
}