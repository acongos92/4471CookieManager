
/*
 * Calls chrome storage APi to get all cookies. calls writeCookieCount to display
 */ 
function getCookieCountAsync(){
    chrome.cookies.getAll({}, function(store){
        writeCookieCount(store.length)
        let uniqueDomains = countUniqueDomains(store);
        writeUniqueDomainCount(uniqueDomains);
        console.log(store);
    });
}

/*
 * Gets a count of cookies and displays on the popup
 */
function getCookieCount(){
    getCookieCountAsync();
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
 * counts the unique cookie domains 
 */
function countUniqueDomains(cookies){
    let uniques = [];
    for (let i = 0; i < cookies.length; i++){
        if(!uniques.includes(cookies[i].domain)){
            uniques.push(cookies[i].domain)
        }
    }
    return uniques.length;
}


getCookieCount();
