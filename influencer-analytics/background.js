// Debug logging helper
const DEBUG = true;
function debugLog(...args) {
  if (DEBUG) {
    console.log('[Profile+]', ...args);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  debugLog('Extension installed/updated');
});

// Enable side panel by default for TikTok and Instagram Reels
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (tab.url?.includes("tiktok.com") || tab.url?.includes("instagram.com/reels")) {
    debugLog('Enabling side panel for tab:', tabId, tab.url);
    chrome.sidePanel.setOptions({
      tabId,
      path: 'side-panel/panel.html',
      enabled: true
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "storeData") {
    debugLog('Storing data:', request.platform, request.data.length + ' items');
    chrome.storage.local.set({ 
      videoData: request.data,
      platform: request.platform
    }, () => {
      debugLog('Data stored successfully');
      sendResponse({ status: "success" });
    });
    return true; // Required for async sendResponse
  }
});