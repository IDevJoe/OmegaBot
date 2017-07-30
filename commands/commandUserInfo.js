const hurricaneCommand = require('../hurricaneCommand');
const strings = require('../Strings');
const discord = require('discord.js');

class commandUserInfo extends hurricaneCommand {
    constructor() {
        super("userinfo", "Gets information about a user", "[@mention]");
        this.live = true;
        this.execute = function(args, message) {
            if(args.length !== 1 || message.mentions.users.array().length !== 1) {
                message.channel.send(strings.formatMessage(message.author, 'Please include an @mention when executing this command'));
                return;
            }
            let embed = new discord.RichEmbed();
            let inf = message.mentions.users.array()[0];
            if(inf === undefined) {
                message.channel.send(strings.formatMessage(message.author, 'Please include an @mention when executing this command'));
                return;
            }
            embed.setThumbnail(inf.displayAvatarURL);
            embed.addField("Bot Account", inf.bot, true);
            embed.addField("ID", inf.id, true);
            let playing = "Nothing";
            let streaming = "No";
            if(inf.presence.game !== null) {
                playing = inf.presence.game.name;
                if(inf.presence.game.streaming) {
                    streaming = inf.presence.game.url;
                }
            }
            embed.addField("Playing", playing, true);
            embed.addField("Streaming", streaming, true);
            embed.addField("Presence", inf.presence.status, true);
            let ca = inf.createdAt;
            embed.addField("Created On", ca.toUTCString());
            embed.setTitle("Information for "+inf.username+"#"+inf.discriminator);
            embed.setURL(strings.SERVER_INVITE);
            message.channel.send('', {embed: embed});
        };
    }
}

module.exports = commandUserInfo;