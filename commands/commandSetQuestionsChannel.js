const hurricaneCommand = require("../hurricaneCommand");
const discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const strings = require("../Strings");

class commandSetQuestionsChannel extends hurricaneCommand {
    constructor() {
        super("setquestionschannel", "Sets the channel that questions from `..\\askstaff` will be entered in to. Requires Manage Channels permission.", "[#channel (or none to disable)]");
        this.live = true;

        this.execute = function(args, message) {
            let askStaffData = require("../data/askstaff.json");

            let member = message.member;
            let channel = message.mentions.channels.array()[0];

            if(! member.hasPermission("MANAGE_CHANNELS")) {
                message.channel.send(strings.formatMessage(message.author, "Uh oh! You need the `Manage Channels` permission to change this value!"));
                return false;
            }

            if(args.length === 0) {
                message.channel.send(strings.formatMessage(message.author, "Correct usage: `..\\setquestionschannel [#channel (or none to disable)]`"));
                return false;
            }

            if(channel === undefined) {
                message.channel.send(strings.formatMessage(message.author, "Correct usage: `..\\setquestionschannel [#channel (or none to disable)]`"));
                return false;
            }

            if(args[0].toLowerCase() === "none") {
                delete askStaffData[message.guild.id];
                message.channel.send(strings.formatMessage(message.author, "We've disabled the ask staff feature for this server!"));
                return;
            }

            askStaffData[message.guild.id] = channel.id;
            message.channel.send(strings.formatMessage(message.author, "We've set the channel for ask staff to #" + channel.name + " and the ask staff feature has been enabled!"));

            fs.writeFileSync(path.join(__dirname, "..", "data", "askstaff.json"), JSON.stringify(askStaffData));
        }
    }
}

module.exports = commandSetQuestionsChannel;