// Load Why Choose Us Component
fetch('components/why-choose-us.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('why-choose-us-placeholder').innerHTML = data;
    console.log('Why choose us section loaded');
  })
  .catch(error => console.error('Error loading why choose us:', error));