/**
 * Super Controller class controlls highest level function of options page 
 * (essentilly just controlling the display and hiding of tabs)
 * assumes any sub controller class implements displaySection, hideSection, and resetSection methods
 * side note, this would be way easier in any language but javascript
 */

class SuperController {
    constructor(){
        this.blockedDomainsController = new BlockedDomainsController();
        this.domainInfoController = new DomainInfoController();
        this.setupOptionsTabs()
    }



    /*
     * "private" methods  
     */
    
     /**
      * sets up tabs and their corresponding controllers
      */
     setupOptionsTabs(){
         //reference to controller object for action listener anon funcs 
         let thisRef = this;
         //register blocked domains section, set to active by default
         this.blockedDomainsNavOption = document.getElementById("navbarBlockedDomains");
         this.currentActiveTab = this.blockedDomainsNavOption;
         this.currentActiveController = this.blockedDomainsController;
         let activeControllerRef = this.currentActiveController;
         this.blockedDomainsNavOption.addEventListener("click", function(){thisRef.tabToggleListener(this, activeControllerRef);}, false);
         
         //register domain info section
         this.domainInfoNavOption = document.getElementById("navbarDomainInfo");
         let domainControllerRef = this.domainInfoController;
         this.domainInfoNavOption.addEventListener("click", function(){thisRef.tabToggleListener(this, domainControllerRef)}, false);
     }

     /**
      * toggles active tabs 
      * @param {*} newActiveTab the new tab to set as active in the navbar
      * @param {*} newController the new controller to call its startup/unhide method on
      */
     togleActiveTab(newActiveTab, newController){
         //tab management 
         this.currentActiveTab.className = "btn btn-dark";
         newActiveTab.className = "btn btn-dark active";
         this.currentActiveTab = newActiveTab;
         //controller management
         this.currentActiveController.hideSection();
         newController.displaySection();
         newController.resetSection();
         this.currentActiveController = newController;
     }

     /*
      * click listeners
      */ 
     tabToggleListener(newActiveTab, newController){
         this.togleActiveTab(newActiveTab, newController);
     }

}

let superController = new SuperController();