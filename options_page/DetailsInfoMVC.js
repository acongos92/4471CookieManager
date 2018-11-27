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
        let cookie = this.cookies[rowIndex];
        this.cookies.splice(rowIndex, 1);
        return cookie;
    }
    
    getCookieFromModel(rowIndex){
       return this.cookies[rowIndex];
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
        
        btn = controllerRef.createEditButton();
        cell.appendChild(btn);
        btn.addEventListener("click", function(event){
            controllerRef.editCookieClicked(event.target, row.rowIndex)
        }, false);
        
        cell = row.insertCell(4);
        cell.innerHTML = cookie.httpOnly ? "Yes" : "No";
        cell.className = "text-truncate";
        
        cell = row.insertCell(5);
        cell.innerHTML = cookie.secure ? "Yes" : "No";
        cell.className = "text-truncate";
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
    }
    
    editCookieClicked(clickedBtn, rowIndex){
        let valueNode = clickedBtn.parentElement.parentElement.childNodes[2];
        let cookieValue = valueNode.innerHTML;
        
        let input = document.createElement("INPUT");
        input.className = "form-control";
        input.type = "text";
        input.value = cookieValue;
        
        if(valueNode.childNodes.length > 0){
            valueNode.replaceChild(input, valueNode.childNodes[0]);
        }
        else{
            valueNode.appendChild(input);
        }
        
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "save";
        btn.className = "btn btn-success";
        
        let controllerRef = this;
        btn.addEventListener("click", function(event){
            controllerRef.updateCookieClicked(event.target, rowIndex)
        }, false);
        clickedBtn.parentElement.replaceChild(btn, clickedBtn);
    }
    
    updateCookieClicked(clickedBtn, rowIndex){
        let domainNode = clickedBtn.parentElement.parentElement.childNodes[0];
        let nameNode = clickedBtn.parentElement.parentElement.childNodes[1];
        let valueNode = clickedBtn.parentElement.parentElement.childNodes[2];
        let cookieValue = valueNode.childNodes[0].value;
        
        var cookieToUpdate = this.model.getCookieFromModel(rowIndex);
        cookieToUpdate.value = cookieValue;
        cookieToUpdate.httpOnly = !cookieToUpdate.hostOnly;
        delete(cookieToUpdate.hostOnly);
        delete(cookieToUpdate.session);
        
        let controllerRef = this;
        let chromeRef = chrome;
        let callback = function(result){
            if(!result){
                alert(chromeRef.runtime.lastError);
                return;
            }
            let text = document.createTextNode(cookieValue);
            valueNode.replaceChild(text, valueNode.childNodes[0]);

            let btn = controllerRef.createEditButton();

            btn.addEventListener("click", function(event){
                controllerRef.editCookieClicked(event.target)
            }, false);
            clickedBtn.parentElement.replaceChild(btn, clickedBtn);
        };
        this.setCookie(cookieToUpdate, callback);
    }
    
    createEditButton(){
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "edit";
        btn.className = "btn btn-info";
        return btn;
    }

    /*
     * model storage retrieval callbacks
     */
    onDataReadyCallback(){
        let cookies = this.model.getCookiesArray();
        let thisRef = this;
        cookies.forEach(function(cookie){
            thisRef.view.appendTableRow(cookie);
        });
    }

    setCookie(cookie, callback){
        let qualifiedDomain = "https://" + cookie.domain;
        cookie.url = qualifiedDomain;
        chrome.cookies.set(cookie, callback);
    }
//     setCookie(cookieName, cookieValue, cookieDomain, callback){
//         let qualifiedDomain = "https://" + cookieDomain;
//         chrome.cookies.set({"url" : qualifiedDomain, "name" : cookieName, "value" : cookieValue}, callback);
//     }

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
