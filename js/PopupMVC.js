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

     clearRecentCookieTable(){
        while(this.recentCookieTable.rows.length > 1){
            this.removeRecentCookieRowFromView(1);
        }
     }



}

/**
 * popup controller class handles all logic around popup 
 */
class PopupController {
    constructor(){
        this.view = new PopupView(this);
        this.model = new PopupModel(this);
        this.model.setupRecentCookieData(this.model, this);
        this.model.setupStoredCookieData();
    }

    /**
     * stored cookie data loading callback
     */
    onStoredCookieDataReadyCallback(){
        this.view.writeCookieCount("blocked cookie count: " + 
                                    this.model.getBlockedCount());
    }

    /**
     * recent cookie added data loading callback
     */
    onRecentCookieDataReadyCallback(){
        this.drawRecentCookieDataToTable();
    }

    /**
     * sets the recently added cookie number
     */
    drawRecentCookieDataToTable(){
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
        chrome.cookies.remove({"url" : qualifiedDomain, "name": cookieName}, function(details){
            //update the model counters 
            modelRef.setupStoredCookieData();
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

    /**
     * removes a single cookie from the extensions RecentCookie storage,
     * updates storage to reflect this change
     * @param {*} name 
     * @param {*} domain 
     */
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

    /**
     * adds a domain name to blocked domain list and calls functions to clear 
     * cookies already in storage that are part of the newly blocked domain
     * @param {*} domainName 
     */
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
        this.clearBlockedCookieFromRecents(domainName);
    }

    /**
     * checks every stored cookie to see if it is from a newly blocked domain
     * if so the cookie is removed from storage 
     * @param {*} blockedDomains 
     */
    clearExistingCookiesFromBlockedDomains(blockedDomains){
        let cookies = this.model.getCookieArr();
        let toBeDeleted = [];
        for (let i = 0; i <cookies.length; i++){
            if(blockedDomains.includes(cookies[i].domain)){
                toBeDeleted.push(cookies[i]);

            }
        }
        for (let i = 0; i <toBeDeleted.length; i++){
            this.deleteBlockedCookie(toBeDeleted[i].name, toBeDeleted[i].domain + toBeDeleted[i].path);
        }
    }

    /**
     * when a user selects block domain, it is possible that several cookies from
     * that blocked domain exist in the recents list, this function clears those and
     * ensures recent cookies is set and displayed correctly 
     * @param {*} blockedDomainName 
     */
    clearBlockedCookieFromRecents(blockedDomainName){
        let modelRef = this.model;
        let viewRef = this.view;
        let controllerRef = this;
        chrome.storage.local.get("RecentCookies", function(results){
            if (results.RecentCookies && results.RecentCookies.data){
                let newData = [];
                for (let i = 0; i < results.RecentCookies.data.length; i++){
                    if (results.RecentCookies.data[i].domain != blockedDomainName){
                        newData.push(results.RecentCookies.data[i]);
                    }
                }
                results.RecentCookies.data = newData;
                chrome.storage.local.set({"RecentCookies": results.RecentCookies}, function(){
                    viewRef.clearRecentCookieTable();
                    modelRef.setupRecentCookieData(modelRef, controllerRef);
                });
            }
        });
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
            controllerRef.incrementBlockedCookieCount();
            modelRef.setupStoredCookieData();
        });
    }

    incrementBlockedCookieCount(){
        chrome.storage.local.get("AutoBlockedCount", function(result){
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

    constructor(controller){
        this.controller = controller
    }

    /**
     * loads cookie data from storage
     * @param {} callback 
     */
    setupStoredCookieData(){
        let controllerRef = this.controller;
        let modelRef = this;
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
                
            }

        });
        chrome.storage.local.get("AutoBlockedCount", function(result){
            if(result.AutoBlockedCount != null){
                modelRef.setBlockedCount(result.AutoBlockedCount);
                controllerRef.onRecentCookieDataReadyCallback();
            }
            
        });
    }

    setBlockedCount(count){
        this.count = count;
    }

    getBlockedCount(){
        return this.count;
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
