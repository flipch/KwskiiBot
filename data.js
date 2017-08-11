const request = require("request");
const getYoutubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const fs = require("fs");

class Data {
    constructor() {
        // Runtime Config
        this.queue = [];
        this.nowPlaying = [];
        this.isPlaying = false;
        this.dispatcher = null;
        this.voiceChannel = null;
        this.skipReq = 0; // TO-DO
        this.skippers = []; //TO-DO
    }

    addToQueue(strID) {
        if (isYoutube(strID)) {
            this.queue.push(getYoutubeID(strID));
        } else{
            this.queue.push(strID);
        }
    }
}

module.exports = Data;