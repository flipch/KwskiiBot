const request = require("request");
const getYoutubeID = require("get-youtube-id");
const fs = require("fs");

var Config = JSON.parse(fs.readFileSync(`./settings.json`, `utf-8`));

module.exports = {
    isYoutube: function (str) {
        return str.includes("youtube.com");
    },
    search_video: function (query, callback) {
        request(`https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${encodeURIComponent(query)}&key=${Config.youtube_api}`,
            function (error, response, body) {
                var json = JSON.parse(body);
                callback(json.items[0].id.videoId);
            });
    },
    getID: function (str, callback) {
        if (module.exports.isYoutube(str)) {
            callback(getYoutubeID(str));
        } else {
            module.exports.search_video(str, function (id) {
                callback(id);
            });
        }
    },
};