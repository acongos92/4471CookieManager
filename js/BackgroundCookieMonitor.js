//Expects access to scripts SotrageObjectModels.js and CookieDataManager.js
/*
 * STORAGE AND BLOCKING MANAGEMENT SECTION 
 * ===================================================================================================================
 */

 /**
  * adds a cookie to recent storage, does basic recent storage managemnet including ensuring 
  * no more than 6 cookies are present in recent storage, and that no recent storage entry 
  * exceeds max minimum storage time
  * @param {*} cookie 
  */
function addCookieToRecentStorage(result, cookie){
    let storedArray = result.RecentCookies.data;
    while(storedArray.length >= 6){
        storedArray.shift();
    }
    storedArray.push(buildCookieStorageEntry(cookie));
    result.RecentCookies.data = storedArray;
    chrome.storage.local.set({"RecentCookies" : result.RecentCookies}, function(){
        //dont care for now
    });
}

/**
 * builds the recent storage object and adds the first cookie to it, shouldnt occur but if storage gets corrupted 
 * or dropped somehow after extension installation this should handle it
 * @param {} cookie 
 */
function createStorageEntryAndAddCookie(cookie){
    let RecentCookieData = buildCookieStorageEntry(cookie);
    let RecentCookies = buildRecentCookies();
    RecentCookies.data = [RecentCookieData];
    chrome.storage.local.set({"RecentCookies" : RecentCookies}, function(){
        //dont care for now 
    });
}

/**
 * ensures recent storage exists, creates it if it does not 
 * in both cases adds new cookie entry to recent storage 
 * @param {*} result 
 * @param {*} cookie 
 */
function checkStorageResult(result, cookie){
    //this storage entry existed
    if (result.RecentCookies){
        addCookieToRecentStorage(result, cookie)
    }else {
        createStorageEntryAndAddCookie(cookie);
    }
}

/**
 * adds a new cookie to existing recent storage 
 * @param {*} cookie 
 */
function addNewCookieToRecentStorage(cookie){
    chrome.storage.local.get("RecentCookies", function(result){
        checkStorageResult(result, cookie)
    });
}

/**
 * 
 * @param {*} cookie 
 */
function getRecentCookiesAndAddOrDelete(cookie){
    chrome.storage.local.get("BlockedDomains", function(result){
        if (result.BlockedDomains && result.BlockedDomains.domains.includes(cookie.domain)){
            deleteBlockedCookie(cookie.name, cookie.domain + cookie.path);
        }else{
            addNewCookieToRecentStorage(cookie);
        }
    });
}

function incrementBlockedCookieCount(){
    chrome.storage.local.get("AutoBlockedCount", function(result){
        if(result.AutoBlockedCount != null){
            result.AutoBlockedCount++;
            chrome.storage.local.set({"AutoBlockedCount" : result.AutoBlockedCount}, function(){
                //not interested in the result of this callback right now 
            })
        }
    })
}

/**
 * removes a cookie from storage
 * @param {} cookieName 
 * @param {*} cookieDomain 
 */
function deleteBlockedCookie(cookieName, cookieDomain){
    let qualifiedDomain = "https://" + cookieDomain; 
    chrome.cookies.remove({"url" : qualifiedDomain, "name": cookieName}, function(details){
        incrementBlockedCookieCount();
    });
}

/*
 * ===================================================================================================================
 */

/*
 * STALKER RANK MANAGEMENT SECTION 
 *  ===================================================================================================================
 */

/**
 * takes a url and removes all non domain information, with the exception of leaving a "www" prefix if one exists 
 * returns the string representing the url with unrelated information removed 
 * @param {*} url 
 */
function toUsefulString(url){
	let i = 0;
    let usefulArr = [];
    let foundFirstState = false;
	while (i < url.length){
        if(foundFirstState){
			if(url[i] != "/"){
            	usefulArr.push(url[i]);
            }else{
				break;
            }
        }else if (url[i] == "/"){
			foundFirstState = true;
			i++;
        }
		i++;
    }
	return usefulArr.join("");
}

