// add-user-modal.js
// SUPA_URL and SUPA_KEY are declared in usertab.js — do not redeclare here

fetch('../components/modals/admin/AddUser-modal.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('AddUser-modal-placeholder').innerHTML = data;
    console.log('Add User modal loaded successfully');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initializeFormListeners();
  })
  .catch(err => console.error('Error loading modal:', err));

function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('show');
    resetForm();
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
        if (strengthFill) {
            strengthFill.style.width = '0';
            strengthFill.className = 'strength-fill';
        }
        if (strengthText) strengthText.textContent = 'Use 8+ characters with letters, numbers & symbols';
        const btn = document.getElementById('addUserBtn');
        if (btn) {
            btn.disabled = false;
            btn.querySelector('.btn-text')?.classList.remove('hidden');
            btn.querySelector('.btn-loading')?.classList.add('hidden');
        }
    }
}

function showError(field, errorEl, message) {
    if (field) field.style.borderColor = '#dc2626';
    if (errorEl) { errorEl.textContent = message; errorEl.classList.remove('hidden'); }
}

function hideError(field, errorEl) {
    if (field) field.style.borderColor = '#d1d5db';
    if (errorEl) errorEl.classList.add('hidden');
}

function checkPasswordMatch() {
    const password = document.getElementById('addPassword')?.value;
    const confirm  = document.getElementById('addConfirmPassword')?.value;
    const errorEl  = document.getElementById('confirmPasswordError');
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
    if (strength <= 1) { fill.classList.add('strength-weak'); text.textContent = 'Weak password'; }
    else if (strength <= 2) { fill.classList.add('strength-medium'); text.textContent = 'Medium password'; }
    else { fill.classList.add('strength-strong'); text.textContent = 'Strong password'; }
}

function initializeFormListeners() {
    const form = document.getElementById('addUserForm');
    if (!form) { console.warn('addUserForm not found'); return; }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const firstname       = document.getElementById('addfirstname')?.value.trim();
        const middlename      = document.getElementById('addmiddlename')?.value.trim() || '';
        const lastname        = document.getElementById('addlastname')?.value.trim();
        const suffix          = document.getElementById('addSuffix')?.value.trim() || '';
        const username        = document.getElementById('addUsername')?.value.trim();
        const email           = document.getElementById('addEmail')?.value.trim();
        const role            = document.getElementById('addRole')?.value;
        const password        = document.getElementById('addPassword')?.value;
        const confirmPassword = document.getElementById('addConfirmPassword')?.value;

        let hasError = false;

        if (!firstname) { showError(document.getElementById('addfirstname'), document.getElementById('firstnameError'), 'First name is required'); hasError = true; }
        else { hideError(document.getElementById('addfirstname'), document.getElementById('firstnameError')); }

        if (!lastname) { showError(document.getElementById('addlastname'), document.getElementById('lastnameError'), 'Last name is required'); hasError = true; }
        else { hideError(document.getElementById('addlastname'), document.getElementById('lastnameError')); }

        if (!username || username.length < 4) { showError(document.getElementById('addUsername'), document.getElementById('usernameError'), 'Username must be at least 4 characters'); hasError = true; }
        else { hideError(document.getElementById('addUsername'), document.getElementById('usernameError')); }

        if (!email || !/\S+@\S+\.\S+/.test(email)) { showError(document.getElementById('addEmail'), document.getElementById('emailError'), 'Please enter a valid email'); hasError = true; }
        else { hideError(document.getElementById('addEmail'), document.getElementById('emailError')); }

        if (!role) { showError(document.getElementById('addRole'), document.getElementById('roleError'), 'Please select a role'); hasError = true; }
        else { hideError(document.getElementById('addRole'), document.getElementById('roleError')); }

        if (!password || password.length < 8) { showError(document.getElementById('addPassword'), document.getElementById('passwordError'), 'Password must be at least 8 characters'); hasError = true; }
        else { hideError(document.getElementById('addPassword'), document.getElementById('passwordError')); }

        if (password !== confirmPassword) { showError(document.getElementById('addConfirmPassword'), document.getElementById('confirmPasswordError'), 'Passwords do not match'); hasError = true; }
        else { hideError(document.getElementById('addConfirmPassword'), document.getElementById('confirmPasswordError')); }

        if (hasError) return;

        const payload = { firstname, middlename, lastname, suffix, username, email, role, password };

        const btn = document.getElementById('addUserBtn');
        btn.disabled = true;
        btn.querySelector('.btn-text').classList.add('hidden');
        btn.querySelector('.btn-loading').classList.remove('hidden');

        try {
            const checkRes = await fetch(
                `${SUPA_URL}/rest/v1/user_accounts?username=eq.${encodeURIComponent(username)}&select=id`,
                { headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` } }
            );
            const existing = await checkRes.json();
            if (existing.length > 0) {
                showError(document.getElementById('addUsername'), document.getElementById('usernameError'), 'Username already taken');
                return;
            }

            const res = await fetch(`${SUPA_URL}/rest/v1/user_accounts`, {
                method: 'POST',
                headers: {
                    'apikey': SUPA_KEY,
                    'Authorization': `Bearer ${SUPA_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());

            alert('User added successfully!');
            closeAddUserModal();
            if (typeof loadUsers === 'function') loadUsers();

        } catch (err) {
            console.error('Error:', err);
            alert('Failed to add user: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.querySelector('.btn-text').classList.remove('hidden');
            btn.querySelector('.btn-loading').classList.add('hidden');
        }
    });
}

window.openAddUserModal         = openAddUserModal;
window.closeAddUserModal        = closeAddUserModal;
window.evaluatePasswordStrength = evaluatePasswordStrength;
window.checkPasswordMatch       = checkPasswordMatch;