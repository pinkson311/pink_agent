const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');

const TIMEOUT_DURATION = 10000;
const MAX_RETRIES = 5;


async function sleep(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retweet(i, cookie, token, tweetId, username) {
  for (let retries = 0; retries < MAX_RETRIES; retries++) {
    try {
        const referer = `https://x.com/${username}/status/${tweetId}`      
        const headers = {
          'accept': '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
          'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
          'cookie':cookie,
          'priority': 'u=1, i',
          'referer': referer,
          'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
          'x-csrf-token': token,
          'x-twitter-active-user': 'yes',
          'x-twitter-auth-type': 'OAuth2Session',
          'x-twitter-client-language': 'en'
        };
        const data = {"variables":{"tweet_id":tweetId,"dark_request":false},"queryId":"ojPdsZsimiJrUGLR1sjUtA"};

        const proxyUrl = `http://pinkson311:NQxJQosZI3ITTSAa@proxy.packetstream.io:31112`;
        const agent = new HttpsProxyAgent(proxyUrl);
    
        const cancelTokenSource = axios.CancelToken.source();
    
        const requestPromise = axios.post('https://x.com/i/api/graphql/ojPdsZsimiJrUGLR1sjUtA/CreateRetweet', data, {
          headers,
          httpsAgent: agent,
          timeout: TIMEOUT_DURATION,
          cancelToken: cancelTokenSource.token,
        });
    
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => {
            cancelTokenSource.cancel(` X${i} request exceeded ${TIMEOUT_DURATION} ms`);
            reject(new Error(`X ${i} timeout`));
          }, TIMEOUT_DURATION)
        );
    
        const result = await Promise.race([requestPromise, timeoutPromise]);
    
        if (result && result.data && result.data.data) {
          const status = result.data.data.create_retweet;
          if (!status) {
            throw new Error(`notretweet X ${i}`);
          }
          console.log(`i_${i} retweeted`);
          return;
        } else {
          throw new Error(`Invalid response structure for X ${i}`);
        }
      } catch (error) {
        if (error.message.includes('timeout') || error.message.includes('notretweet')) {
          console.warn(`Error with X${i}. Retrying ${retries + 1}:`, error.message);
        } else {
          console.warn(`Error while requesting ${i}. Retrying ${retries + 1}:`, error.message);
        }
        await sleep(5000, 10000);
      }
    }
    console.error(`Retry failed after ${MAX_RETRIES} times for X${i}`);  
  }

module.exports = retweet;

