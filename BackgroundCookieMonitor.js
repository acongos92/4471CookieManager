chrome.cookies.onChanged.addListener(function(changeInfo){
    if(changeInfo.cause == "explicit"){
        chrome.runtime.sendMessage({message: "cookieAdded", cookie: changeInfo}, function(response){
            //nothing here 
        })
    }
});