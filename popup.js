document.getElementById('openButton').addEventListener('click', () => {
  // Open a new window with the drop zone
  chrome.windows.create({
    url: 'dropzone.html',
    type: 'normal',
    focused: true,
    width: 800,
    height: 600
  });
  
  // Close the popup
  window.close();
});
