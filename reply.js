import { TwitterClient } from "twitter-api-client";
import fs from "fs/promises";
import config from "./config.js";
import { takeScreenshot } from "./utils.js";
const t = new TwitterClient(config);

/**
 * Replay to a particular tweet.
 *
 * @param {string} rollno
 * @param {string} tweetid
 * @param {string} username
 */
const replyToTweet = async (text, tweetid, username) => {
  console.log("id", username, "text", text);
  try {
    //const screenshot_path = await takeScreenshot(rollno);
    //const media_id = await uploadMedia(screenshot_path);
    const res = await t.tweets.statusesUpdate({
      status: `Here is your result @${username}`,
      in_reply_to_status_id: tweetid,
      //media_ids: media_id, // for pictures
      auto_populate_reply_metadata: true,
    });
    return res;
  } catch (err) {
    console.error(err);
  }
};

export default replyToTweet;
