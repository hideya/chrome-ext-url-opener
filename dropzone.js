const dropZone = document.getElementById('dropZone');

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
  // Open each URL as a new tab in the current window
  urls.forEach((url, index) => {
    // Small delay between opening tabs to avoid browser throttling
    setTimeout(() => {
      chrome.tabs.create({ url: url, active: index === 0 });
    }, index * 100);
  });
  
  // Close the drop zone tab after opening all URLs
  setTimeout(() => {
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id);
    });
  }, urls.length * 100 + 500);
}
