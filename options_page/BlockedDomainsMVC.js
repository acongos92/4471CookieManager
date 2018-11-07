/**
 * MVC for Blocked domains portion of the options page
 */
class BlockedDomainsView {
    constructor(controller){
        this.controller = controller;
        this.table = document.getElementById("blockedDomainsTable")
        this.parentSection = document.getElementById("blockedDomainSection");
        this.blockedDomainsTableBody = document.getElementById("blockedDomainTableBody");
    }
    
    /*
     * public methods 
     */

     /**
      * clears all data except the table headers 
      */
    resetSection(){
        while (this.table.rows.length > 1){
            this.table.deleteRow(1);
        }
    }
    


    removeElementFromBlockedDomainsTable(index){
        this.table.deleteRow(index);
    }
    /**
     * sets view to "blank slate" removing everything in the blockedDomainSection div
     */
    hideBlockedDomainsView(){
        this.parentSection.style.display = "none";
    }

    showBlockedDomainsView(){
        this.parentSection.style.display = "block";
    }


    drawBlockedDomain(domainName){
        let row = this.table.insertRow(this.table.rows.length);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = domainName;
        let cell2 = row.insertCell(1);
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "unblock";
        btn.className = "btn btn-danger";
        cell2.appendChild(btn);
        let controllerRef = this.controller;
        btn.addEventListener("click", function() {controllerRef.unblockDomainButtonClicked(row.rowIndex)}, false);
    }

    /*
     * "private" methods
     */


}

class BlockedDomainsModel {
    constructor(controller){
        this.controller = controller;
    }

    /**
     * loads currently blocked domains, calls back to controller when done
     */
    setupData(){
        let modelRef = this;
        chrome.storage.local.get("BlockedDomains", function(result){
            if(result.BlockedDomains && result.BlockedDomains.domains){
                modelRef.onSetupDataComplete(result.BlockedDomains.domains);
            }else{
                modelRef.onSetupDataComplete([]);
            }
        });
    }

    getBlockedDomainsArray(){
        return this.blockedDomainsArray;
    }

    
    removeElementFromModel(elementIndex){
        let element = this.blockedDomainsArray[elementIndex];
        this.blockedDomainsArray.splice(elementIndex, 1);
        this.removeElementFromStorage([element]);
    }

    /*
     *"private" methods (not really private, just dont use them externally or bad stuff will happen") 
     */
    onSetupDataComplete(blockedDomainsArray){
        this.blockedDomainsArray = blockedDomainsArray;
        this.controller.onDataSetCompleteCallback();
    }
    
    /**
     * updates the chrome storage BlockedDomains object to match the model of this
     */
    removeElementFromStorage(){
        let modelRef = this;
        chrome.storage.local.get("BlockedDomains", function(result){
            if(result.BlockedDomains){
                result.BlockedDomains.domains = modelRef.blockedDomainsArray;
                chrome.storage.local.set({"BlockedDomains": result.BlockedDomains}, function(){
                    
                });
            }
        });
    }

}

class BlockedDomainsController {
    constructor(){
        this.view = new BlockedDomainsView(this);
        this.model = new BlockedDomainsModel(this);
        this.model.setupData();
    }

    onDataSetCompleteCallback(){
        let domains = this.model.getBlockedDomainsArray();
        for (let i = 0; i < domains.length; i++){
            this.view.drawBlockedDomain(domains[i]);
        }
    }

    
    unblockDomainButtonClicked(rowIndex){
        this.model.removeElementFromModel(rowIndex -1);
        this.view.removeElementFromBlockedDomainsTable(rowIndex);
    }

    /*
     * super controller methods. I.E page has a single object 
     * responsible for toggling sub page elements
     */ 
    hideSection(){
        this.view.hideBlockedDomainsView();
    }

    displaySection(){
        this.view.showBlockedDomainsView();
    }

    resetSection(){
        this.view.resetSection();
        this.model.setupData();
    }
}
