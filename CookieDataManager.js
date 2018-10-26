/**
 * Class designed to abstract away elements of cookie managemen/loading/organization 
 * expects a Cookie object in its constructor (typically collected by using chrome.cookies.getall)
 * and uses this to generate cookie analytics/other functionality around cookie data 
 */

 class CookieDataManager {
    /**
     * takes a cookie object and sets up other common member variables 
     * @param {*} cookies a chrome Cookie object
     */
    constructor(cookies){
        this.cookies = cookies; 
        this.uniqueDomains = [];
        this.countUniqueDomains();
    }
    /**
     * publicy accesible methods 
     */

    /**
     * returns total number of cookie objects 
     */
     getTotalCookieCount() {
         return this.cookies.length;
     }

     /**
      * returns the number of unique domains within this.cookies 
      */
    getUniqueDomainCounts(){
        return this.uniqueDomains.length;
    }

    /**
     * returns the array of unique domain names 
     */

    getUniqueDomainNameArray(){
        return this.uniqueDomains;
    }



    /**
     * helper functions 
     */

    countUniqueDomains(){
        console.log(this.cookies);
        for (let i = 0; i < this.cookies.length; i++){
            if(!this.uniqueDomains.includes(this.cookies[i].domain)){
                this.uniqueDomains.push(this.cookies[i].domain)
            }
        }
    }


 }