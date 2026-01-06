// Load add-item-modal.html
fetch('../components/modals/manager/add-item-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('add-item-modal-placeholder').innerHTML = data;
    initializeAddItemModal();
  })
  .catch(error => console.error('Error loading add item modal:', error));

// Initialize after modal is loaded
function initializeAddItemModal() {
    const form = document.getElementById('addItemForm');
    const modal = document.getElementById('addItemModal');

    if (!form || !modal) return;

    // Open modal
    window.openAddItemModal = function() {
        modal.classList.add('show');
        form.reset();
        document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));
    };

    // Close modal
    window.closeAddItemModal = function() {
        modal.classList.remove('show');
        form.reset();
        document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));
    };

    // Validate single field
    function validateField(field) {
        const value = field.value.trim();
        const errorEl = document.getElementById(field.id + 'Error');

        if (field.hasAttribute('required') && !value) {
            field.style.borderColor = '#dc2626';
            if (errorEl) {
                errorEl.textContent = `${field.previousElementSibling.textContent.replace('*', '').trim()} is required`;
                errorEl.classList.remove('hidden');
            }
            return false;
        }

        field.style.borderColor = '#d1d5db';
        if (errorEl) errorEl.classList.add('hidden');
        return true;
    }

    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const fields = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!validateField(field)) isValid = false;
        });

        if (!isValid) return;

        const submitBtn = document.getElementById('addItemBtn');
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').classList.add('hidden');
        submitBtn.querySelector('.btn-loading').classList.remove('hidden');

        // Simulate API call
        setTimeout(() => {
            const newItem = {
                productName: document.getElementById('addProductName').value.trim(),
                sku: document.getElementById('addSKU').value.trim(),
                category: document.getElementById('addCategory').value,
                unitPrice: parseFloat(document.getElementById('addUnitPrice').value),
                stockQuantity: parseInt(document.getElementById('addStockQuantity').value),
            };

            console.log('New item added:', newItem);
            // Here you would normally send to backend
            // window.renderItems(); // if you have a render function

            closeAddItemModal();
            alert('Item added successfully!');

            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').classList.remove('hidden');
            submitBtn.querySelector('.btn-loading').classList.add('hidden');
        }, 1000);
    });

    // Real-time validation
    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => validateField(field));
    });

    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeAddItemModal();
    });

    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeAddItemModal();
        }
    });
}

// Call this after injecting the modal HTML
// initializeAddItemModal();