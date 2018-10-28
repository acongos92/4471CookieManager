//Expects access to scripts SotrageObjectModels.js and CookieDataManager.js
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
    result.data = storedArray;
    chrome.storage.local.set({"RecentCookies" : result}, function(){
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

function checkStorageResult(result, cookie){
    //this storage entry existed
    if (result.RecentCookies){
        addCookieToRecentStorage(result, cookie)
    }else {
        createStorageEntryAndAddCookie(cookie);
    }
}

function addNewCookieToRecentStorage(cookie){
    chrome.storage.local.get("RecentCookies", function(result){
        console.log("Recent cookie store");
        console.log(result);
        checkStorageResult(result, cookie)
    });
}

function getRecentCookiesAndAddOrDelete(cookie){
    chrome.storage.local.get("BlockedDomains", function(result){
        console.log("Blocked cookie store");
        console.log(result);
        if (result.BlockedDomains && result.BlockedDomains.domains.includes(cookie.domain)){
            deleteBlockedCookie(cookie.name, cookie.domain);
        }else{
            addNewCookieToRecentStorage(cookie);
        }
    });
}

function incrementBlockedCookieCount(){
    chrome.storage.local.get("BlockedCookieCount", function(result){
        console.log("blocked cookie count");
        console.log(result);
        if(result.BlockedCookieCount != null){
            result.BlockedCookieCount++;
            chrome.storage.local.set({"BlockedCookieCount" : result.BlockedCookieCount}, function(){
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
    let qualifiedDomain = "http://" + cookieDomain; 
    chrome.cookies.remove({"url" : qualifiedDomain, "name": cookieName}, function(details){
        incrementBlockedCookieCount();
    });
}

/**
 * listens for an "explicit" cookie update meaning one has been removed or set 
 */
chrome.cookies.onChanged.addListener(function(changeInfo){
    if(changeInfo.cause == "explicit"){
        getRecentCookiesAndAddOrDelete(changeInfo.cookie)
    }
});