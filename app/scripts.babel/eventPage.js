'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);

  chrome.tabs.create({
    url: chrome.extension.getURL('../askPermission.html'),
    active: true
  })
});

chrome.browserAction.setBadgeText({text: 'listen'});
