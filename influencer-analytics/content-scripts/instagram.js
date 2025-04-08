// Debug logging helper
const DEBUG = true;
function debugLog(...args) {
  if (DEBUG) {
    console.log('[Profile+ Instagram]', ...args);
  }
}

let videoData = [];
let lastScrollHeight = 0;
const SCROLL_THRESHOLD = 800; // Minimum amount to scroll before recollecting

// Log initial script load
debugLog('Instagram content script loaded. URL:', window.location.href);

// Function to check if an element is visible in the viewport
function isElementVisible(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to extract post data from Instagram
function extractInstagramData() {
  debugLog('Extracting Instagram data...');
  
  // Find all elements that might contain view counts with a focus on visible content
  const allElements = document.querySelectorAll('*');
  let newData = [];
  let viewCountElements = [];
  
  // First pass: identify view count elements
  for (const element of allElements) {
    // Skip elements with many children (likely containers)
    if (element.children.length > 5) continue;
    
    const text = element.textContent.trim();
    
    // Skip empty or very long text
    if (!text || text.length > 10) continue;
    
    // Look for patterns like "8.4M", "166K", "24.1K", etc.
    if (text.match(/^[0-9]+(\.[0-9]+)?[KkMm]$/)) {
      viewCountElements.push(element);
    }
  }
  
  debugLog(`Found ${viewCountElements.length} potential view count elements`);
  
  // Second pass: process view count elements
  for (const element of viewCountElements) {
    const text = element.textContent.trim();
    
    // Try to find a URL for this view count
    let url = null;
    let urlElement = null;
    
    // Method 1: Check if element is inside or near an <a> tag
    let closestLink = element.closest('a[href*="/reel/"], a[href*="/p/"]');
    if (closestLink) {
      url = closestLink.getAttribute('href');
      urlElement = closestLink;
    }
    
    // Method 2: If not found, look for the nearest article or presentation div
    if (!url) {
      const container = element.closest('article, div[role="presentation"]');
      if (container) {
        const link = container.querySelector('a[href*="/reel/"], a[href*="/p/"]');
        if (link) {
          url = link.getAttribute('href');
          urlElement = link;
        }
      }
    }
    
    // If we found a URL, check if it's visible and add it
    if (url) {
      // Ensure URL is properly formatted (sometimes Instagram returns partial URLs)
      if (!url.startsWith('http')) {
        url = 'https://www.instagram.com' + url;
      }
      
      // Check if element or its container is in viewport
      const isVisible = isElementVisible(element) || isElementVisible(urlElement);
      
      const viewCount = parseViewCount(text);
      debugLog(`Found view count: "${text}" -> ${viewCount} views, URL: ${url}, Visible: ${isVisible}`);
      
      // Only add if:
      // 1. We don't already have this URL
      // 2. The view count is valid
      if (viewCount > 0 && !videoData.some(item => item.id === url)) {
        newData.push({
          id: url,
          views: viewCount,
          timestamp: new Date().toISOString(),
          visible: isVisible
        });
      }
    }
  }
  
  // Remove duplicates by URL
  newData = newData.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );
  
  // Filter option: only keep visible items
  // Uncomment the next line if you want to only track visible items
  // newData = newData.filter(item => item.visible);
  
  // Log results of extraction
  debugLog(`Extraction complete. Found ${newData.length} new items (after filtering)`);
  
  // Add new data to existing data
  if (newData.length > 0) {
    videoData = [...videoData, ...newData];
    
    // Remove duplicates from the combined data
    videoData = videoData.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    debugLog(`Total videos tracked: ${videoData.length}`);
    
    // Send data to background script for storage
    chrome.runtime.sendMessage({
      action: "storeData",
      data: videoData,
      platform: "instagram"
    });
    
    debugLog('Data sent to background script for storage');
  }
}

