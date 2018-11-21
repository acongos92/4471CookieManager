class DomainInfoModel{
    constructor(domainInfoController){
        this.controller = domainInfoController;   
    }

    /*
     * public methods
     */ 

    setupData(){
        this.setupCookieManager();
    }

    getDomainsArray(){
        return this.domains;
    }

    getDomainsWithCounts(){
        return this.domainsWithCounts;
    }

    removeDomainFromModel(rowIndex){
        let name = this.domains[rowIndex];
        this.domains.splice(rowIndex, 1);
        delete this.domainsWithCounts[name];
        return name;
    }

     /*
      * "private" methods
      */ 
    setupCookieManager(){
        let modelRef = this;
        chrome.cookies.getAll({}, function(cookies){
            if(cookies != null){
                modelRef.getDataFromCookieManager(cookies);
            }
        });
    }

    /**
     * sets up the cookie manager member and informs controller data set updated
     * @param {} cookies cookies stored on browser to be added to manager
     */
    getDataFromCookieManager(cookies){
        this.cookieManager = new CookieDataManager(cookies);
        this.domains = this.cookieManager.getUniqueDomainNameArray();
        this.domainsWithCounts = this.cookieManager.getUniqueDomainNameAndCounts();
        this.controller.onDataReadyCallback();
    }

}

class DomainInfoView{
    constructor(domainInfoController){
        this.controller = domainInfoController;
        this.parentSection = document.getElementById("domainInfoSection");
        this.table = document.getElementById("domainInfoTable").getElementsByTagName("tbody")[0];
    }

    appendTableRow(domainName, domainCount){
        let row = this.table.insertRow(this.table.rows.length);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = domainName;
        let cell2 = row.insertCell(1);
        cell2.innerHTML = domainCount;
        
        let cell3 = row.insertCell(2);
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "block";
        btn.className = "btn btn-success";
        cell3.appendChild(btn);
        let controllerRef = this.controller;
        btn.addEventListener("click", function(){controllerRef.blockDomainClicked(row.rowIndex)}, false);
  
    }

    hideSection(){
        this.parentSection.style.display = "none";
    }

    showSection(){
        this.parentSection.style.display = "block";
    }

    removeTableRow(rowIndex){
        this.table.deleteRow(rowIndex);
    }
}

class DomainInfoController{
    constructor(){
        this.view = new DomainInfoView(this);
        this.model = new DomainInfoModel(this);
        this.initSection();
    }

    /*
     * public methods 
     */ 
    blockDomainClicked(rowIndex){
        this.view.removeTableRow(rowIndex - 1);
        let domainName = this.model.removeDomainFromModel(rowIndex - 1);
        this.addDomainToBlockedAndPurge(domainName);
    }
    
    detailsDomainClicked(rowIndex){
        this.view.removeTableRow(rowIndex - 1);
        let domainName = this.model.removeDomainFromModel(rowIndex - 1);
        this.addDomainToBlockedAndPurge(domainName);
    }

    /*
     * model storage retrieval callbacks
     */
    onDataReadyCallback(){
        let domainsWithCounts = this.model.getDomainsWithCounts();
        let domainsArray = this.model.getDomainsArray();
        for(let i = 0; i < domainsArray.length; i++){
            this.view.appendTableRow(domainsArray[i], domainsWithCounts[domainsArray[i]]);
        }
    }


    /*
     * New Domain blocking implementation 
     */
    addDomainToBlockedAndPurge(domainName){
        chrome.storage.local.get("BlockedDomains", function(result){
            if(result.BlockedDomains && result.BlockedDomains.domains){
                if (!result.BlockedDomains.domains.includes(domainName)){
                    result.BlockedDomains.domains.push(domainName);
                }
                chrome.storage.local.set({"BlockedDomains" : result.BlockedDomains}, function(){
                    //dont care about the result
                });
            }
        });
        let controllerRef = this;
        chrome.cookies.getAll({}, function(cookies){
            if (cookies != null){
                let newlyBlockedCookies = 0;
                for(let i = 0; i< cookies.length; i++){
                    if(cookies[i].domain == domainName){
                        newlyBlockedCookies++;
                        controllerRef.deleteCookieFromStorage(cookies[i].name, cookies[i].domain+ cookies[i].path);
                    }
                }
                controllerRef.updateAutoBlocked(newlyBlockedCookies);
            }
        });
        chrome.storage.local.get("RecentCookies", function(result){
            if(result.RecentCookies && result.RecentCookies.data){
                let newData = [];
                for (let i = 0; i < result.RecentCookies.data.length; i++){
                    if (result.RecentCookies.data[i].domain != domainName){
                        newData.push(result.RecentCookies.data[i]);
                    }
                }
                result.RecentCookies.data = newData;
                chrome.storage.local.set({"RecentCookies": result.RecentCookies}, function(){

                });
            }
        });
    }

    updateAutoBlocked(number){
        chrome.storage.local.get("AutoBlockedCount", function(result){
            if(result.AutoBlockedCount != null){
                result.AutoBlockedCount += number;
                chrome.storage.local.set({"AutoBlockedCount" : result.AutoBlockedCount}, function(){
                    //not interested in the result of this callback right now 
                })
            }
        })
    }


    deleteCookieFromStorage(cookieName, cookieDomain){
        let qualifiedDomain = "https://" + cookieDomain;
        chrome.cookies.remove({"url" : qualifiedDomain, "name" : cookieName}, function(result){
        });
    }



    /*
     * Required Super Controller Method implementation 
     */

    hideSection(){
        this.view.hideSection();
    }

    displaySection(){
        this.view.showSection();
    }

    resetSection(){

    }

    initSection(){
        this.model.setupData();
    }
}
