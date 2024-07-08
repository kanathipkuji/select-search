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
      search(command.at(-1), selection, tab);
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
  if (changes.storedItems && namespace === 'sync') {
    // console.log("Changes todoitem" + changes.storedItems);
    chrome.contextMenus.removeAll(() => {
      // console.log('New Value ' + changes.storedItems.newValue);
      const items = changes.storedItems.newValue || [];
      // console.log('about to create context menus with ' + items);
      createContextMenus(items);
    });
  }
});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  search(item.menuItemId, item.selectionText, tab);
});

async function search(id, text, tab) {
  // console.log('ID: ' + id + ' Text: ' + text + ' Tab: ' + tab.index);
  id = parseInt(id);
  const data = await chrome.storage.sync.get('storedItems');
  const items = data.storedItems || [];

  const item = items.find(item => item.id === id);
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

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}