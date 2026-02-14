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
    const urlGroups = parseUrls(text);
    
    if (urlGroups.length > 0) {
      openUrlGroups(urlGroups);
    } else {
      alert('No valid URLs found in the file');
    }
  };
  
  reader.readAsText(file);
}

function parseUrls(text) {
  // Split by newlines
  const lines = text.split(/\r?\n/);
  
  // Group URLs by empty lines
  const groups = [];
  let currentGroup = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Skip empty lines and comments (# or //)
    if (trimmed.length === 0) {
      // Empty line - start a new group if current group has URLs
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    } else if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
      // Comment line - skip it
      return;
    } else {
      // Try to parse as URL
      try {
        new URL(trimmed);
        currentGroup.push(trimmed);
      } catch {
        // Invalid URL, skip it
      }
    }
  });
  
  // Add the last group if it has URLs
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  return groups;
}

function openUrlGroups(urlGroups) {
  // Open each group in a separate window
  urlGroups.forEach((urls, groupIndex) => {
    // Delay between opening windows to avoid overwhelming the browser
    setTimeout(() => {
      // Create a new window with the first URL of this group
      chrome.windows.create({
        url: urls[0],
        type: 'normal',
        focused: groupIndex === 0 // Focus only the first window
      }, (newWindow) => {
        // Open remaining URLs as tabs in the new window
        urls.slice(1).forEach((url, urlIndex) => {
          setTimeout(() => {
            chrome.tabs.create({ 
              windowId: newWindow.id,
              url: url, 
              active: false 
            });
          }, (urlIndex + 1) * 100);
        });
      });
    }, groupIndex * 500); // 500ms delay between windows
  });
  
  // Close the popup after starting to open all windows
  setTimeout(() => {
    window.close();
  }, urlGroups.length * 500 + 500);
}

// Save button - saves all URLs from current window
document.getElementById('saveButton').addEventListener('click', async () => {
  // Get current window
  const currentWindow = await chrome.windows.getCurrent();
  
  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ windowId: currentWindow.id });
  
  // Extract URLs from tabs
  const urls = tabs.map(tab => tab.url).join('\n');
  
  // Create a blob with the URLs
  const blob = new Blob([urls], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Download the file with Chrome's save dialog
  chrome.downloads.download({
    url: url,
    filename: 'urls.txt',
    saveAs: true
  });
  
  window.close();
});
