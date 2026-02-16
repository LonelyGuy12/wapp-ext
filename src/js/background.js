chrome.runtime.onMessage.addListener(async (message, sender) => {
  console.log('[Background] 📨 Message received:', message);
  
  // Handle scan request (just load chats to populate dropdown)
  if(message.scanChats) {
    console.log('[Background] 🔍 Scan request received, injecting chat scanner...');
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      console.log('[Background] 📑 Active tab:', tab.url);
      
      // Inject only the chat scanning function
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          console.log('[WhatsApp Monitor] 🔍 Scanning for chats...');
          let newList = []
          let stable = Array.from(document.querySelectorAll('div._ak8q'))
          console.log(`[WhatsApp Monitor] ✅ Found ${stable.length} chats`);
          stable.forEach((element,i) => {
            let obj={}
            obj.value =  i 
            obj.innerText = element.innerText
            newList.push(obj)
          });
          
          chrome.storage.sync.set({"chatt": newList});
          console.log('[WhatsApp Monitor] 💾 Chat list saved to storage');
        }
      });
      
      console.log('[Background] ✅ Chat scan complete!');
    } catch(error) {
      console.error('[Background] ❌ Failed to scan chats:', error);
    }
    return;
  }
  
  // Handle activation request (start monitoring)
  if(!message.isActivated) {
    console.log('[Background] ⏭️  Unknown message type, ignoring');
    return;
  }
  
  console.log('[Background] ⚡ Activation message received, injecting monitoring script...');
  
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    console.log('[Background] 📑 Active tab:', tab.url);
    
    // Execute script using Manifest V3 API
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/js/inject.js']
    });
    
    console.log('[Background] ✅ Script injected successfully!');
  } catch(error) {
    console.error('[Background] ❌ Failed to inject script:', error);
  }
});