let client = null;
let queues = [];
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const APIManager = require('./APIManager');

module.exports.getVCForGuild = (id) => {
    return client.voiceConnections.array().find((e) => e.channel.guild.id === id);
};
module.exports.queueGuildSong = (guild, song, name, length, user) => {
    let guildq = require('./MusicManager').getQueue(guild);
    guildq.songs.push({id: song, title: name, length: length, user: user});
    const apiman = APIManager.getApiMan();
    apiman.webhookCons.filter((e) => e.guild === guild).forEach((e) => {
        e.sendUpdate("UPDATE");
    });
    require('./MusicManager').playQueue(guild);
};
module.exports.clearQueue = (guild) => {
    let qo = queues.find((e) => e.guild === guild);
    if(qo == null) return;
    queues.splice(queues.indexOf(qo), 1);
};
module.exports.getQueue = (guild) => {
    let guildq = queues.find((e) => e.guild === guild);
    if(guildq == null) {
        guildq = {guild: guild, volume: .5, playing: false, songs: []};
        queues.push(guildq);
    }
    return guildq;
};
module.exports.playQueue = (guild) => {
    let queue = require('./MusicManager').getQueue(guild);
    //console.log(JSON.stringify(queues));
    if(queue.playing) return;
    if(queue.songs.length === 0) return;
    if(require('./MusicManager').getVCForGuild(guild) == null) return;
    console.log("Playing song..");
    let q0 = queue.songs[0];
    queue.playing = true;
    let VC = require('./MusicManager').getVCForGuild(guild);
    let v = ytdl("https://www.youtube.com/watch?v=" + q0.id, { filter: "audioonly" });
    let disp = VC.playStream(v);
    disp.setVolume(queue.volume);
    const apiman = APIManager.getApiMan();
    let intervalid = setInterval(() => {
        apiman.webhookCons.filter((e) => e.guild === guild).forEach((e) => {
            e.sendUpdate("UPDATE");
        });
    }, 1000);
    disp.on('end', () => {
        clearInterval(intervalid);
        console.log("Song ended");
        queue.playing = false;
        queue.songs.shift();
        apiman.webhookCons.filter((e) => e.guild === guild).forEach((e) => {
            e.sendUpdate("UPDATE");
        });
        require('./MusicManager').playQueue(guild);
    });
};
module.exports.setVolume = (guild, nv) => {
    let queue = require('./MusicManager').getQueue(guild);
    queue.volume = nv;
    if(queue.playing) {
        require('./MusicManager').getVCForGuild(guild).dispatcher.setVolume(nv);
    }
    const apiman = APIManager.getApiMan();
    apiman.webhookCons.filter((e) => e.guild === guild).forEach((e) => {
        e.sendUpdate("UPDATE");
    });
};
module.exports.setClient = (cl) => {
    client = cl;
};