class DomainInfoModel{
    constructor(domainInfoController){
        this.domainInfoController = domainInfoController;
    }
}

class DomainInfoView{
    constructor(domainInfoController){
        this.domainInfoController = domainInfoController;
    }
}

class DomainInfoController{
    constructor(){
        this.view = new DomainInfoView(this);
        this.model = new DomainInfoModel(this);
    }

    

    /*
     * Required Super Controller Method implementation 
     */

    hideSection(){

    }

    displaySection(){

    }

    resetSection(){

    }
}