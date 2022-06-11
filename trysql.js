const sql = require("./sql");
const value = '@greatgoatsnf'

let promise = sql.getData(value) // => Promise { <pending> }
.then(results=>{
    if (results === undefined){
        console.log(value, " is not in our database!")
        return "undefined"
    }
    console.log(results) // => { slug: 'adding-matomo-website', read_times: 1, shares: 0, likes: 0 }
    return results
})
var tweetWithoutOurHandle = '@nft @klkl';
const reg = /[^@.*]+/gm;
const value2 = tweetWithoutOurHandle.match(reg);
console.log(value2);