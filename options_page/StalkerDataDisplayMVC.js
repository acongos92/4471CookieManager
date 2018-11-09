/**
 * displays the collected data associated with the stalker rank of a given domain 
 */

 class StalkerDataDisplayModel{
    constructor(stalkerDataDisplayController){
        this.controller = stalkerDataDisplayController;
    }

    setupData(){

    }
 }
 

 class StalkerDataDisplayView{
    constructor(stalkerDataDisplayController){
        this.controller = stalkerDataDisplayController;
        this.parentSection = document.getElementById("stalkerInfoSection");
    }

    hideStalkerView(){
        this.parentSection.style.display = "none";
    }

    showStalkerView(){
        this.parentSection.style.display = "block";
    }

    resetStalkerView(){

    }

 }

 class StalkerDataDisplayController { 
    constructor(){
        this.view = new StalkerDataDisplayView(this);
        this.model = new StalkerDataDisplayModel(this);
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