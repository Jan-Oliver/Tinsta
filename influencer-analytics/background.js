// Debug logging helper
const DEBUG = true;
function debugLog(...args) {
  if (DEBUG) {
    console.log('[Profile+]', ...args);
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  debugLog('Extension installed/updated');
  
  // Set default configuration
  chrome.storage.local.set({
    enableSidePanel: true
  }, () => {
    debugLog('Default configuration set');
  });
  
  // Create a context menu option to open side panel
  chrome.contextMenus.create({
    id: "openSidePanel",
    title: "Open Analytics Panel",
    contexts: ["action"]
  });
});

// Handle clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("tiktok.com") || (tab.url.includes("instagram.com") && tab.url.includes("/reels"))) {
    // This is a user gesture, so we can open the side panel
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSidePanel") {
    // This is a user gesture, so we can open the side panel
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Enable side panel for TikTok and Instagram Reels whenever a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if URL is available and fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes("tiktok.com") || (tab.url.includes("instagram.com") && tab.url.includes("/reels"))) {
      debugLog('Enabling side panel for tab:', tabId, tab.url);
      
      // Ensure side panel is enabled for this tab
      chrome.sidePanel.setOptions({
        tabId,
        path: 'side-panel/panel.html',
        enabled: true
      });
      
      // We cannot automatically open the side panel due to Chrome's security restrictions
      // Instead, we'll make the extension icon active to indicate it's ready
      chrome.action.setBadgeText({
        text: "ON",
        tabId: tabId
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: "#4CAF50",
        tabId: tabId
      });
    } else {
      // Reset badge for non-matching sites
      chrome.action.setBadgeText({
        text: "",
        tabId: tabId
      });
    }
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
      
      // Show a notification on the extension icon that new data is available
      if (sender.tab) {
        chrome.action.setBadgeText({
          text: "NEW",
          tabId: sender.tab.id
        });
        
        // Reset to "ON" after 3 seconds
        setTimeout(() => {
          chrome.action.setBadgeText({
            text: "ON",
            tabId: sender.tab.id
          });
        }, 3000);
      }
    });
    return true; // Required for async sendResponse
  }
});

// Add a new event listener for when a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && (tab.url.includes("tiktok.com") || (tab.url.includes("instagram.com") && tab.url.includes("/reels")))) {
      debugLog('Tab activated, enabling side panel:', activeInfo.tabId);
      
      // Enable side panel for activated tab
      chrome.sidePanel.setOptions({
        tabId: activeInfo.tabId,
        path: 'side-panel/panel.html',
        enabled: true
      });
      
      // Set badge to show it's active
      chrome.action.setBadgeText({
        text: "ON",
        tabId: activeInfo.tabId
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: "#4CAF50",
        tabId: activeInfo.tabId
      });
    } else {
      // Reset badge for non-matching sites
      chrome.action.setBadgeText({
        text: "",
        tabId: activeInfo.tabId
      });
    }
  });
});