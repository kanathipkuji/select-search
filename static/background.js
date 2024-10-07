function reloadContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get('items', (store) => {
      const items = store.items || [];
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
  
function _getSelection() { return getSelection().toString(); }

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "search-url-1" || command === "search-url-2" || command === "search-url-3" || command === "search-url-4" || command === "search-url-5") {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: _getSelection,
    }).then(injectionResults => {
      if (!injectionResults) return;
      const selection = injectionResults[0].result;
      if (!selection) return;
      // console.log(selection);
      search(command.at(-1) - 1, selection, tab, true);
    });
  }
});

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
  if (changes.items && namespace === 'sync') {
    // console.log("Changes todoitem" + changes.items);
    chrome.contextMenus.removeAll(() => {
      // console.log('New Value ' + changes.items.newValue);
      const items = changes.items.newValue || [];
      // console.log('about to create context menus with ' + items);
      createContextMenus(items);
    });
  }
});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  console.log(item.menuItemId);
  search(item.menuItemId, item.selectionText, tab, false);
});

async function search(id, text, tab, byIndex) {
  console.log('ID: ' + id + ' Text: ' + text + ' Tab: ' + tab.index);
  // id = parseInt(id);
  console.log(id);
  const store = await chrome.storage.sync.get('items');
  console.log(store);
  const items = store.items || [];
  let item = null;

  if (byIndex) {
    item = items.at(id);
  } else {
    item = items.find(item => item.id === id);
  }
  // console.log('Matching Item: ' + item);
  if (!item) {
      console.log('No matching saved configurations found.');
      return;
  }

  const urlString = `${item.url}${encodeURIComponent(text)}`
  const url = new URL(urlString);

  // console.log('URL: ' + url);
  // url.searchParams.set('q', item.selectionText);
  chrome.tabs.create({ url: url.href, index: tab.index + 1 });
}

// async function getCurrentTab() {
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }