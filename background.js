import { search } from './content.js';

function reloadContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get('todoItems', (data) => {
      const items = data.todoItems || [];
      createContextMenus(items);
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  reloadContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  reloadContextMenus();
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

// chrome.storage.onChanged.addListener((changes, namespace) => {
//   if (namespace === 'sync') {
//     if (changes.googleSearchShortcut) {
//       chrome.commands.update({
//         name: 'search-gg',
//         shortcut: changes.googleSearchShortcut.newValue
//       });
//     }
//     if (changes.youtubeSearchShortcut) {
//       chrome.commands.update({
//         name: 'search-yt',
//         shortcut: changes.youtubeSearchShortcut.newValue
//       });
//     }
//   }
// });

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

function createContextMenus(items) {
  items.forEach((item) => {
    chrome.contextMenus.create({
      id: item.label,
      title: item.label,
      contexts: ['selection'],
    });
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.todoItems && namespace === 'sync') {
    console.log("Changes todoitem" + changes.todoItems);
    chrome.contextMenus.removeAll(() => {
      console.log('New Value ' + changes.todoItems.newValue);
      const items = changes.todoItems.newValue || [];
      console.log('about to create context menus with ' + items);
      createContextMenus(items);
    });
  }
});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  chrome.scripting.executeScript({
    target : {tabId : tab.id},
    func : search,
    args : [ item.menuItemId, item.selectionText ],
  });
});