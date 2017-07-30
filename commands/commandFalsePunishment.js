const hurricaneCommand = require("../hurricaneCommand");
const discord = require("discord.js");
const strings = require("../Strings");

class commandFalsePunishment extends hurricaneCommand {
    constructor() {
        super("falsepunishment", "Sends instructions to a user about what to do if they are falsely punished.", "");
        this.live = true;

        this.execute = function(args, message) {
            let embed = new discord.RichEmbed();
            embed.setTitle("Falsely punished? Oh dear.");
            embed.setDescription("Don't worry - all is not lost!");
            embed.addField("Can you unban me!?!?!?!?", "Unfortunately not, we can only remove a punishment from your Hurricane punishment record.");
            embed.addField("Step 1", "**Speak to the server that punished you.** They can also remove punishments using the `..\\removepunishment` command and they are the people you want to do it! We can only help if you have been to them and they aren't budging.");
            embed.addField("Step 2", "Gather evidence. We need to be able to prove that the punishment was false, so gather any screenshots or IDs you can get! Try and get us a permanent invite to the server - if you can't, we can magic one up.");
            embed.addField("Step 3", "[Join our Discord server](" + strings.SERVER_INVITE + ") and speak to someone with the Developer role. They'll be able to review your case.");
            embed.addField("Step 4", "**Profit!** Enjoy your new found peace!");
            embed.setFooter("Thanks for using Hurricane! Please remember - we can only remove punishments from your record. We can not unban you from a server!");
            message.author.send("", {embed: embed});
            message.channel.send(strings.formatMessage(message.author, "Check your private messages for some information!"));
        }
    }
}

module.exports = commandFalsePunishment;