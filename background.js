import { search } from './content.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-gg",
    title: "Search on Google",
    contexts: ["selection"]
  });
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

