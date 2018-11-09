'use strict';


/**
 * sets up storage for recent cookies and blocked domains
 */
function initialStorageSetup(){
  let RecentCookies = buildRecentCookies();
  let BlockedDomains = buildBlockedDomains();
  let StalkerRank = buildStalkerRank();
  let RecentBrowsingHistory = buildRecentBrowsingHistory();
  chrome.storage.local.set({"RecentCookies" : RecentCookies}, function(){
    //callback once the async storage call is complete 
  });

  chrome.storage.local.set({"BlockedDomains" : BlockedDomains}, function(){
    //callback once hte async storage call is complete
  });

  chrome.storage.local.set({"AutoBlockedCount" : 0}, function(){
    //callback again, still dont intend to do anything here 
  });

  chrome.storage.local.set({"StalkerRank" : StalkerRank}, function(){
    //callback for third storage entry, still dont care
  });

  chrome.storage.local.set({"RecentBrowsingHistory" : RecentBrowsingHistory}, function(){
    //callback dont care
  })
}

chrome.runtime.onInstalled.addListener(function() {
  //setup recent and blocked domain storage 
  initialStorageSetup();
});





