/**
 * displays the collected data associated with the stalker rank of a given domain 
 */

 class StalkerDataDisplayModel{
    constructor(stalkerDataDisplayController){
        this.controller = stalkerDataDisplayController;
    }

    /*
     * public methods
     */

    /**
     * load the data from storage and callback to controller 
     */
    setupData(){
        let modelRef = this;
        chrome.storage.local.get("StalkerRank", function(result) {
            modelRef.setupModelFieldsFromStorageResult(result.StalkerRank);
        });
    }

    getStalkerData(){
        return this.stalkerData;
    }


    /*
     * "private" methods
     */ 

     setupModelFieldsFromStorageResult(stalkerRank){
        this.stalkerData = stalkerRank;
        this.controller.onDataReadyCallback();
     }
 }
 

 class StalkerDataDisplayView{
    constructor(stalkerDataDisplayController){
        this.controller = stalkerDataDisplayController;
        this.parentSection = document.getElementById("stalkerInfoSection");
        this.table = document.getElementById("stalkerTable").getElementsByTagName("tbody")[0];
    }

    writeIndividualTableRow(name, count, domains){
        //build the table row 
        let row = this.table.insertRow(this.table.rows.length);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = name;
        let cell2 = row.insertCell(1);
        cell2.innerHTML = count;
        //build the list of child domaisn 
        let div = document.createElement("DIV");
        div.className = "card";
        let heading = document.createElement("h5");
        heading.innerHTML = "Third Party Domains";
        heading.className = "card-title";
        div.appendChild(heading);
        for (let i = 0; i < domains.length; i++){
            let newElement = document.createElement("p");
            newElement.innerHTML = domains[i];
            div.appendChild(newElement);
        }
        this.table.appendChild(div);
        div.style.display = "none";
        let controllerRef = this.controller;
        row.addEventListener("click", function(){
            controllerRef.onTableRowClicked(row, div);
        }, false)
        row.style.cursor = "pointer";
    }

    hideStalkerView(){
        this.parentSection.style.display = "none";
    }

    showStalkerView(){
        this.parentSection.style.display = "block";
    }

    resetStalkerView(){
        this.table.innerHTML = "";
    }

 }

 class StalkerDataDisplayController { 
    constructor(){
        this.view = new StalkerDataDisplayView(this);
        this.model = new StalkerDataDisplayModel(this);
    }

    /* 
     * public methods 
     */

    /*
     * "private" methods
     */ 

    /*
     * event handlers
     */

     onTableRowClicked(parentRow, childElement){
         if(childElement.style.display == "block"){
             childElement.style.display = "none";
         }else{
             childElement.style.display = "block";
         }
     }
    /*
     * Model callbacks 
     */ 
    onDataReadyCallback(){
        let data = this.model.getStalkerData();
        console.log(data);
        for (let key in data.PageData){
            this.view.writeIndividualTableRow(key, data.PageData[key].foreignCookieCount, data.PageData[key].foreignDomains);
        }
    }

    /*
     * required super controller methods 
     */
    hideSection(){
        this.view.hideStalkerView();
    }

    displaySection(){
        this.view.showStalkerView();
    }

    resetSection(){
        this.view.resetStalkerView();
        this.model.setupData();
    }
 }