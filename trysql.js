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
var tweetWithoutOurHandle = ' b @gth @nft @klkl';
const splitTweet = tweetWithoutOurHandle.split(" ");
for (let i = 0; i < splitTweet.length; i++) {
    if (splitTweet[i].startsWith("@")){
        console.log(splitTweet[i]);
        return;
    }    
}