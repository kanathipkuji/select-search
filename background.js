import { search } from './content.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-gg",
    title: "Search on Google",
    contexts: ["selection"]
  });

  // chrome.storage.sync.get(['googleSearchShortcut', 'youtubeSearchShortcut'], (result) => {
  //   if (!result.googleSearchShortcut) {
  //     chrome.storage.sync.set({ googleSearchShortcut: "Alt+G" });
  //   }
  //   if (!result.youtubeSearchShortcut) {
  //     chrome.storage.sync.set({ youtubeSearchShortcut: "Alt+Y" });
  //   }
  // });
});
  
chrome.contextMenus.onClicked.addListener((item, tab) => {
  if (item.menuItemId === "search-gg") {
    chrome.scripting
    .executeScript({
      target : {tabId : tab.id},
      func : search,
      args : [ tab ],
    })
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "search-gg" || command === "search-yt") {
    chrome.scripting
    .executeScript({
      target : {tabId : tab.id},
      func : search,
      args : [ tab, command ],
    })
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.googleSearchShortcut) {
      chrome.commands.update({
        name: 'search-gg',
        shortcut: changes.googleSearchShortcut.newValue
      });
    }
    if (changes.youtubeSearchShortcut) {
      chrome.commands.update({
        name: 'search-yt',
        shortcut: changes.youtubeSearchShortcut.newValue
      });
    }
  }
});

// chrome.storage.onChanged.addListener(({ enabledTlds }) => {
//   if (typeof enabledTlds === 'undefined') return;

//   const allTlds = Object.keys(tldLocales);
//   const currentTlds = new Set(enabledTlds.newValue);
//   const oldTlds = new Set(enabledTlds.oldValue ?? allTlds);
//   const changes = allTlds.map((tld) => ({
//     tld,
//     added: currentTlds.has(tld) && !oldTlds.has(tld),
//     removed: !currentTlds.has(tld) && oldTlds.has(tld)
//   }));

//   for (const { tld, added, removed } of changes) {
//     if (added) {
//       chrome.contextMenus.create({
//         id: tld,
//         title: tldLocales[tld],
//         type: 'normal',
//         contexts: ['selection']
//       });
//     } else if (removed) {
//       chrome.contextMenus.remove(tld);
//     }
//   }
// });

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage change detected:', changes);
});
