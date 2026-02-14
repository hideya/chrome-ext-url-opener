const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseButton = document.getElementById('browseButton');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop zone when dragging over it
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropZone.classList.add('drag-over');
}

function unhighlight(e) {
  dropZone.classList.remove('drag-over');
}

// Handle dropped files
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;

  if (files.length > 0) {
    handleFile(files[0]);
  }
}

// Browse button - open file selector
browseButton.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent triggering drop zone
  fileInput.click();
});

// Handle file selection from file input
fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

function handleFile(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const text = e.target.result;
    const urls = parseUrls(text);
    
    if (urls.length > 0) {
      openUrls(urls);
    } else {
      alert('No valid URLs found in the file');
    }
  };
  
  reader.readAsText(file);
}

function parseUrls(text) {
  // Split by newlines and filter out empty lines
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  
  // Filter valid URLs (basic validation)
  const urls = lines.filter(line => {
    try {
      new URL(line);
      return true;
    } catch {
      return false;
    }
  });
  
  return urls;
}

function openUrls(urls) {
  // Create a new window with the first URL
  chrome.windows.create({
    url: urls[0],
    type: 'normal',
    focused: true
  }, (newWindow) => {
    // Open remaining URLs as tabs in the new window
    urls.slice(1).forEach((url, index) => {
      setTimeout(() => {
        chrome.tabs.create({ 
          windowId: newWindow.id,
          url: url, 
          active: false 
        });
      }, (index + 1) * 100);
    });
    
    // Close the popup after opening all URLs
    setTimeout(() => {
      window.close();
    }, urls.length * 100 + 500);
  });
}

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
