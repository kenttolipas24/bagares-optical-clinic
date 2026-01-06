// Booking Form Logic
let currentStep = 1;
let bookingData = {};

function nextStep(step) {
    if (step === 2) {
        const service = document.querySelector('input[name="service"]:checked');
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;

        if (!service || !date || !time) {
            alert('Please fill in all required fields');
            return;
        }

        bookingData.service = service.value;
        bookingData.date = date;
        bookingData.time = time;
    }

    if (step === 3) {
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (!fullname || !email || !phone) {
            alert('Please fill in all required fields');
            return;
        }

        bookingData.fullname = fullname;
        bookingData.email = email;
        bookingData.phone = phone;
        bookingData.notes = document.getElementById('notes').value;

        displayConfirmation();
    }

    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-indicator-${currentStep}`).classList.add('inactive');

    currentStep = step;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    document.getElementById(`step-indicator-${currentStep}`).classList.remove('inactive');

    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

function displayConfirmation() {
    const detailsHTML = `
        <h3 style="color: var(--color-text-primary); margin-bottom: 1.5rem; font-size: 1.25rem;">Booking Summary</h3>
        <div style="display: grid; gap: 1rem;">
            <div><strong>Service:</strong><div>${bookingData.service}</div></div>
            <div><strong>Date & Time:</strong><div>${bookingData.date} at ${bookingData.time}</div></div>
            <div><strong>Name:</strong><div>${bookingData.fullname}</div></div>
            <div><strong>Email:</strong><div>${bookingData.email}</div></div>
            <div><strong>Phone:</strong><div>${bookingData.phone}</div></div>
            ${bookingData.notes ? `<div><strong>Notes:</strong><div>${bookingData.notes}</div></div>` : ''}
        </div>
    `;
    document.getElementById('confirmation-details').innerHTML = detailsHTML;
}

function resetBooking() {
    currentStep = 1;
    document.getElementById('step-3').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('step-indicator-3').classList.add('inactive');
    document.getElementById('step-indicator-1').classList.remove('inactive');
    bookingData = {};
}