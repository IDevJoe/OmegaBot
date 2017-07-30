const hurricaneCommand = require('../hurricaneCommand');
const discord = require('discord.js');
const strings = require('../Strings');
const MusicManager = require('../MusicManager');

class commandMusic extends hurricaneCommand {
    constructor() {
        super("music", "Generates a link to access the music bot", "");
        this.live = true;
        this.execute = (args, message) => {
            const apiman = require('../APIManager').getApiMan();
            let VC = MusicManager.getVCForGuild(message.guild.id);
            if(args.length == 1 && args[0].toLowerCase() === "leave") {
                if(!message.member.hasPermission("MANAGE_CHANNELS")) {
                    message.channel.send(strings.formatMessage(message.author, 'Let\'s give that another shot. You don\'t have the required permission: Manage Channels'));
                    return false;
                }
                if(VC == null) {
                    message.channel.send(`I don't appear to be in a voice channel :thinking:`);
                    return false;
                }
                VC.channel.leave();
                message.channel.send(`I have left the voice channel.`);
                return;
            }
            if(VC != null) {
                message.channel.send(`I have generated a link for you: http://hurricane.devjoe.me/music/${message.guild.id}. You can ask the bot to leave with \`..\\music leave\``);
                return;
            }
            if(!message.member.hasPermission("MANAGE_CHANNELS")) {
                message.channel.send(strings.formatMessage(message.author, 'Let\'s give that another shot. You don\'t have the required permission: Manage Channels'));
                return false;
            }
            if(message.member.voiceChannel == null) {
                message.channel.send('You are not in a voice channel, young man.');
                return false;
            }
            message.member.voiceChannel.join().then((c) => {
                let connections = apiman.webhookCons.filter((e) => e.guild === message.guild.id);
                connections.forEach((e) => {
                    e.sendUpdate("UPDATE");
                });
                message.channel.send(`I have joined your voice channel and generated a link for you: http://hurricane.devjoe.me/music/${message.guild.id}`);
                c.on('disconnect', () => {
                    MusicManager.clearQueue(message.guild.id);
                    console.log("Queue cleared.");
                });
            }).catch((err) => {message.channel.send(`I do not have permission to join, it seems.`); console.log(err);});
        };
    }
}

module.exports = commandMusic;