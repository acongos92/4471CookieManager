/*
 * Listener for cookie added messages 
 */

 chrome.runtime.onMessage.addListener(
     function(request, sender, sendResponse){
         if(request.message == "cookieAdded"){

         }
     }
 );
let BlockedDomains = {
    domains: [".aaxads.com", ".scorecardresearch.com"]
}
chrome.storage.local.set({"BlockedDomains" : BlockedDomains}, function(){
    //delete this fame 
});

/*
 * Calls chrome storage APi to get all cookies. calls writeCookieCount to display
 */ 
function populateCookieData(){
    chrome.cookies.getAll({}, function(cookies){
        let cookieDataManager = setupDataManager(cookies);
        writeCookieCount(cookieDataManager.getTotalCookieCount())
        writeUniqueDomainCount(cookieDataManager.getUniqueDomainCounts());
    });
}

/**
 * sets up the data manager object
 * @param {} cookies 
 */
function setupDataManager(cookies){
    var dataManager = new CookieDataManager(cookies);
    return dataManager;
}

/*
 * writes cookie count to popup page
 */ 
function writeCookieCount(count) {
    var display = document.getElementById("cookieCount");
    display.innerHTML = "cookie count: " + count;
}

/*
 * writes unique domains to popup page 
 */
function writeUniqueDomainCount(count){
    let uniqueDomains = document.getElementById("uniqueCookieDomains");
    uniqueDomains.innerHTML = "unique domains: " + count;
}

/*
 *
 */
function writeRecentCookieData(recentCookieArr){
    let recentCookieInfo = document.getElementById("recentCookieInfo");
    recentCookieInfo.innerHTML = "Hab dis many: " + recentCookieArr.length;
}

function setupRecentCookieFields(){
    chrome.storage.local.get("RecentCookies", function(result){
        if(result.RecentCookies){
            writeRecentCookieData(result.RecentCookies.data);
        }
    })
}


populateCookieData();
setupRecentCookieFields();
