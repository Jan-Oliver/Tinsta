// Open the side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ tabId: tab.id });
  });
  
  // Set the default state to open (this ensures the panel stays open)
  chrome.sidePanel.setOptions({
    path: 'panel.html',
    enabled: true
  });