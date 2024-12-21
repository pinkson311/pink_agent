const like = require("./like");
const fs = require('fs');
const retweet = require("./retweet");

async function sleep(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readTweetDataFromFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(rawData);
        if (jsonData.tweet_id && jsonData.username) {
            return { tweet_id: jsonData.tweet_id, username: jsonData.username };
        }
        throw new Error('Invalid JSON format: Missing "tweet_id" or "username"');
    } catch (err) {
        console.error('Error reading or parsing JSON file:', err.message);
        return null;
    }
}

async function run(tweetId, username) {
    try {
        const jsonFilePath = './datax.json';
        const rawData = fs.readFileSync(jsonFilePath, 'utf8');
        const profiles = JSON.parse(rawData);

        for (let i = 0; i < profiles.length; i++) {
            try {
                const profile = profiles[i];
                const cookie = profile.cookie;
                const token = profile.token;

                if (cookie && token) {
                    console.log(`Running like and retweet for profile ${i + 1} with tweet_id: ${tweetId} and username: ${username}`);
                    await like(i + 1, cookie, token, tweetId, username);
                    await sleep(5000, 10000);
                    await retweet(i + 1, cookie, token, tweetId, username);
                }
            } catch (error) {
                console.error(`Error processing profile ${i + 1}:`, error.message);
            }
            await sleep(5000, 10000);
        }
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error.message);
    }
}

async function monitorTweetId(filePath) {
    let lastTweetData = readTweetDataFromFile(filePath);

    while (true) {
        const currentTweetData = readTweetDataFromFile(filePath);
        if (currentTweetData && currentTweetData.tweet_id !== lastTweetData.tweet_id) {
            console.log(`New tweet_id detected: ${currentTweetData.tweet_id} for username: ${currentTweetData.username}`);
            lastTweetData = currentTweetData;
            await run(currentTweetData.tweet_id, currentTweetData.username);
        }
        await sleep(5000, 10000);
    }
}

const jsonFilePath = './tweet.json';
monitorTweetId(jsonFilePath).catch(err => {
    console.error('Error in monitoring tweet_id:', err.message);
});
