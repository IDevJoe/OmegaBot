const hurricaneCommand = require("../hurricaneCommand");
const discord = require("discord.js");
const strings = require("../Strings");

class commandAskStaff extends hurricaneCommand {
    constructor() {
        super("askstaff", "Asks staff a question if they have a channel setup for it.", "[message]");
        this.live = true;

        this.execute = function(args, message) {
            let askStaffConfig = require("../data/askstaff.json");

            let channelId = askStaffConfig[message.guild.id];
            let channel = message.guild.channels.get(channelId);

            if(channel === undefined) {
                message.channel.send(strings.formatMessage(message.author, "Either there is no questions channel set or it has been deleted since it was set. Please ask someone with the `Manage Channels` permission to run `..\\setquestionschannel`."));
                return false;
            }

            if(args.length === 0) {
                message.channel.send(strings.formatMessage(message.author, "Correct usage: `..\\askstaff [question]`"));
                return false;
            }

            let question = args.join(" ").trim();

            let embed = new discord.RichEmbed();
            embed.setTitle("Someone has a question!");
            embed.setDescription("**User:** " + message.author);
            embed.addField("Question", question);
            embed.setTimestamp(new Date());
            embed.setThumbnail(message.author.displayAvatarURL);
            channel.send("", {embed: embed});

            message.channel.send(strings.formatMessage(message.author, "I have let the staff know you have a question, now we wait..."));
        }
    }
}

module.exports = commandAskStaff;