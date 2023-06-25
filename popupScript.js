chrome.extension.getBackgroundPage().console.log('foo');
// chrome.action.onClicked.addListener(function(tab) {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: () => document.documentElement.outerHTML
//   }, function(results) {
//     const pageContents = results[0].result;
//     console.log(pageContents);
//     // Process or utilize the page contents as needed
//   });
// });
