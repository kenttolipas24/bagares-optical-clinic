// Load Footer Component
fetch('components/footer.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
    console.log('Footer loaded');
  })
  .catch(error => console.error('Error loading footer:', error));