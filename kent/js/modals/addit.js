// add-user-modal.js
fetch('../components/modals/admin/AddUser-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('AddUser-modal-placeholder').innerHTML = data;
    console.log('Add appointment modal loaded successfully');
    
    // Fix: Use lucide.createIcons() if lucide is loaded
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  })

function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('show');
    document.getElementById('addRole').selectedIndex = 0;
    document.getElementById('addStatus').value = 'Active';
    resetForm();
    // Fix: Check if lucide exists before calling
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('show');
    resetForm();
}

function resetForm() {
    const form = document.getElementById('addUserForm');
    if (form) {
        form.reset();
        document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        if (strengthFill) strengthFill.style.width = '0';
        if (strengthText) strengthText.textContent = 'Use 8+ characters with letters, numbers & symbols';
        if (strengthFill) strengthFill.className = 'strength-fill';
    }
}

function validateField(field) {
    const value = field.value.trim();
    const errorEl = document.getElementById(field.id + 'Error') || 
                     document.getElementById(field.id.replace('add', '').toLowerCase() + 'Error');

    if (field.hasAttribute('required') && !value) {
        showError(field, errorEl, `${field.previousElementSibling.textContent.replace('*', '').trim()} is required`);
        return false;
    }

    if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        showError(field, errorEl, 'Please enter a valid email address');
        return false;
    }

    if (field.id === 'addUsername' && value.length < 4) {
        showError(field, errorEl, 'Username must be at least 4 characters');
        return false;
    }

    if (field.id === 'addPassword' && value && value.length < 8) {
        showError(field, errorEl, 'Password must be at least 8 characters');
        return false;
    }

    hideError(field, errorEl);
    return true;
}

function showError(field, errorEl, message) {
    field.style.borderColor = '#dc2626';
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

function hideError(field, errorEl) {
    field.style.borderColor = '#d1d5db';
    if (errorEl) errorEl.classList.add('hidden');
}

function checkPasswordMatch() {
    const password = document.getElementById('addPassword').value;
    const confirm = document.getElementById('addConfirmPassword').value;
    const errorEl = document.getElementById('confirmPasswordError');

    if (confirm && password !== confirm) {
        showError(document.getElementById('addConfirmPassword'), errorEl, 'Passwords do not match');
        return false;
    } else {
        hideError(document.getElementById('addConfirmPassword'), errorEl);
        return true;
    }
}

function evaluatePasswordStrength(password) {
    let strength = 0;
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');

    if (!fill || !text) return;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    fill.style.width = `${strength * 25}%`;

    fill.className = 'strength-fill';
    if (strength <= 1) {
        fill.classList.add('strength-weak');
        text.textContent = 'Weak password';
    } else if (strength <= 2) {
        fill.classList.add('strength-medium');
        text.textContent = 'Medium password';
    } else {
        fill.classList.add('strength-strong');
        text.textContent = 'Strong password';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addUserForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const fields = this.querySelectorAll('input[required], select[required]');
            let isValid = true;

            fields.forEach(field => {
                if (!validateField(field)) isValid = false;
            });

            if (!checkPasswordMatch()) isValid = false;

            if (!isValid) return;

            const submitBtn = document.getElementById('addUserBtn');
            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').classList.add('hidden');
            submitBtn.querySelector('.btn-loading').classList.remove('hidden');

            // Simulate API call
            setTimeout(() => {
                const firstname = document.getElementById('addfirstname').value.trim();
                const middlename = document.getElementById('addmiddlename').value.trim();
                const lastname = document.getElementById('addlastname').value.trim();
                const suffix = document.getElementById('addSuffix').value.trim();
                const role = document.getElementById('addRole').value;

                const newUser = {
                    id: window.users ? window.users.length + 1 : 1,
                    firstname, middlename, lastname, suffix,
                    username: document.getElementById('addUsername').value.trim(),
                    email: document.getElementById('addEmail').value.trim(),
                    role,
                    status: document.getElementById('addStatus').value,
                    lastLogin: 'Never',
                    createdDate: new Date().toISOString().split('T')[0]
                };

                if (window.users) {
                    window.users.push(newUser);
                }
                if (window.addAuditLog) {
                    window.addAuditLog('Created new user', 'User Management', `Added user: ${firstname} ${middlename} ${lastname} ${suffix} (${role})`);
                }

                closeAddUserModal();
                if (window.renderUsers) {
                    window.renderUsers();
                }
                
                alert('User added successfully!');

                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').classList.remove('hidden');
                submitBtn.querySelector('.btn-loading').classList.add('hidden');
            }, 1000);
        });
    }

    // Real-time validation
    document.querySelectorAll('#addUserForm input, #addUserForm select').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            validateField(field);
            if (field.id === 'addPassword') {
                evaluatePasswordStrength(field.value);
                checkPasswordMatch();
            }
            if (field.id === 'addConfirmPassword') checkPasswordMatch();
        });
    });

    // Close on outside click
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeAddUserModal();
        });
    }

    // ESC key to close
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('addUserModal');
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeAddUserModal();
        }
    });
});