// Helper function to parse view/like counts with K, M abbreviations
function parseViewCount(text) {
  try {
    // Ensure we're working with a string
    text = String(text).trim().toLowerCase();
    
    if (text.includes('k')) {
      return parseFloat(text.replace('k', '')) * 1000;
    } else if (text.includes('m')) {
      return parseFloat(text.replace('m', '')) * 1000000;
    } else {
      return parseFloat(text);
    }
  } catch (e) {
    debugLog(`Error parsing count: "${text}"`, e);
    return 0;
  }
}

// Function to get currently visible content
function extractVisibleOnly() {
  debugLog('Extracting only visible content...');
  
  // First, find all grid items that are currently visible
  const gridItems = document.querySelectorAll('article, div[role="presentation"]');
  const visibleItems = Array.from(gridItems).filter(isElementVisible);
  
  debugLog(`Found ${visibleItems.length} visible grid items out of ${gridItems.length} total`);
  
  // Track how many we're actually processing
  let processedItems = 0;
  let newData = [];
  
  // Process each visible item
  for (const item of visibleItems) {
    // Find view count within this item
    const textElements = Array.from(item.querySelectorAll('*'))
      .filter(el => {
        const text = el.textContent.trim();
        return text.length > 0 && text.length < 10 && text.match(/^[0-9]+(\.[0-9]+)?[KkMm]$/);
      });
    
    // Find URL for this item
    const link = item.querySelector('a[href*="/reel/"], a[href*="/p/"]');
    
    if (textElements.length > 0 && link) {
      const viewText = textElements[0].textContent.trim();
      const viewCount = parseViewCount(viewText);
      const url = link.getAttribute('href');
      
      // Ensure URL is properly formatted
      const fullUrl = url.startsWith('http') ? url : 'https://www.instagram.com' + url;
      
      if (viewCount > 0 && !videoData.some(item => item.id === fullUrl)) {
        processedItems++;
        newData.push({
          id: fullUrl,
          views: viewCount,
          timestamp: new Date().toISOString(),
          visible: true
        });
      }
    }
  }
  
  debugLog(`Processed ${processedItems} visible items with valid view counts`);
  
  // Add new data to existing data
  if (newData.length > 0) {
    videoData = [...videoData, ...newData];
    
    // Remove duplicates
    videoData = videoData.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    debugLog(`Total videos tracked: ${videoData.length}`);
    
    // Send data to background script for storage
    chrome.runtime.sendMessage({
      action: "storeData",
      data: videoData,
      platform: "instagram"
    });
  }
}

// Function to reset data collection and start fresh
function resetDataCollection() {
  debugLog('Resetting data collection...');
  videoData = [];
  
  // Send empty data to background script to reset storage
  chrome.runtime.sendMessage({
    action: "storeData",
    data: [],
    platform: "instagram"
  });
  
  // Start fresh extraction focusing on visible content
  setTimeout(extractVisibleOnly, 500);
}

// Listen for manual extraction requests from the panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "manualExtract") {
    debugLog('Manual data extraction requested');
    // Reset and extract only visible content
    resetDataCollection();
    sendResponse({status: "extracting"});
  }
  return true;
});

// Signal to background script that this is an Instagram page
chrome.runtime.sendMessage({
  action: "pageDetected",
  platform: "instagram"
});

// Scroll event listener
document.addEventListener('scroll', function() {
  // Only extract data if we've scrolled a significant amount
  if (Math.abs(document.documentElement.scrollHeight - lastScrollHeight) > SCROLL_THRESHOLD) {
    lastScrollHeight = document.documentElement.scrollHeight;
    debugLog('Scroll threshold reached, extracting data...');
    setTimeout(extractVisibleOnly, 1000); // Wait for content to load
  }
});

// Initial data extraction focusing on visible content
debugLog('Starting initial data extraction...');
setTimeout(extractVisibleOnly, 2000);

// Add a global way to run diagnostics from the console
window.resetInstagramTracking = function() {
  debugLog('Manual reset triggered from console');
  resetDataCollection();
  return "Data collection reset - now tracking only visible content";
};

debugLog('Setup complete. You can also run window.resetInstagramTracking() in the console');