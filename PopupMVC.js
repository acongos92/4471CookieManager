/**
 * File holds model view and controller class for popup window 
 */


/**
 * popup view manipulation methods 
 */
class PopupView {
    constructor(popupController) {
        this.cookieCount = document.getElementById("cookieCount");
        this.uniqueDomains = document.getElementById("uniqueCookieDomains");
        this.recentCookies = document.getElementById("recentCookieInfo");
        this.buttonPanel = document.getElementById("cookieBlockerPanel");
        this.popupController = popupController;
    }

    /**
     * View Manipulation methods
     */

     writeCookieCount(countString){
         this.cookieCount.innerHTML = countString;
     }

     writeUniqueDomainCount(domainString){
         this.uniqueDomains.innerHTML = domainString;
     }

     writeRecentCookieCount(recentCookieString){
        this.recentCookies.innerHTML = recentCookieString;
     }

     addNewRecentCookie(cookieName, cookieDomain){
         let table = document.getElementById("recentCookieTable");
         let row = table.insertRow(table.rows.length);
         let cell1 = row.insertCell(0);
         cell1.innerHTML = cookieName;
         let cell2 = row.insertCell(1);
         cell2.innerHTML = cookieDomain;
     }

}

/**
 * popup controller class handles all logic around popup 
 */
class PopupController {
    constructor(){
        this.view = new PopupView(this);
        this.model = new PopupModel();
        this.model.setupRecentCookieData(this.model, this);
        this.model.setupStoredCookieData(this.model, this);
    }

    onStoredCookieDataReadyCallback(){
        this.view.writeCookieCount("cookie count: " + 
                                    this.model.getCookieArr().length);
        this.view.writeUniqueDomainCount("unique domains: " + 
                                        this.model.getUniqueDomainArray().length);
    }

    onRecentCookieDataReadyCallback(){
        let recents = this.model.getRecentCookieArray();
        this.view.writeRecentCookieCount("Recently Added Cookies: " + recents.length);
        for(let i = 0; i < recents.length; i++){
            this.view.addNewRecentCookie(recents[i].name, recents[i].domain);
        }

    }


}

/**
 * popup model class handles basic data storage and async 
 * retrieval
 */
class PopupModel {
    constructor(){
        
    }

    /**
     * loads cookie data from storage
     * @param {} callback 
     */
    setupStoredCookieData(modelRef, controllerRef){
         chrome.cookies.getAll({}, function(cookies){
            modelRef.setupCookieDataManager(cookies);
            controllerRef.onStoredCookieDataReadyCallback();
         });
    }

    /**
     * loads chrome storage of recent cookies
     * @param {} callback 
     */
    setupRecentCookieData(modelRef, controllerRef){
        chrome.storage.local.get("RecentCookies", function(result){
            if (result.RecentCookies){
                modelRef.setupRecentCookieFieldObject(result.RecentCookies);
                controllerRef.onRecentCookieDataReadyCallback();
            }
        });
    }
    
    /**
     * returns the array of cookie data
     */
    getCookieArr(){
        return this.cookieDataManager.getCookieArr();
    }

    getUniqueDomainArray(){
        return this.cookieDataManager.getUniqueDomainNameArray();
    }

    getRecentCookieArray(){
        return this.recentCookieArray;
    }

    /**
     * "private" methods (still accessible elsewhere, not intended to be called 
     * elsewhere)
     */

         /**
     * sets the CookieDataManager object of this
     * @param {*} cookies 
     */
    setupCookieDataManager(cookies){
        this.cookieDataManager = new CookieDataManager(cookies);
    }

    setupRecentCookieFieldObject(recentCookies){
        this.recentCookieArray = recentCookies.data;
    }


}
