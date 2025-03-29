let videoData = [];
let lastScrollHeight = 0;
const SCROLL_THRESHOLD = 800; // Minimum amount to scroll before recollecting

// Function to extract post data from Instagram
function extractInstagramData() {
  const posts = document.querySelectorAll('article');
  let newData = [];
  
  posts.forEach(post => {
    try {
      // Find view count or like count
      let viewCountElement = post.querySelector('span[class*="video-view-count"]');
      let viewCount = 0;
      
      if (viewCountElement) {
        // For video views
        const viewText = viewCountElement.textContent;
        viewCount = parseViewCount(viewText);
      } else {
        // For image likes
        let likeElement = post.querySelector('span[class*="like-count"]');
        if (likeElement) {
          const likeText = likeElement.textContent;
          viewCount = parseViewCount(likeText);
        }
      }
      
      // Only add if we found a view/like count
      if (viewCount > 0) {
        // Get post URL to use as unique identifier
        const linkElement = post.querySelector('a[href^="/p/"]');
        const postUrl = linkElement ? linkElement.getAttribute('href') : null;
        
        if (postUrl && !videoData.some(item => item.id === postUrl)) {
          newData.push({
            id: postUrl,
            views: viewCount,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.error('Error extracting data from post', e);
    }
  });
  
  // Add new data to existing data
  if (newData.length > 0) {
    videoData = [...videoData, ...newData];
    console.log(`Added ${newData.length} new posts. Total: ${videoData.length}`);
    
    // Send data to background script for storage
    chrome.runtime.sendMessage({
      action: "storeData",
      data: videoData,
      platform: "instagram"
    });
  }
}

// Helper function to parse view/like counts with K, M abbreviations
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
    return 0;
  }
}

// Scroll event listener
document.addEventListener('scroll', function() {
  // Only extract data if we've scrolled a significant amount
  if (Math.abs(document.documentElement.scrollHeight - lastScrollHeight) > SCROLL_THRESHOLD) {
    lastScrollHeight = document.documentElement.scrollHeight;
    setTimeout(extractInstagramData, 1000); // Wait for content to load
  }
});

// Initial data extraction
setTimeout(extractInstagramData, 2000);