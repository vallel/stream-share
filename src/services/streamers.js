const dotenv = require('dotenv').load();
const fs = require('fs');

var streamers = {
    getAll: function(callback) {
        var filePath = getFilePath();
        fs.readFile(filePath, 'utf8',(error, data) => {
            if (error && error.code && error.code == 'ENOENT') {
                error = null;
                data = null;
            }

            var streamersList = data ? JSON.parse(data) : [];
            callback(error, streamersList);
        });
    },

    add: function(twitterId, twitterUsername, twitchUsername, callback) {
        streamers.getAll(function(error, data) {
            if (error) {
                callback(error);
            } else {
                var streamer = {
                    twitterId: twitterId,
                    twitter: twitterUsername,
                    twitch: twitchUsername
                };

                if (!dataContains(data, streamer)) {
                    data.push(streamer);
                    streamers.save(data, callback);
                } else {
                    callback('El usuario de twitch ya existe en la lista.', data);
                }
            }
        });
    },

    save: function(data, callback) {
        var filePath = getFilePath();
        fs.writeFile(filePath, JSON.stringify(data), function(error) {
            callback(error, data);
        });
    },

    delete: function(twitch, callback) {
        streamers.getAll(function(error, data) {
            if (!error) {
                var toDelete = find(data, twitch);
                data.splice(toDelete, 1);
                streamers.save(data, callback);
            } else {
                callback(error, data);
            }
        });
    },

    getAllAsObject: function(callback) {
        streamers.getAll(function(error, list) {
            var obj = {};

            if (!error) {
                for (var i = 0; i < list.length; i++) {
                    var twitchUrl = 'twitch.tv/' + list[i].twitch;
                    var data = {
                        twitter: list[i].twitter,
                        twitch: twitchUrl
                    };
                    obj[list[i].twitterId] = data;
                }
            }
            
            callback(error, obj);
        });
    }
};

function getFilePath() {
    var path = process.env.ENV == 'dev' ? '' : process.resourcesPath;
    return path + process.env.DATA_FILE;
}

function find(list, twitch) {
    var index = -1;
    
    for (var i = 0; i < list.length; i++) {
        if (list[i].twitch === twitch) { 
            index = i;
            break;
        }
    }

    return index;
}

function dataContains(list, streamer) {
    var index = find(list, streamer.twitch);

    return index >= 0;
}

module.exports = streamers;