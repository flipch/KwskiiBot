var Discord = require("discord.js");

// Welcome 

console.log("Starting bot");

// Modules
const client = new Discord.Client();
const ytdl = require("ytdl-core");
const fs = require("fs");
const util = require("./utils.js");
const fetchVideoInfo = require("youtube-info");

console.log("Modules loaded");

// Config
var Config = JSON.parse(fs.readFileSync(`./settings.json`, `utf-8`));

const youtube_api = Config.youtube_api;
const discord_token = Config.discord_token;
const bot_controller = Config.bot_controller;
const prefix = Config.prefix;

// RunTime Database
const DataClass = require("./data.js");
const Data = new DataClass();

console.log(`-------------------------------
Youtube API : ${youtube_api}
Discord Token : ${discord_token}
Bot Controller : ${bot_controller}
Bot Prefix : ${prefix}
-------------------------------`);

console.log("Connecting to discord")
client.login(discord_token);

client.on('ready', e => {
    console.log(`Connected as : ${client.user.username}`);
});


client.on('message', async message => {
    var prefix = message.content[0];

    // Is the message supposed to be read?
    if (prefix == Config.prefix) {
        console.log(`-------------------------------`);

        // Refactoring for utility purpose
        const author = message.author;
        const content = message.content.substring(1);
        const channel = message.channel;

        // Get the command requested
        var spaceIndex = content.indexOf(" ");
        var command = "";

        if (spaceIndex < 0)
            command = content;
        else
            command = content.substring(0, spaceIndex);

        console.log(`Command requested [${command}]`);

        // Get the arguments of command requested
        const args = content.substring(command.length + 1);

        console.log(`Argument requested [${args}]`);

        switch (command) {
            case 'ping':
                // SUPER FAST HYPER PING
                const m = await message.channel.send("Ping?");
                m.edit(`:ping_pong: Pong!\nLatency to Server is ${m.createdTimestamp - message.createdTimestamp}ms.\nAPI Latency is ${Math.round(client.ping)}ms`);
                break;
            case 'play':
                // Plays or Adds if already playing a song to queue
                if (Data.queue.length > 0 || Data.isPlaying) {
                    util.getID(args, function (id) {
                        fetchVideoInfo(id, function (err, videoInfo) {
                            if (err) throw new Error(err);
                            else {
                                Data.queue.push([id, videoInfo]);
                                message.reply(`Added to queue: **${videoInfo.title}**`);
                                console.log(`Added to queue: [${videoInfo.title}]`);
                            }
                        });
                    });
                } else {
                    Data.isPlaying = true;
                    util.getID(args, function (id) {
                        fetchVideoInfo(id, function (err, videoInfo) {
                            if (err) throw new Error(err);
                            else {
                                Data.queue.push([id, videoInfo]);
                                playMusic(id, message);
                                console.log(`Now Playing: [${videoInfo.title}]`);
                            }
                        });
                    });
                }
                break;
            case 'stop':
                // Stops/Clear the queue
                break;
            case 'next':
                if(Data.isPlaying)
                    Data.dispatcher.end();
                break;
            case 'restart':
                // Exits app, which has been started hopefully with forever npm package
                // By exiting, the app will restart itself
                process.exit(0);
                break;
        }
    } else {
        return;
    }
});

function playMusic(id, message) {
    const voiceChannel = message.member.voiceChannel;
    const videoInfo = Data.queue[0][1];
    voiceChannel.join().then(function (connection) {
        const stream = ytdl("https://www.youtube.com/watch?v=" + id, {
            filter: 'audioonly'
        });
        message.reply(`Now Playing: **${videoInfo.title}**`);
        Data.dispatcher = connection.playStream(stream);
        Data.dispatcher.on('end', function () {
            Data.queue.shift();
            if (Data.queue.length === 0) {
                Data.isPlaying = false;
            } else {
                playMusic(Data.queue[0][0], message);
            }
        });
    });
}