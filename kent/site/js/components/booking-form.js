// Load Booking Form Component
fetch('components/booking-form.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('booking-form-placeholder').innerHTML = data;
    
    // After form loads, attach form submission handler
    attachFormHandler();
    console.log('Booking form loaded');
  })
  .catch(error => console.error('Error loading booking form:', error));

function attachFormHandler() {
    const form = document.getElementById('booking-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get booking data from booking.js
            if (typeof bookingData !== 'undefined') {
                alert('Booking confirmed! You will receive a confirmation email shortly.');
                console.log('Booking Data:', bookingData);
                
                // Reset form
                this.reset();
                if (typeof resetBooking === 'function') {
                    resetBooking();
                }
            }
        });
    }
}