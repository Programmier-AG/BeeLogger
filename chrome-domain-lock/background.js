url = "http://localhost"

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo["url"] && !changeInfo["url"].startsWith(url)) {
        if (tab["pendingUrl"] == "chrome://newtab/") {
            chrome.tabs.getAllInWindow((tabs) => {
                if (tabs.length > 1) {
                    if (tab["pendingUrl"].startsWith("chrome://") && tab["pendingUrl"] != "chrome://newtab/") { return; }
                    chrome.tabs.remove(tab["id"])
                } else {
                    chrome.tabs.update(tabId, {"url": url});
                }
            });
        }
        if (changeInfo["url"].startsWith("chrome://")) { return };
        console.log(tabId);
        chrome.tabs.update(tabId, {"url": url});
    }
});

chrome.tabs.onCreated.addListener(function(tab) {
    console.log(tab);
    chrome.tabs.getAllInWindow((tabs) => {
        if (tabs.length > 1) {
            if (tab["pendingUrl"] == "chrome://newtab/") { chrome.tabs.remove(tab["id"]); }
            if (tab["pendingUrl"].startsWith("chrome://")) { return; }
            chrome.tabs.remove(tab["id"]);
        }
    });
});
