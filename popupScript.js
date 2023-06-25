let scrapePage = document.getElementById('scrapePage')

// receive content from content script
chrome.runtime.onMessage.addListener((request, sender, sendresponse) => {
  let content = request.content
  alert(content)
})

scrapePage.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({active: true, currentWindow:true});

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: scrapePageContents,
  })
})

function scrapePageContents() {
  

  let content = document.body.innerHTML

  chrome.runtime.sendMessage({content})
}
