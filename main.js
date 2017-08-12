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

        // Logging for perfomance factor
        const current = new Date();

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
                    playMusic(args, function (id) {
                        Data.addToQueue(id);
                        fetchVideoInfo(id, function (err, videoInfo) {
                            if (err) throw new Error(err);
                            else {
                                message.reply("Added to queue: **" + videoInfo.title + "**");
                            }
                        });
                    });
                } else {
                    Data.isPlaying = true;
                    util.getID(args, function (id) {
                        Data.queue.push("placeholder");
                        playMusic(id, message);
                        fetchVideoInfo(id, function (err, videoInfo) {
                            if (err) throw new Error(err);
                            else {
                                message.reply(`Now Playing: **${videoInfo.title}**`);
                            }
                        });
                    });
                }
                break;
            case 'stop' || 'clear':
                // Stops/Clear the queue
                break;
            case 'next' || 'skip':
                // Skips the current song
                break;
            case 'summon':
                // Tells the bot to join the channel where you are
                break;
        }
    } else {
        return;
    }
});

function playMusic(id, message) {
    voiceChannel = message.member.voiceChannel;
    voiceChannel.join().then(function (connection) {
        stream = fs.createReadStream('./music/current.mp3');
        ytdl("https://www.youtube.com/watch?v=" + id, {
            filter: 'audioonly'
        }).pipe(stream);
        Data.dispatcher = connection.playStream(stream);
    });
}