function stripInternetPrefixes(untrimmedDomain){
    let trimmedDomain = "fail"
    if (untrimmedDomain.length > 3 && untrimmedDomain.substring(0, 4) == "www."){
        trimmedDomain = untrimmedDomain.slice(4, untrimmedDomain.length);
    }else if (untrimmedDomain.length > 4 && untrimmedDomain.substring(0, 5) == ".www."){
        trimmedDomain = untrimmedDomain.slice(5, untrimmedDomain.length);
    }else if(untrimmedDomain.length > 0 && untrimmedDomain[0] == "."){
        trimmedDomain = untrimmedDomain.slice(1, untrimmedDomain.length);
    }else {
        trimmedDomain = untrimmedDomain;
    }
    return trimmedDomain;
}

/**
 * updates the analytics associated with a url to include that it stored data 
 * associated with a third party cookie, assumes validity of url and cookie
 * @param {*} url the url of the site being browsed 
 * @param {*} cookie the cookie stored by url 
 */
function updateWebsiteStalkerStats(url, cookie){
    chrome.storage.local.get("StalkerRank", function(result){
        if (result.StalkerRank){
            let data = result.StalkerRank.PageData;
            if(data[url]){
                data[url].foreignCookieCount++;
                if (!data[url].foreignDomains.includes(cookie.domain)){
                    data[url].foreignDomains.push(cookie.domain);
                }
            }else{
                data[url] = {
                    foreignCookieCount: 1,
                    foreignDomains: [cookie.domain]
                }
            }
            console.log(result);
            chrome.storage.local.set({"StalkerRank" : result.StalkerRank}, function(){
                //dont care
            })
        }
    });
}
/**
 * compares the url and cookie domains to determine if they 
 * came from the same place, if they didnt we want to update 
 * the URL's stalker rank to indicate additional third part cookie storage
 * @param {} url 
 * @param {*} cookie 
 */
function stripAndUpdateStalkerRank(url, cookie){
    if (url != null){
        let untrimmed = toUsefulString(url);
        let trimmedTabDomain = stripInternetPrefixes(untrimmed);
        let trimmedCookieDomain = stripInternetPrefixes(cookie.domain);
        if (!(trimmedTabDomain.includes(trimmedCookieDomain))){
            //cookie was not directly associated with the URL, add to stalker stats 
            updateWebsiteStalkerStats(trimmedTabDomain, cookie);   
        }
    }

}
function updateStalkerRankIfPossible(cookie){
    chrome.tabs.query({}, function(tabs){
        if (tabs.length == 1 ){
            chrome.storage.local.get("RecentBrowsingHistory", function(result){
                /*
                 * sorry bout this insane statement, but its standard null checks, then checking if recent 
                 * browsing history contains the stripped down url, if it does its likely we have a late 
                 * cookie storage request, and we dont want to add this to the stalker ranking 
                 * essentially electing that false negatives are better than false positives for this analytic
                 */
                
                if(result != null && result.RecentBrowsingHistory != null && tabs[0].url != null){
                    let stripped = stripInternetPrefixes(cookie.domain);
                    if(!(result.RecentBrowsingHistory.recents.includes(stripped))){
                            stripAndUpdateStalkerRank(tabs[0].url, cookie);
                        }
                }

            });
        }
    })
}

/*
 * ===================================================================================================================
 */

/**
 * listens for an "explicit" cookie update meaning one has been removed or set 
 */
chrome.cookies.onChanged.addListener(function(changeInfo){
    if(changeInfo.cause == "explicit"){
        /*
         * explicit can be cookie removal, check if this was the case
         */ 
        let qualifiedDomain = "http://" + changeInfo.cookie.domain; 
        chrome.cookies.get({"url" : qualifiedDomain, "name" : changeInfo.cookie.name}, function(result){
            if(result != null){
                getRecentCookiesAndAddOrDelete(changeInfo.cookie);
                updateStalkerRankIfPossible(changeInfo.cookie);
            }
        });
    }
});

function attemptAddToRecentBrowsing(url){
    chrome.storage.local.get("RecentBrowsingHistory", function(result){
        if(result != null && result.RecentBrowsingHistory != null){
            let data = result.RecentBrowsingHistory.recents;
            if (data.length < 15){
                data.push(url);
            }else {
                data.shift();
                data.push(url);
            }
            result.RecentBrowsingHistory.recents = data;
            chrome.storage.local.set({"RecentBrowsingHistory": result.RecentBrowsingHistory}, function(){
                //callback dont care but we could probably start checking for exceptions
            });
        }
    });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(tab.url != null){
        attemptAddToRecentBrowsing(stripInternetPrefixes(toUsefulString(tab.url)));
    }
});
