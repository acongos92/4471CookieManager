/**
 * some object definitions 
 * RecentCookieData{
 *                  name: "string cookie name"
 *                  domain: "string cookie domain"
 *                  storeTime: "datetime this object was added to storage"
 *                  }
 * RecentCookies {
 *                  data: [] //an array of RecentCookieData
 *               }
 * 
 * BlockedDomainData{
 *                  domain: "string blocked domain"
 *
 *                  }
 * 
 * BlockedDomains {
 *                  domains[] //an array of BlockedDomainData
 *                }
 */
function addCookieToRecentStorage(recentCookieData){
    
}
function checkStorageResult(result, cookie){
    //this storage entry existed
    alert("entered new thing");
    let RecentCookieData = {
        name : cookie.name,
        domain : cookie.domain,
        storeTime : "2018"
    }
    if (result.RecentCookies){
        addCookieToRecentStorage(RecentCookieData);
    }else {
        let arr = [RecentCookieData];
        let RecentCookies = {
            data : arr
        }
        chrome.storage.local.set({"RecentCookies" : RecentCookies});
    }
}

function getRecentCookiesAndAddIfNeeded(cookie){
    chrome.storage.local.get("RecentCookies", function(result){
        checkStorageResult(result, cookie)
    });
}
chrome.cookies.onChanged.addListener(function(changeInfo){
    if(changeInfo.cause == "explicit"){
        getRecentCookiesAndAddIfNeeded(changeInfo.cookie)
    }
});