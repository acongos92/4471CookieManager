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
//         let name = this.cookies[rowIndex].name;
//         let domain = this.cookies[rowIndex].domain;
        let cookie = this.cookies[rowIndex];
        this.cookies.splice(rowIndex, 1);
//         delete this.domainsWithCounts[name];
        return cookie;
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
        cell.className = "text-truncate";
        
        cell = row.insertCell(2);
        cell.innerHTML = cookie.value;
        cell.className = "text-truncate";
        
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
        btn.addEventListener("click", function(event){
            controllerRef.editCookieClicked(event.target)
        }, false);
  
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
        let cookie = this.model.removeCookieFromModel(rowIndex - 1);
        this.deleteCookieFromStorage(cookie.name, cookie.domain);
//         this.addDomainToBlockedAndPurge(cookie);
    }
    
    editCookieClicked(clickedBtn){
//         this.view.removeTableRow(rowIndex - 1);
//         let domainName = this.model.removeDomainFromModel(rowIndex - 1);
//         this.addDomainToBlockedAndPurge(domainName);
        let domainNode = clickedBtn.parentElement.parentElement.childNodes[0];
        let nameNode = clickedBtn.parentElement.parentElement.childNodes[1];
        let valueNode = clickedBtn.parentElement.parentElement.childNodes[2];
        let cookieValue = valueNode.innerHTML;
        
        
        let input = document.createElement("INPUT");
        input.className = "from-control";
        input.type = "text";
        input.value = cookieValue;
        input.name = domainNode.innerHTML + ";" + nameNode.innerHTML;
        
        valueNode.replaceChild(input, valueNode.childNodes[0]);
//         valueNode.innerHTML = `
//             <input type="text" name="${domainNode.innerHTML};${nameNode.innerHTML}" value="${cookieValue}" class="form-control" />
// `;
        
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "save";
        btn.className = "btn btn-success";
        
        let controllerRef = this;
        btn.addEventListener("click", function(event){
            controllerRef.updateCookieClicked(event.target)
        }, false);
        clickedBtn.parentElement.replaceChild(btn, clickedBtn);
    }
    
    updateCookieClicked(clickedBtn){
//         this.view.removeTableRow(rowIndex - 1);
//         let domainName = this.model.removeDomainFromModel(rowIndex - 1);
//         this.addDomainToBlockedAndPurge(domainName);
        let domainNode = clickedBtn.parentElement.parentElement.childNodes[0];
        let nameNode = clickedBtn.parentElement.parentElement.childNodes[1];
        let valueNode = clickedBtn.parentElement.parentElement.childNodes[2];
        let cookieValue = valueNode.innerHTML;
        valueNode.innerHTML = `
            <input type="text" name="${domainNode.innerHTML};${nameNode.innerHTML}" value="${cookieValue}" class="form-control" />
`;
        clickedBtn.innerHTML = "save";
        clickedBtn.className = "btn btn-success";
        
        let controllerRef = this;
        btn.addEventListener("click", function(event){
            controllerRef.editCookieClicked(event.target)
        }, false);
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
        let thisRef = this;
        cookies.forEach(function(cookie){
            thisRef.view.appendTableRow(cookie);
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
