class DetailsInfoModel{
    constructor(detailsInfoController){
        this.controller = detailsInfoController;   
    }

    /*
     * public methods
     */ 

    setupData(){
        this.setupCookieManager();
    }

    getCookiesArray(){
        return this.cookies;
    }

    removeCookieFromModel(rowIndex){
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
//         this.cookieManager = new CookieDataManager(cookies);
        this.cookies = cookies;
        this.controller.onDataReadyCallback();
    }

}

class DetailsInfoView{
    constructor(detailsInfoController){
        this.controller = detailsInfoController;
        this.parentSection = document.getElementById("detailsInfoSection");
        this.table = document.getElementById("detailsInfoTable").getElementsByTagName("tbody")[0];
    }

    appendTableRow(cookie){
        let row = this.table.insertRow(this.table.rows.length);
        let cell = row.insertCell(0);
        cell.innerHTML = cookie.domain;
        
        cell = row.insertCell(1);
        cell.innerHTML = cookie.name;
        
        cell = row.insertCell(2);
        cell.innerHTML = cookie.value;
        
        cell = row.insertCell(3);
        
        let controllerRef = this.controller;
        
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "delete";
        btn.className = "btn btn-danger";
        cell.appendChild(btn);
        btn.addEventListener("click", function(){controllerRef.deleteCookieClicked(row.rowIndex)}, false);
        
        btn = document.createElement("BUTTON");
        btn.innerHTML = "edit";
        btn.className = "btn btn-info";
        cell.appendChild(btn);
        btn.addEventListener("click", function(){controllerRef.editCookieClicked(row.rowIndex)}, false);
  
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

class DetailsInfoController{
    constructor(){
        this.view = new DetailsInfoView(this);
        this.model = new DetailsInfoModel(this);
        this.initSection();
    }

    /*
     * public methods 
     */ 
    deleteCookieClicked(rowIndex){
        this.view.removeTableRow(rowIndex - 1);
        let domainName = this.model.removeDomainFromModel(rowIndex - 1);
        this.addDomainToBlockedAndPurge(domainName);
    }
    editCookieClicked(rowIndex){
        this.view.removeTableRow(rowIndex - 1);
        let domainName = this.model.removeDomainFromModel(rowIndex - 1);
        this.addDomainToBlockedAndPurge(domainName);
    }
    
//     detailsDomainClicked(rowIndex){
//         this.view.removeTableRow(rowIndex - 1);
//         let domainName = this.model.removeDomainFromModel(rowIndex - 1);
//         this.addDomainToBlockedAndPurge(domainName);
//     }

    /*
     * model storage retrieval callbacks
     */
    onDataReadyCallback(){
//         let domainsWithCounts = this.model.getDomainsWithCounts();
//         let domainsArray = this.model.getDomainsArray();
        let cookies = this.model.getCookiesArray();
        alert("yeehah");
        cookies.forEach(function(cookie){
            this.view.appendTableRow(cookie);
        });
//         for(let i = 0; i < cookies.length; i++){
//             this.view.appendTableRow(domainsArray[i], domainsWithCounts[domainsArray[i]]);
//         }
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