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

            	usefulArr.push(website[i]);
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

/**
 * compares the url and cookie domains to determine if they 
 * came from the same place, if they didnt we want to update 
 * the URL's stalker rank to indicate additional third part cookie storage
 * @param {} url 
 * @param {*} cookie 
 */
function stripAndUpdateStalkerRank(url, cookie){

}
function updateStalkerRankIfPossible(cookie){
    chrome.tabs.query({}, function(tabs){
        if (tabs.length == 1){

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
        })
    }
});
