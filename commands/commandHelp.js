const hurricaneCommand = require('../hurricaneCommand');
const strings = require('../Strings');
const Discord = require('discord.js');
const Permissions = require('../Permissions');

class commandHelp extends hurricaneCommand {
    constructor() {
        super("help", "Displays all commands", "");
        this.live = true;
        this.execute = function(args, message) {
            message.channel.send(strings.formatMessage(message.author, strings.SENDING_HELP));
            let embed = new Discord.RichEmbed();
            embed.setTitle("Hurricane Command List");
            embed.setDescription("Here is a complete list of my commands.");
            let cmds = hurricaneCommand.commands;
            cmds.forEach((cmd) => {
                if(!cmd.live) {
                    if(Permissions.isDev(message.author)) {
                        embed.addField("!-!"+cmd.name, "**Not Live**\n"+cmd.description+"\n**Correct Usage:** !-!"+cmd.name+" "+cmd.syntax, false);
                    }
                } else {
                    embed.addField("!-!"+cmd.name, cmd.description+"\n**Correct Usage:** !-!"+cmd.name+" "+cmd.syntax, false);
                }

            });
            embed.setURL(strings.SERVER_INVITE);
            message.author.createDM().then((dm) => dm.send("", {embed: embed}));
        };
    }
}

module.exports = commandHelp;