// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // Open a new window with our drop zone page
  chrome.windows.create({
    url: 'dropzone.html',
    type: 'normal',
    focused: true,
    width: 800,
    height: 600
  });
});
