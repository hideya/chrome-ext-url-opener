// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // Open a new window
  chrome.windows.create({
    url: 'https://www.google.com',
    type: 'normal',
    focused: true
  });
});
