// Load the navbar.html content into the placeholder
fetch('table/frame_table/frame.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('frame-placeholder').innerHTML = data;
  });
