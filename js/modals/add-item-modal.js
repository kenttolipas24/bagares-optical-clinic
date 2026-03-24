const _AI_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const _AI_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';
const _AI_H = { 'apikey': _AI_KEY, 'Authorization': `Bearer ${_AI_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

fetch('../components/modals/manager/add-item-modal.html')
    .then(res => res.text())
    .then(data => {
        const placeholder = document.getElementById('add-item-modal-placeholder');
        if (placeholder) { placeholder.innerHTML = data; initializeAddItemModal(); }
    })
    .catch(error => console.error('Error loading add item modal:', error));

function initializeAddItemModal() {
    const form = document.getElementById('addItemForm');
    const modal = document.getElementById('addItemModal');
    const submitBtn = document.getElementById('addItemBtn');
    if (!form || !modal || !submitBtn) return;

    window.openAddItemModal = function () {
        modal.classList.add('show');
        form.reset();
        document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.form-input').forEach(el => el.style.borderColor = '#d1d5db');
    };

    window.closeAddItemModal = function () {
        modal.classList.remove('show');
        form.reset();
    };

    function validateField(field) {
        const value = field.value.trim();
        const errorEl = document.getElementById(field.id + 'Error');
        if (field.hasAttribute('required') && !value) {
            field.style.borderColor = '#dc2626';
            if (errorEl) errorEl.classList.remove('hidden');
            return false;
        } else {
            field.style.borderColor = '#d1d5db';
            if (errorEl) errorEl.classList.add('hidden');
            return true;
        }
    }

    submitBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        inputs.forEach(input => { if (!validateField(input)) isValid = false; });
        if (!isValid) return;

        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        if (btnText) btnText.classList.add('hidden');
        if (btnLoading) btnLoading.classList.remove('hidden');

        const payload = {
            product_name: document.getElementById('addProductName').value.trim(),
            sku:          document.getElementById('addSKU').value.trim(),
            category:     document.getElementById('addCategory').value,
            price:        parseFloat(document.getElementById('addUnitPrice').value),
            stock_quantity: parseInt(document.getElementById('addStockQuantity').value)
        };

        try {
            const res = await fetch(`${_AI_URL}/rest/v1/inventory`, {
                method: 'POST', headers: _AI_H, body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            alert('Item added successfully!');
            closeAddItemModal();
            if (window.fetchInventoryFromDB) window.fetchInventoryFromDB();
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to save item. Check console for details.');
        } finally {
            submitBtn.disabled = false;
            if (btnText) btnText.classList.remove('hidden');
            if (btnLoading) btnLoading.classList.add('hidden');
        }
    });

    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', () => {
            if (field.value.trim() !== '') {
                field.style.borderColor = '#d1d5db';
                const errorEl = document.getElementById(field.id + 'Error');
                if (errorEl) errorEl.classList.add('hidden');
            }
        });
        field.addEventListener('blur', () => validateField(field));
    });

    modal.addEventListener('click', (e) => { if (e.target === modal) closeAddItemModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeAddItemModal(); });
}