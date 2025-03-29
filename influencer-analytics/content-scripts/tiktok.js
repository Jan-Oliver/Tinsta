// Debug logging helper
const DEBUG = true;
function debugLog(...args) {
  if (DEBUG) {
    console.log('[Profile+ TikTok]', ...args);
  }
}

let videoData = [];
let lastScrollHeight = 0;
const SCROLL_THRESHOLD = 800; // Minimum amount to scroll before recollecting

// Function to extract video data from TikTok
function extractTikTokData() {
  const videos = document.querySelectorAll('[data-e2e="user-post-item"]');
  let newData = [];
  
  debugLog('Found', videos.length, 'videos on page');
  
  videos.forEach(video => {
    try {
      // Find view count element
      const viewCountElement = video.querySelector('[data-e2e="video-views"]');
      
      if (viewCountElement) {
        const viewText = viewCountElement.textContent;
        const viewCount = parseViewCount(viewText);
        
        // Get video URL to use as unique identifier
        const linkElement = video.querySelector('a');
        const videoUrl = linkElement ? linkElement.getAttribute('href') : null;
        
        if (videoUrl && viewCount > 0 && !videoData.some(item => item.id === videoUrl)) {
          newData.push({
            id: videoUrl,
            views: viewCount,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      debugLog('Error extracting data from video', e);
    }
  });
  
  // Add new data to existing data
  if (newData.length > 0) {
    videoData = [...videoData, ...newData];
    debugLog(`Added ${newData.length} new videos. Total: ${videoData.length}`);
    
    // Send data to background script for storage
    chrome.runtime.sendMessage({
      action: "storeData",
      data: videoData,
      platform: "tiktok"
    }, response => {
      debugLog('Storage response:', response);
    });
  }
}

// Helper function to parse view counts with K, M abbreviations
function parseViewCount(text) {
  try {
    text = text.trim().toLowerCase();
    if (text.includes('k')) {
      return parseFloat(text.replace('k', '')) * 1000;
    } else if (text.includes('m')) {
      return parseFloat(text.replace('m', '')) * 1000000;
    } else {
      return parseFloat(text.replace(/[^0-9.]/g, ''));
    }
  } catch (e) {
    debugLog('Error parsing view count:', text, e);
    return 0;
  }
}

// Scroll event listener
document.addEventListener('scroll', function() {
  // Only extract data if we've scrolled a significant amount
  if (Math.abs(document.documentElement.scrollHeight - lastScrollHeight) > SCROLL_THRESHOLD) {
    lastScrollHeight = document.documentElement.scrollHeight;
    debugLog('Scroll threshold reached, extracting data...');
    setTimeout(extractTikTokData, 1000); // Wait for content to load
  }
});

// Initial data extraction
debugLog('Content script loaded, starting initial data extraction...');
setTimeout(extractTikTokData, 2000);