chrome.runtime.onMessage.addListener(async (message, sender) => {
  if(!message.isActivated) return;
  
  // Get the active tab
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  
  // Execute script using Manifest V3 API
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['src/js/inject.js']
  });
});