const hurricaneCommand = require('../hurricaneCommand');
const discord = require('discord.js');
const strings = require('../Strings');
const PunishmentManager = require('../punishmentManager');

class commandStrike extends hurricaneCommand {
    constructor() {
        super('strike', 'Strikes a user', '[@mention] [reason]');
        this.live = true;
        this.execute = function(args, message) {
            if(args.length < 2 || (message.mentions.users.array().length !== 1 || !args[0].startsWith('<@'))) {
                message.channel.send(strings.formatMessage(message.author, 'Correct usage: ..\\strike [@mention] [reason]'));
                return;
            }
            if(!message.member.hasPermission("MANAGE_MESSAGES")) {
                message.channel.send(strings.formatMessage(message.author, 'Let\'s give that another shot. You don\'t have the required permission: Manage Messages'));
                return;
            }
            let target = message.mentions.users.array()[0];
            if(target === undefined) {
                message.channel.send(strings.formatMessage(message.author, 'Correct usage: ..\\strike [@mention] [reason]'));
                return;
            }
            message.guild.fetchMember(target).then((e) => {
                if(message.member.highestRole.position > e.highestRole.position) {
                    let reason = args.slice();
                    reason.shift();
                    reason = reason.join(' ');
                    new PunishmentManager.Punishment(message.guild.id, target.id, message.author.id, PunishmentManager.PunishmentType.STRIKE, reason);
                    message.channel.send(strings.formatMessage(message.author, 'User successfully striked. You can use `..\\punishments [@mention]` to see the updated punishment record.'));
                } else {
                    message.channel.send(strings.formatMessage(message.author, 'That user has a higher rank than you.'));
                }
            });
        }
    }
}

module.exports = commandStrike;