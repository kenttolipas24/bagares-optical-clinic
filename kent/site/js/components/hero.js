// Load Hero Component
fetch('components/hero.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('hero-placeholder').innerHTML = data;
    console.log('Hero section loaded');
  })
  .catch(error => console.error('Error loading hero:', error));