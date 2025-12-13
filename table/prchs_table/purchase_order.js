// Load the navbar.html content into the placeholder
fetch('table/prchs_table/purchase_order.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('purchase-placeholder').innerHTML = data;
  });
