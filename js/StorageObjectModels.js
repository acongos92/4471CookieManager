/**
 * some object definitions 
 * RecentCookieData{
 *                  name: "string cookie name"
 *                  domain: "string cookie domain"
 *                  storeTime: "datetime this object was added to storage"
 *                  }
 * RecentCookies {
 *                  data: [] //an array of RecentCookieData
 *               }
 * 
 * BlockedDomainData{
 *                  domain: "string blocked domain"
 *
 *                  }
 * 
 * BlockedDomains {
 *                  domains[] //an array of BlockedDomainData
 *                }
 * 
 * StalkerRank {
 *                  pageData[] //an array of PageData
 * }
 * 
 * PageData {
 *                  pageName           : string //the string representing a particular web page 
 *                                              //this string by convention is stored without a "www." prefix
 *                                              //for exampel if a cookie is stored by domain ".redit.com"
 *                                              //the page data entry name will be "reddit.com"
 *                                              //this is for the purpose of more conistent matching
 *                  foreignCookieCount : int //an integer representing the number of non 
 *                  foreignCookies[]   : RecentCookieData //an array of RecentCookieData representing the foreign cookies
 * 
 * }
 */

function buildCookieStorageEntry(cookie){
    let RecentCookieData = {
        name : cookie.name,
        domain : cookie.domain,
        date : "2018"
    }

    return RecentCookieData;
 }

 function buildRecentCookies(){
     let RecentCookies = {
         data : []
     }

     return RecentCookies;
 }

 function buildBlockedDomains(){
     let BlockedDomains = {
         domains: []
     }
     return BlockedDomains;
 }
 function buildStalkerRank(){
    let StalkerRank = {
        PageData: []
    }
    return StalkerRank;
 }
