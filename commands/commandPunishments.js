const hurricaneCommand = require('../hurricaneCommand');
const discord = require('discord.js');
const strings = require('../Strings');
const PunishmentManager = require('../punishmentManager');

class commandPunishments extends hurricaneCommand {
    constructor() {
        super('punishments', 'Views a user\'s punishments', '[@mention]');
        this.live = true;
        this.execute = function(args,message) {
            if(args.length !== 1 && message.mentions.users.array().length !== 1) {
                message.channel.send(strings.formatMessage(message.author, 'Correct usage: ..\\punishments [@mention]'));
                return;
            }
            let target = message.mentions.users.array()[0];
            if(target === undefined) {
                message.channel.send(strings.formatMessage(message.author, 'Correct usage: ..\\punishments [@mention]'));
                return;
            }
            let pastPunishments = PunishmentManager.getPunishmentForUser(target.id);
            if(pastPunishments.length === 0) {
                message.channel.send(strings.formatMessage(message.author, target.username+'\'s punishment record is clean.'));
                return;
            }
            let embed = new discord.RichEmbed();
            embed.setDescription("Here's what we've got");
            embed.setTitle(target.username+"'s punishment record");
            embed.setThumbnail(target.displayAvatarURL);
            pastPunishments.forEach((e) => {
                let punisher = message.client.users.array()[message.client.users.keyArray().indexOf(e.punisher)];
                let guild = message.client.guilds.array()[message.client.guilds.keyArray().indexOf(e.guild)];
                let punisher_display = "[ID: "+e.punisher+"]";
                let guild_display = "[ID: "+e.guild+"]";
                if(punisher !== undefined) punisher_display = punisher.username+"#"+punisher.discriminator;
                if(guild !== undefined) guild_display = guild.name+" ["+e.guild+"]";
                embed.addField(e.type, "**Punishment ID:** "+e.id+"\n**Reason:** "+e.reason+"\n**By user:** "+punisher_display+"\n**In guild:** "+guild_display);
            });
            embed.addField("Unfairly punished?", "That's not good! Run the `..\\falsepunishment` command and we'll help you out.");
            embed.setURL(strings.SERVER_INVITE);
            message.channel.send("", {embed: embed});
        }
    }
}

module.exports = commandPunishments;