
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


populateCookieData();
