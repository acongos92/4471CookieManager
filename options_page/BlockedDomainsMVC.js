/**
 * MVC for Blocked domains portion of the options page
 */
class BlockedDomainsView {
    constructor(controller){
        this.controller = controller;
        this.table = document.createElement("table");
        this.parentSection = document.getElementById("blockedDomainSection");
    }
    
    /*
     * public methods 
     */

    drawInitialViewElements(){
        let heading = document.createElement("h1");
        heading.innerHTML = "Blocked Domains";
        heading.id = "blockedDomainHeading";
        let subheading = document.createElement("h2");
        subheading.innerHTML = "Here you can view domains you've blocked through the extension and remove them from the blocked list";
        subheading.id ="blockedDomainSubheading"
        this.parentSection.appendChild(heading);
        this.parentSection.appendChild(subheading);
        this.drawInitialTableElement();
    }
    /**
     * sets view to "blank slate" removing everything in the blockedDomainSection div
     */
    resetView(){
        this.parentSection.innerHTML = "";
    }

    /**
     * removes all blocked cookie table elements
     */
    resetTable(){
        this.table.innerHTML = "";
        this.drawInitialTableElement();
    }

    drawBlockedDomain(domainName){
        let row = this.table.insertRow(this.table.rows.length);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = domainName;
        let cell2 = row.insertCell(1);
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "unblock";
        cell2.appendChild(btn);
        
    }

    /*
     * "private" methods
     */

     drawInitialTableElement(){

        this.table.className = "blockedCookieSectionTable"
        let tableHead = this.table.createTHead(2);
        let row = tableHead.insertRow(0);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = "Domain Name";
        let cell2 = row.insertCell(1);
        cell2.innerHTML = "Unblock";
        this.parentSection.appendChild(this.table);
        this.table.createTBody(2);
        
     }

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

    /*
     *"private" methods (not really private, just dont use them externally or bad stuff will happen") 
     */
    onSetupDataComplete(blockedDomainsArray){
        this.blockedDomainsArray = blockedDomainsArray;
        this.controller.onDataSetCompleteCallback();
    }

}

class BlockedDomainsController {
    constructor(){
        this.view = new BlockedDomainsView(this);
        this.view.drawInitialViewElements();
        this.model = new BlockedDomainsModel(this);
        this.model.setupData();
    }

    onDataSetCompleteCallback(){
        let domains = this.model.getBlockedDomainsArray();
        console.log(domains);
        for (let i = 0; i < domains.length; i++){
            this.view.drawBlockedDomain(domains[i]);
        }
    }
}

let controller = new BlockedDomainsController();