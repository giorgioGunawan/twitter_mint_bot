// Open a realtime stream of Tweets, filtered according to rules
// https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/quick-start

const needle = require('needle');
const {TwitterApi} = require('twitter-api-v2');
const schedule = require('node-schedule');
const cron = require('node-cron');
const sqlite3 = require("sqlite3").verbose();
require('dotenv').config();
const timeElapsed = Date.now();
const today = new Date(timeElapsed);
const sql3 = require("./sql");
console.log("[" + today + "]: Restarting now....")
// recurrent intervals
// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
token = process.env.BEARER_TOKEN

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';

// this sets up two rules - the value is the search terms to match on, and the tag is an identifier that
// will be applied to the Tweets return to show which rule they matched
// with a standard project with Basic Access, you can add up to 25 concurrent rules to your stream, and
// each rule can be up to 512 characters long

// Edit rules as desired below
const rules = [{
        'value': '@mintdatebot',
    },
];

async function getAllRules() {

    const response = await needle('get', rulesURL, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 200) {
        console.log("Error:", response.statusMessage, response.statusCode)
        throw new Error(response.body);
    }

    return (response.body);
}

async function deleteAllRules(rules) {

    if (!Array.isArray(rules.data)) {
        return null;
    }

    const ids = rules.data.map(rule => rule.id);

    const data = {
        "delete": {
            "ids": ids
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 200) {
        throw new Error(response.body);
    }

    return (response.body);

}

async function setRules() {

    const data = {
        "add": rules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 201) {
        throw new Error(response.body);
    }

    return (response.body);

}

function streamConnect(retryAttempt) {

    const stream = needle.get(streamURL, {
        headers: {
            "User-Agent": "v2FilterStreamJS",
            "Authorization": `Bearer ${token}`
        },
        timeout: 20000
    });

    stream.on('data', data => {
        try {
            // Data is here
            const json = JSON.parse(data);
            //console.log(json);
            var tweet = json.data.text;
            var tweetID = json.data.id;
            console.log(tweet);
            console.log(tweetID);

            valid = tweet.includes('@mintdatebot');
            console.log(valid);

            const client = new TwitterApi({
                appKey: process.env.APP_KEY,
                appSecret: process.env.APP_SECRET,
                accessToken: process.env.ACCESS_TOKEN,
                accessSecret: process.env.ACCESS_SECRET,
            });
            if(valid){
                const tweetWithoutOurHandle = tweet.replace('@mintdatebot', '');
                const splitTweet = tweetWithoutOurHandle.split(" ");
                let value;
                for (let i = 0; i < splitTweet.length; i++) {
                    if (splitTweet[i].startsWith("@")){
                        console.log(splitTweet[i]);
                        value = splitTweet[i];
                        return;
                    }    
                }
                console.log(value)
                if (value == ""){
                    client.v1.reply('No NFT project tagged!', tweetID)
                }
                console.log(tweetWithoutOurHandle);
                const reg = /[^@.*]+/gm;
                const value2 = tweetWithoutOurHandle.match(reg);
                console.log(value2, "<-- Here")
                const value3 = "@greatgoatsnft" // filler value for now
                // TODO: here we need to do regex, first remove @mintdatebot and then find the next@
                sql3.getData(value3) // => Promise { <pending> }
                .then(results=>{
                    if (results === undefined){
                        console.log(value3, " is not in our database!")
                        return "undefined"
                    }
                    console.log(results) // => { slug: 'adding-matomo-website', read_times: 1, shares: 0, likes: 0 }
                    client.v1.reply('Mint Date: 21 May 2022 2:00 AM UTC \nGoodluck!', tweetID)
                })

                /*
                if(tweet.includes('@nftprojecta')){
                    client.v1.reply('Mint Date: 21 May 2022 2:00 AM UTC \nGoodluck!', tweetID).then((val) => {
                        console.log("many success, good")
                    }).catch((err) => {
                        console.log(err)
                    })
                } else if (tweet.includes('@nftprojectb')){
                    client.v1.reply('Mint Date: 27 May 2022 4:00 PM UTC \nGoodluck!', tweetID).then((val) => {
                        console.log("many success, good")
                    }).catch((err) => {
                        console.log(err)
                    })
                } else if (tweet.includes('@greatgoatsnft')){
                    client.v1.reply('Mint Date: 5 June 2022\nMint Price: 2.75 SOL\nGoodluck!', tweetID).then((val) => {
                        console.log("many success, good")
                    }).catch((err) => {
                        console.log(err)
                    })
                } else if (tweet.includes('@GreatGoatsNFT')){
                    client.v1.reply('Mint Date: 5 June 2022 \nMint Price: 2.75 SOL\nGoodluck!', tweetID).then((val) => {
                        console.log("many success, good")
                    }).catch((err) => {
                        console.log(err)
                    })
                } else{
                    client.v1.reply('Project is not on our database', tweetID).then((val) => {
                        console.log("many success, good")
                    }).catch((err) => {
                        console.log(err)
                    })
                }*/
                
            }
            // A successful connection resets retry count.
            retryAttempt = 0;
        } catch (e) {
            if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
                console.log(data.detail)
                process.exit(1)
            } else {
                // Keep alive signal received. Do nothing.
            }
        }
    }).on('err', error => {
        if (error.code !== 'ECONNRESET') {
            console.log(error.code);
            process.exit(1);
        } else {
            // This reconnection logic will attempt to reconnect when a disconnection is detected.
            // To avoid rate limits, this logic implements exponential backoff, so the wait time
            // will increase if the client cannot reconnect to the stream. 
            setTimeout(() => {
                console.warn("A connection error occurred. Reconnecting...")
                streamConnect(++retryAttempt);
            }, 2 ** retryAttempt)
        }
    });

    return stream;

}


(async () => {
    let currentRules;

    try {
        // Gets the complete list of rules currently applied to the stream
        currentRules = await getAllRules();

        // Delete all rules. Comment the line below if you want to keep your existing rules.
        await deleteAllRules(currentRules);

        // Add rules to the stream. Comment the line below if you don't want to add new rules.
        await setRules();

    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    // Listen to the stream.
    streamConnect(0);
})();
