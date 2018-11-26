class AboutModel{
    constructor(aboutController){
        this.controller = aboutController;
    }
}

class AboutView{
    constructor(detailsInfoController){
        this.controller = detailsInfoController;
        this.parentSection = document.getElementById("aboutSection");
    }

    hideSection(){
        this.parentSection.style.display = "none";
    }

    showSection(){
        this.parentSection.style.display = "block";
    }
}

class AboutController{
    constructor(){
        this.view = new AboutView(this);
        this.model = new AboutModel(this);
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

}
