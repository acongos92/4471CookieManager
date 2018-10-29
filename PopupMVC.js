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
        this.recentCookieTable = document.getElementById("recentCookieTable");
        this.popupController = popupController;
        //defines the maximum string length which can be displayed in cookie table
        this.maxStringLength = 11;
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

     addNewRecentCookieNameAndDomain(cookieName, cookieDomain){
         let row = this.recentCookieTable.insertRow(this.recentCookieTable.rows.length);
         let cell1 = row.insertCell(0);
         if (cookieName.length > this.maxStringLength){
             cell1.innerHTML = cookieName.substring(0, this.maxStringLength) + " ...";
         }else{
            cell1.innerHTML = cookieName;
         }
         let cell2 = row.insertCell(1);
         if (cookieDomain.length > this.maxStringLength){
             cell2.innerHTML = cookieDomain.substring(0, this.maxStringLength) + " ..."
         }else {
            cell2.innerHTML = cookieDomain;
         }
        let popupControllerRef = this.popupController;
        let deleteBtn = document.createElement("BUTTON");
        deleteBtn.innerHTML = "delete";
        let cell3 = row.insertCell(2);
        cell3.appendChild(deleteBtn);
        let cell4 = row.insertCell(3);
        let blockBtn = document.createElement("BUTTON");
        blockBtn.innerHTML = "block";
        cell4.appendChild(blockBtn);
        deleteBtn.addEventListener("click", function() {popupControllerRef.deleteCookieClicked(row.rowIndex)}, false);
        blockBtn.addEventListener("click", function(){popupControllerRef.blockDomainClicked(row.rowIndex)}, false);
     }

     /**
      * removes a row from this.recentCookies
      * @param {} rowNumber 
      */
     removeRecentCookieRowFromView(rowNumber){
        this.recentCookieTable.deleteRow(rowNumber);
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
            this.view.addNewRecentCookieNameAndDomain(recents[i].name, recents[i].domain);
        }

    }

    /**
     * removes a single cookie from browser storage
     * rowNumber corresponds to an index in recentCookieArray - 1 
     * I.E if rowNumber = 1 then the corresponding index of recentCookieArray
     * is 0 
     * @param {} rowNumber 
     */
    deleteCookieClicked(rowNumber){
        let model = this.model.getRecentCookieArray();
        let qualifiedDomain = "https://"  + model[rowNumber - 1].domain;
        let cookieName = model[rowNumber - 1].name
        //remove cookie from browser storage
        let modelRef = this.model; 
        let controllerRef = this;
        chrome.cookies.remove({"url" : qualifiedDomain, "name": cookieName}, function(details){
            console.log(details);
            //update the model counters 
            modelRef.setupStoredCookieData(modelRef, controllerRef);
        });
        //remove cookie from extension storage
        this.removeCookieFromExtensionRecentStorage(model[rowNumber -1].name, model[rowNumber -1].domain);
        //update model
        this.model.removeEntryFromRecents(rowNumber -1);
        this.view.writeRecentCookieCount("Recently Added Cookies: " + this.model.getRecentCookieArray().length);
        //update view
        this.view.removeRecentCookieRowFromView(rowNumber);
    }

    /**
     * responds to block domain clicked event. permanantly blocks a domain 
     * from storing cookie on browser
     * @param {} rowNumber 
     */
    blockDomainClicked(rowNumber){
        let model = this.model.getRecentCookieArray();
        this.addDomainToBlockedList(model[rowNumber - 1].domain);
        this.model.removeEntryFromRecents(rowNumber - 1);
        this.view.removeRecentCookieRowFromView(rowNumber);
    }

    removeCookieFromExtensionRecentStorage(name, domain){
        chrome.storage.local.get("RecentCookies", function(result){
            if (result.RecentCookies && result.RecentCookies.data){
                for (let i = 0; i < result.RecentCookies.data.length; i++){
                    if (result.RecentCookies.data[i].name == name && result.RecentCookies.data[i].domain == domain){
                        result.RecentCookies.data.splice(i, 1);
                    }
                }
                chrome.storage.local.set({"RecentCookies" : result.RecentCookies}, function(){
                    //callback, dont care about result for now
                })
            }
        });
    }

    addDomainToBlockedList(domainName){
        let controllerRef = this;
        chrome.storage.local.get("BlockedDomains", function(result){
            if (result.BlockedDomains && result.BlockedDomains.domains){
                if (!result.BlockedDomains.domains.includes(domainName)){
                    result.BlockedDomains.domains.push(domainName);
                }
                controllerRef.clearExistingCookiesFromBlockedDomains(result.BlockedDomains.domains);
                chrome.storage.local.set({"BlockedDomains" : result.BlockedDomains}, function(){
                    //dont care about the result of set for now 
                });
            }
        });
    }

    clearExistingCookiesFromBlockedDomains(blockedDomains){
        let cookies = this.model.getCookieArr();
        for (let i = 0; i <cookies.length; i++){
            if(blockedDomains.includes(cookies[i].domain)){
                this.deleteBlockedCookie(cookies[i].name, cookies[i].domain);
            }
        }
    }


    //Below two functions are duplicated from BackgroundCookieMonitor
    /**
     * removes a cookie from storage
     * @param {} cookieName 
     * @param {*} cookieDomain 
     */
    deleteBlockedCookie(cookieName, cookieDomain){
        let qualifiedDomain = "https://" + cookieDomain; 
        let controllerRef = this;
        let modelRef = this.model; 
        chrome.cookies.remove({"url" : qualifiedDomain, "name": cookieName}, function(details){
            console.log(details);
            controllerRef.incrementBlockedCookieCount();
            modelRef.setupStoredCookieData(modelRef, controllerRef);
        });
    }

    incrementBlockedCookieCount(){
        chrome.storage.local.get("AutoBlockedCount", function(result){
            console.log("blocked cookie count");
            console.log(result);
            if(result.AutoBlockedCount != null){
                result.AutoBlockedCount++;
                chrome.storage.local.set({"AutoBlockedCount" : result.AutoBlockedCount}, function(){
                    //not interested in the result of this callback right now 
                })
            }
        })
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

    removeEntryFromRecents(index){
        this.recentCookieArray.splice(index, 1);
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
