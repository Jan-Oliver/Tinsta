// Format numbers with abbreviations (K, M, B)
function formatNumber(num) {
  if (!num && num !== 0) return '-';
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Calculate median
function median(numbers) {
  if (!numbers || numbers.length === 0) return null;
  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function updateStats(data, platform) {
  if (!data || data.length === 0) {
    // Set all values to '-'
    const elements = document.querySelectorAll('.stat-value');
    elements.forEach(el => el.textContent = '-');
    return;
  }

  // Get all view counts as an array
  const viewCounts = data.map(item => item.views);
  
  // Calculate statistics
  const totalVideos = viewCounts.length;
  const meanViews = viewCounts.reduce((a, b) => a + b, 0) / totalVideos;
  const medianViews = median(viewCounts);
  const mostViewed = Math.max(...viewCounts);
  
  // Videos above 10x median
  const viralVideos10x = viewCounts.filter(views => views >= medianViews * 10);
  const viralMean10x = viralVideos10x.length ? 
    viralVideos10x.reduce((a, b) => a + b, 0) / viralVideos10x.length : null;
  const viralMedian10x = viralVideos10x.length ? median(viralVideos10x) : null;
  const outperf10xOdds = (viralVideos10x.length / totalVideos) * 100;
  
  // Videos above 5x median
  const viralVideos5x = viewCounts.filter(views => views >= medianViews * 5);
  const outperf5xOdds = (viralVideos5x.length / totalVideos) * 100;
  
  // Last 15 videos
  const last15 = viewCounts.slice(-15);
  const last15Mean = last15.length ? last15.reduce((a, b) => a + b, 0) / last15.length : null;
  const last15Median = last15.length ? median(last15) : null;
  
  // Update UI
  document.getElementById('videos-analyzed').textContent = totalVideos || '-';
  document.getElementById('mean-views').textContent = formatNumber(last15Mean);
  document.getElementById('median-views').textContent = formatNumber(last15Median);
  document.getElementById('most-viewed').textContent = formatNumber(mostViewed);
  document.getElementById('viral-mean').textContent = formatNumber(viralMean10x);
  document.getElementById('viral-median').textContent = formatNumber(viralMedian10x);
  document.getElementById('outperf-10x-count').textContent = viralVideos10x.length || '-';
  document.getElementById('outperf-10x-odds').textContent = outperf10xOdds ? Math.round(outperf10xOdds) + '%' : '-';
  document.getElementById('outperf-5x-count').textContent = viralVideos5x.length || '-';
  document.getElementById('outperf-5x-odds').textContent = outperf5xOdds ? Math.round(outperf5xOdds) + '%' : '-';
  document.getElementById('all-mean').textContent = formatNumber(meanViews);
  document.getElementById('all-median').textContent = formatNumber(medianViews);
}

// Initial load
chrome.storage.local.get(['videoData', 'platform'], function(result) {
  if (result.videoData) {
    updateStats(result.videoData, result.platform);
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local' && changes.videoData) {
    updateStats(changes.videoData.newValue, changes.platform?.newValue);
  }
}); 