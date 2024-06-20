chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "sampleContextMenu",
      title: "Sample Context Menu",
      contexts: ["page"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sampleContextMenu") {
      chrome.tabs.create({ url: "https://www.google.com" });
    }
  });