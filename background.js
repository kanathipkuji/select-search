function reloadContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get('storedItems', (data) => {
      const items = data.storedItems || [];
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
      id: `${item.id}`,
      title: item.label,
      contexts: ['selection'],
    });
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.storedItems && namespace === 'sync') {
    console.log("Changes todoitem" + changes.storedItems);
    chrome.contextMenus.removeAll(() => {
      console.log('New Value ' + changes.storedItems.newValue);
      const items = changes.storedItems.newValue || [];
      console.log('about to create context menus with ' + items);
      createContextMenus(items);
    });
  }
});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  search(item.menuItemId, item.selectionText, tab);
});

export async function search(id, text, tab) {
  console.log('ID: ' + id + ' Text: ' + text);
  id = parseInt(id);
  const data = await chrome.storage.sync.get('storedItems');
  const items = data.storedItems || [];

  const item = items.find(item => item.id === id);
  console.log('Matching Item: ' + item);
  if (!item) {
      console.log('No matching saved configurations found');
      return;
  }
  console.log('going to the url');

  const urlString = `${item.url}${encodeURIComponent(text)}`
  console.log('URL string: ' + urlString);
  const url = new URL(urlString);

  console.log('URL: ' + url);
  // url.searchParams.set('q', item.selectionText);
  chrome.tabs.create({ url: url.href, index: tab.index + 1 });
}