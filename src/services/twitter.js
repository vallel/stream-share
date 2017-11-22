let dotenv = require('dotenv').load(),
Twitter = require('twitter'),
streamersService = require('./streamers')

let twitterClient = new Twitter({
consumer_key: process.env.TWITTER_CONSUMER_KEY,
consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

// keywords to search
// '<streamer url>': '<twitter username>'
let keywords = {}

let streamUrls = []

let io = null,
twitterStream = null

/** 
* @param {object} ipc 
*/
let twitterService = function(ipc) {
return {
    tweet: function(message) {
        twitterClient.post('statuses/update', {status: message}, (error, tweet, response) => {
            if (error) {
                console.log(response);
                throw error
            } else {
                console.log(tweet)
            }
        })
    },
    
    // get stream of tweets including the given keywords
    tweetsStreaming: function() {
        streamersService.getAllAsObject(function(error, data) {
            if (!error && Object.keys(data).length > 0) {
                keywords = data
                streamUrls = Object.keys(keywords)

                twitterClient.stream('statuses/filter', {track: streamUrls.join(',')}, (stream) => {
                    twitterStream = stream

                    stream.on('data', (tweet) => {
                        if (isUserSharingStream(tweet)) {
                            this.retweet(tweet.id_str)
                        }
                    })
                    
                    stream.on('error', (error) => {
                        console.log(error)
                        //throw error
                    })
                })
            }
        })
    },
    
    /**
     * @param {int} tweetId 
     */
    retweet: function(tweetId) {
        twitterClient.post('statuses/retweet/' + tweetId, (error, tweet, response) => {
            if (error) {
                console.log(error)
                throw error
            } else {
                ipc.send('tweet', tweet);
            }
        })
    },

    restartStream: function() {
        if (twitterStream) {
            twitterStream.destroy()
        }
        this.tweetsStreaming()
    }
}

/**
 * Checks if the given tweet contains a url from the list and if it was tweeted by the related twitter user
 * @param {Object} tweet 
 */
function isUserSharingStream(tweet) {
    for (let i = 0; i < streamUrls.length; i++) {
        let url = streamUrls[i],
            username = keywords[url]
        
        if (tweet.text.includes(url) && tweet.user.name.toLowerCase() == username) {
            return true
        }
    }

    return false
}
}

module.exports = twitterService