
/*
 * Calls chrome storage APi to get all cookies. calls writeCookieCount to display
 */ 
function getCookieCountAsync(){
    chrome.cookies.getAll({}, function(store){
        writeCookieCount(store.length)
    });
}

/*
 * Gets a count of cookies and displays on the popup
 */
function getCookieCount(){
    getCookieCountAsync();
}

function writeCookieCount(count) {
    var display = document.getElementById("cookieCountId");
    display.innerHTML = count;
}


getCookieCount();
