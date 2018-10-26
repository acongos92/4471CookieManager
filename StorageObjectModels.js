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