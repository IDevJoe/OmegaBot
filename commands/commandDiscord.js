const hurricaneCommand = require('../hurricaneCommand');
const needle = require('needle');
const discord = require('discord.js');
const strings = require('../Strings');

class commandDiscord extends hurricaneCommand {
    constructor() {
        super("discord", "Shows Hurricane's community server invite link", "");
        this.live = true;
        this.execute = function(args, message) {
            message.channel.send(strings.formatMessage(message.author, `Our Discord server can be found at ${strings.SERVER_INVITE}`));
        };
    }
}

module.exports = commandDiscord;