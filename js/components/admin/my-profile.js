fetch('../components/profile/my-profile.html')
.then(res => res.text())
  .then(data => {
    document.getElementById('MyProfile-placeholder').innerHTML = data;

  })
  .catch(error => console.error('Error loading navbar:', error));