const hurricaneCommand = require('../hurricaneCommand');
const strings = require('../Strings');
const discord = require('discord.js');

class commandUserInfo extends hurricaneCommand {
    constructor() {
        super("guildinfo", "Gets information about the current guild", "");
        this.live = true;
        this.execute = function(args, message) {
            let embed = new discord.RichEmbed();
            let inf = message.channel.guild;
            embed.setThumbnail(inf.iconURL);
            embed.addField("ID", inf.id, true);
            embed.addField("Owner", inf.owner.user.username+"#"+inf.owner.user.discriminator, true);
            embed.addField("Region", inf.region, true);
            embed.addField("VIP Server", (inf.splash !== null), true);
            embed.addField("\"Large Guild\" (250+ members)", inf.large, true);
            embed.addField("Member Count", inf.memberCount+"\n**The provided member count is not up to date**", false);
            let afkchannel = "None";
            if(inf.afkChannelID !== null) {
                afkchannel = inf.afkChannelID;
            }
            embed.addField("AFK Channel ID", afkchannel, true);
            embed.addField("AFK Timeout (Seconds)", inf.afkTimeout, true);
            embed.addField("Channel Count", inf.channels.array().length, true);
            embed.addField("Default Channel", "#"+inf.defaultChannel.name, true);
            embed.addField("Emoji Count", inf.emojis.array().length, true);
            embed.addField("Role Count", inf.roles.array().length, true);
            embed.setTitle("Information for "+inf.name);
            embed.setURL(strings.SERVER_INVITE);
            message.channel.send('', {embed: embed});
        };
    }
}

module.exports = commandUserInfo;