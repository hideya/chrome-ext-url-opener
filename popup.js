// Open button - opens the drop zone window
document.getElementById('openButton').addEventListener('click', () => {
  chrome.windows.create({
    url: 'dropzone.html',
    type: 'normal',
    focused: true,
    width: 800,
    height: 600
  });
  
  window.close();
});

// Save button - saves all URLs from current window
document.getElementById('saveButton').addEventListener('click', async () => {
  // Ask user for filename
  const filename = prompt('Enter filename:', 'urls.txt');
  
  // If user cancelled, do nothing
  if (!filename) {
    return;
  }
  
  // Get current window
  const currentWindow = await chrome.windows.getCurrent();
  
  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ windowId: currentWindow.id });
  
  // Extract URLs from tabs
  const urls = tabs.map(tab => tab.url).join('\n');
  
  // Create a blob with the URLs
  const blob = new Blob([urls], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Download the file
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  });
  
  window.close();
});
