// Load modal HTML once
fetch("../components/modals/manager/view-details-modal.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("action-viewdetails-modal").innerHTML = html;
  });

// Open modal (called via openViewDetails(this))
function openViewDetails(button) {
  const row = button.closest("tr");

  const name = row.querySelector(".product-cell span").textContent;
  const sku = row.children[1].textContent;
  const category = row.children[2].innerText;
  const price = row.children[3].innerText.replace("₱", "");
  const stock = parseInt(row.children[4].innerText);

  document.getElementById("vdName").textContent = name;
  document.getElementById("vdSKU").textContent = sku;
  document.getElementById("vdCategory").textContent = category;
  document.getElementById("vdPrice").textContent = `₱${price}`;
  document.getElementById("vdStock").textContent = stock;

  const statusEl = document.getElementById("vdStatus");

  if (stock === 0) {
    statusEl.textContent = "Out of Stock";
    statusEl.style.background = "#fee2e2";
    statusEl.style.color = "#991b1b";
  } else if (stock <= 5) {
    statusEl.textContent = "Low Stock";
    statusEl.style.background = "#fef3c7";
    statusEl.style.color = "#92400e";
  } else {
    statusEl.textContent = "In Stock";
    statusEl.style.background = "#dcfce7";
    statusEl.style.color = "#166534";
  }

  document.getElementById("vdOverlay").style.display = "flex";
}

// Close modal
function closeViewDetails() {
  document.getElementById("vdOverlay").style.display = "none";
}
