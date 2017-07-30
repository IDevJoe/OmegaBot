const hurricaneCommand = require('../hurricaneCommand');
const discord = require('discord.js');
const strings = require('../Strings');
const PunishmentManager = require('../punishmentManager');
const config = require('../config/config.json');

class commandRemovePunishment extends hurricaneCommand {
    constructor() {
        super('removepunishment', 'Removes a punishment from the database (Can only be used by a moderator of the punishing server)', '[punishment ID]');
        this.live = true;
        this.execute = (args, message) => {
            if(args.length !== 1 || isNaN(args[0])) {
                message.channel.send(strings.formatMessage(message.author, 'Correct usage: ..\\removepunishment [punishment ID]'));
                return true;
            }
            let punishment = PunishmentManager.getPunishmentById(args[0]);
            if(punishment === undefined) {
                message.channel.send(strings.formatMessage(message.author, 'You provided an invalid punishment ID.'));
                return false;
            }
            if((message.guild.id !== punishment.guild && config.managers.indexOf(message.author.id) === -1) || (!message.member.hasPermission("MANAGE_MESSAGES") &&  config.managers.indexOf(message.author.id) === -1)) {
                message.channel.send(strings.formatMessage(message.author, 'Let\'s give that another shot. The command was not executed on the punishing server or you don\'t have the required permission: Manage Messages'));
                return false;
            }
            PunishmentManager.removePunishment(punishment);
            message.channel.send(strings.formatMessage(message.author, 'Punishment removed. You can use `..\\punishments [@mention]` to see the updated punishment record.'));
            return true;
        };
    }
}

module.exports = commandRemovePunishment;