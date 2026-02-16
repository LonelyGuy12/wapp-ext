startTimer = async()=>{ setTimeout(inject, 200); } 
sleep = async (ms)=>{ return new Promise(resolve => setTimeout(resolve, ms)); }
eventFire = async(MyElement, ElementType)=>{ 
    let MyEvent = document.createEvent("MouseEvents"); 
    MyEvent.initMouseEvent(ElementType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null); 
    MyElement.dispatchEvent(MyEvent); 
}
chat = async() => {
    console.log('[WhatsApp Monitor] 🔍 Scanning for chats...');
    let resolveChat = new Promise(function(resolve, reject){
        chrome.storage.sync.get({"chat": true}, function(options){ resolve(options.chat); })
    });
     
     let chat = await resolveChat;
     if(chat){
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
}

checkInput = (input, words) => {
    return words.some(word => input.toLowerCase().includes(word.toLowerCase()));
   }

var killId = setTimeout(function() {
    for (var i = killId; i > 0; i--) clearInterval(i)
  }, 3000);

inject = async() => { 
    console.log('[WhatsApp Monitor] 🚀 Inject script started');
   
    let resolveKill = new Promise(function(resolve, reject){
        chrome.storage.sync.get({"kill": true}, function(options){ resolve(options.kill); })
    });
    let kill = await resolveKill; 
    
    if(!isNaN(parseInt(kill))){
        console.log('[WhatsApp Monitor] ⛔ Kill signal detected, stopping...');
        var killId = setTimeout(function() {
            for (var i = killId; i > 0; i--) clearInterval(i)
          }, 3000);
          return;
    }

    let resolveChat = new Promise(function(resolve, reject){
        chrome.storage.sync.get({"chatFinal": true}, function(options){ resolve(options.chatFinal); })
    });
    let chatFinal = await resolveChat; 
    console.log(`[WhatsApp Monitor] 📱 Target chat index: ${chatFinal}`);
    
    if(!(chatFinal && !isNaN(parseInt(chatFinal)))) {
        console.error('[WhatsApp Monitor] ❌ No chat selected or invalid chat index');
        return;
    }
    
    const chatElements = document.querySelectorAll('div._ak8q');
    console.log(`[WhatsApp Monitor] 📋 Available chats: ${chatElements.length}`);
    
    if(chatElements[chatFinal]) {
        console.log(`[WhatsApp Monitor] 👆 Clicking on chat: ${chatFinal}`);
        eventFire(chatElements[chatFinal],'mousedown');
    } else {
        console.error(`[WhatsApp Monitor] ❌ Chat index ${chatFinal} not found!`);
        return;
    }

    await sleep(2000);
    console.log('[WhatsApp Monitor] ⏳ Waited 2s for chat to load');
    
    let messageBox = document.querySelectorAll("[contenteditable='true']")[1]; 
    if(!messageBox) {
        console.error('[WhatsApp Monitor] ❌ Message box not found!');
        return;
    }
    console.log('[WhatsApp Monitor] ✅ Message box found');
    
    let resolveValues = new Promise(function(resolve, reject){
        chrome.storage.sync.get({"values": true}, function(options){ resolve(options.values); })
    });
    let resolveResponse = new Promise(function(resolve, reject){
        chrome.storage.sync.get({"response": true}, function(options){ resolve(options.response); })
    });
    let values = await resolveValues; let response = await resolveResponse;
    console.log(`[WhatsApp Monitor] 🔑 Keywords: ${values}`);
    console.log(`[WhatsApp Monitor] 💬 Responses: ${response}`);
    
    //these stage are inside interval

    let count = null;
    let len = null;
    let iniLen = null;
    let incoming  = null;
    let monitorChats = async function(){
        
        len = document.querySelectorAll("span._ao3e").length;
        if(!count){
            iniLen = len;
            console.log('[WhatsApp Monitor] 🎯 Monitoring started, initial message count:', iniLen);
        }
        count = len === 0 ? 0  : len-1
        if(len!=iniLen){
            incoming = document.querySelectorAll("span._ao3e")[count].textContent;
            console.log(`[WhatsApp Monitor] 📩 New message detected: "${incoming}"`);
            
            iniLen = len
            if(!checkInput(incoming,values.split(','))){
                console.log('[WhatsApp Monitor] ⏭️  No keyword match, ignoring');
                return
            }
            
            console.log('[WhatsApp Monitor] ✨ KEYWORD MATCHED! Sending response...');
            let responses = response.split(',');
            
            for (i = 0; i < responses.length; i++) { 
                console.log(`[WhatsApp Monitor] 📤 Preparing response ${i+1}/${responses.length}: "${responses[i].trim()}"`);
                
                // Focus the message box
                messageBox.focus();
                
                // Use proper method to set contenteditable text
                messageBox.textContent = '';
                
                // Type the text character by character to simulate real typing
                const textToType = responses[i].trim();
                for(let char of textToType) {
                    messageBox.textContent += char;
                    // Trigger input event for each character
                    const inputEvent = new InputEvent('input', {
                        bubbles: true,
                        cancelable: true,
                        inputType: 'insertText',
                        data: char
                    });
                    messageBox.dispatchEvent(inputEvent);
                }
                
                // Final events to ensure WhatsApp recognizes the text
                messageBox.dispatchEvent(new Event('input', { bubbles: true }));
                messageBox.dispatchEvent(new Event('change', { bubbles: true }));
                
                console.log('[WhatsApp Monitor] 📝 Text typed:', messageBox.textContent);
                
                // Wait a moment for WhatsApp to process
                await sleep(300);
                
                if(responses[i].trim() && values){ 
                    // Try to find send button
                    let sendBtn = document.querySelector('button[aria-label*="Send"]')
                               || document.querySelector('span[data-icon="send"]')
                               || document.querySelector('[data-testid="send"]')
                               || document.querySelector('button[data-testid="send"]');
                    
                    if(sendBtn) {
                        // Get the actual button element
                        const buttonElement = sendBtn.closest('button') || sendBtn;
                        console.log('[WhatsApp Monitor] 🖱️ Clicking send button...');
                        buttonElement.click();
                        console.log('[WhatsApp Monitor] ✅ Response sent via button click!');
                        await sleep(500); // Wait between multiple responses
                    } else {
                        // Fallback: Try Enter key
                        console.log('[WhatsApp Monitor] ⚠️ Send button not found, trying Enter key...');
                        
                        const enterDown = new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true
                        });
                        messageBox.dispatchEvent(enterDown);
                        
                        console.log('[WhatsApp Monitor] 🔄 Enter key dispatched');
                        await sleep(500);
                    }
                }
            }
        }  
    }
            
    }
    startTimer2 = async()=>{ setInterval(monitorChats.bind(),200); } 
    startTimer2()
}
startTimer();
chat()