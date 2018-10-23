/*
 * Reads cookie information from the current active tab 
 */
chrome.storage.local.get("top", function(result){
    console.log(result.top);
})

