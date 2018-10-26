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
function addCookieToRecentStorage(cookie){

}

function checkStorageResult(result, cookie){
    //this storage entry existed
    if (result.RecentCookies){
        
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