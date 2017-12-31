let dotenv = require('dotenv').load(),
Twitter = require('twitter'),
streamersService = require('./streamers')

let twitterClient = new Twitter({
consumer_key: process.env.TWITTER_CONSUMER_KEY,
consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

let streamersData = {}

let io = null,
twitterStream = null

let twitterService = function() {
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
        
            getUserByScreenName: function(screenname, callback) {
                twitterClient.get('users/show', {screen_name: screenname}, (error, data, response) => {
                    if (error) {
                        console.log(error);
                    } else {
                        callback(data);
                    }
                });
            },
            
        // get stream of tweets including the given keywords
        tweetsStreaming: function(onRetweet) {
                streamersService.getAllAsObject((error, data) => {
                if (!error && Object.keys(data).length > 0) {
                        streamersData = data
                        usersIds = Object.keys(streamersData)

                        if (!error) {
                            twitterClient.stream('statuses/filter', {follow: usersIds.join(',')}, (stream) => {
                        twitterStream = stream

                        stream.on('data', (tweet) => {
                            if (isUserSharingStream(tweet)) {
                                this.retweet(tweet.id_str, onRetweet)
                            } else {

                            }
                        })
                        
                        stream.on('error', (error) => {
                            console.log(error)
                            //throw error
                        })
                    })
                }
                    }
            })
        },
        
        /**
         * @param {int} tweetId 
         * @param {function} callback
         */
        retweet: function(tweetId, callback) {
            twitterClient.post('statuses/retweet/' + tweetId, (error, tweet, response) => {
                if (error) {
                    console.log(error)
                    throw error
                } else {
                    callback(tweet)
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
            let tweetUserId = tweet.user.id,
                streamer = streamersData[tweetUserId]

            if (streamer && tweet.entities && tweet.entities.urls) {
                let urls = tweet.entities.urls
                for (let i = 0; i < urls.length; i++) {
                    if (urls[i].expanded_url.includes(streamer.twitch)) {
                        return true
                    }
                }
            }

        return false
    }
}

module.exports = twitterService