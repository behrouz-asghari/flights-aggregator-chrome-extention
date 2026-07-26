// Service Worker - Background orchestrator for flight search
// Handles parallel requests to all 3 sources and merges results

importScripts("utils/airports.js", "utils/normalizer.js", "adapters/alibaba.js", "adapters/flytoday.js", "adapters/mrbilit.js");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEARCH_FLIGHTS") {
    handleSearch(message.params, sender.tab?.id)
      .then(results => sendResponse({ success: true, results }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (message.type === "PING") {
    sendResponse({ success: true });
    return false;
  }
});

/**
 * Main search handler - fires all 3 adapters in parallel
 */
async function handleSearch(params, tabId) {
  const sources = [
    { name: "alibaba", search: searchAlibaba },
    { name: "flytoday", search: searchFlyToday },
    { name: "mrbilit", search: searchMrbilit }
  ];

  // Notify popup that search started
  notifyProgress(tabId, { status: "searching", loaded: 0, total: 0 });

  // Fire all searches in parallel with staggered starts
  const promises = sources.map((source, idx) => {
    return new Promise(resolve => {
      // Stagger requests by 300-600ms to avoid rate limiting
      setTimeout(() => {
        source.search(params)
          .then(flights => {
            resolve({ source: source.name, flights, error: null });
          })
          .catch(err => {
            console.warn(`[${source.name}] Search failed:`, err.message);
            resolve({ source: source.name, flights: [], error: err.message });
          });
      }, idx * 350);
    });
  });

  const allResults = await Promise.all(promises);

  // Merge all flights
  let allFlights = [];
  const sourceStatus = {};

  for (const result of allResults) {
    allFlights = allFlights.concat(result.flights);
    sourceStatus[result.source] = {
      count: result.flights.length,
      error: result.error
    };
  }

  // Sort by adult price (cheapest first)
  allFlights.sort((a, b) => {
    const priceA = a.prices?.adult || Infinity;
    const priceB = b.prices?.adult || Infinity;
    return priceA - priceB;
  });

  return {
    flights: allFlights,
    sourceStatus,
    total: allFlights.length
  };
}

function notifyProgress(tabId, data) {
  if (tabId) {
    chrome.tabs.sendMessage(tabId, { type: "SEARCH_PROGRESS", data }).catch(() => {});
  }
}
