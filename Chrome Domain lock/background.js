chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo["url"] && !changeInfo["url"].startsWith("http://localhost")) {
        console.log(tabId);
        chrome.tabs.update(tabId, {"url": "http://localhost"});
    }
});

chrome.tabs.onCreated.addListener(function(tab) {
    chrome.tabs.getAllInWindow((tabs) => {
        if (tabs.length > 1) {
            chrome.tabs.remove(tab["id"])
        }
    });
});