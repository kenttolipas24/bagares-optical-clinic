// Load Services Preview Component
fetch('components/services-preview.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('services-preview-placeholder').innerHTML = data;
    console.log('Services preview loaded');
  })
  .catch(error => console.error('Error loading services preview:', error));