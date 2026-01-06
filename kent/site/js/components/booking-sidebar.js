// Load Booking Sidebar Component
fetch('components/booking-sidebar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('booking-sidebar-placeholder').innerHTML = data;
    console.log('Booking sidebar loaded');
  })
  .catch(error => console.error('Error loading booking sidebar:', error));