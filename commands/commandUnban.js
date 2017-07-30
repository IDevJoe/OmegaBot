const hurricaneCommand = require("../hurricaneCommand");
const discord = require("discord.js");
const strings = require("../Strings");
const punishmentManager = require("../punishmentManager");

class commandUnban extends hurricaneCommand {
    constructor() {
        super("unban", "Un-bans a user and records that on the punishment list.", "[user ID] [reason - optional]");
        this.live = true;

        this.execute = function(args, message) {
            if(args.length < 1) {
                message.channel.send(strings.formatMessage(message.author, "Correct usage: `..\\unban [user ID] [reason - optional]`"));
                return false;
            }

            if(!message.member.hasPermission("BAN_MEMBERS")) {
                message.channel.send(strings.formatMessage(message.author, "Uh oh! You do not have the required permission: `Ban Members`"));
                return false;
            }

            let targetID = args[0];

            let reason = "The moderator has not specified a reason.";
            if(args.length > 1) {
                reason = args.splice(1).join(" ").trim();
            }

            message.guild.fetchBans()
                .then((bans) => {
                    let user = bans.get(targetID);

                    if(user === undefined) {
                        message.channel.send(strings.formatMessage(message.author, "Either this user is not banned or you have entered an invalid ID."));
                        return false;
                    }

                    message.guild.unban(user)
                        .then(() => {
                            new punishmentManager.Punishment(
                                message.guild.id,
                                user.id,
                                message.author.id,
                                punishmentManager.PunishmentType.UNBAN,
                                reason
                            );

                            message.channel.send(strings.formatMessage(message.author, "Great success! " + user.username + " has been unbanned!"));
                            return true;
                        })
                        .catch(() => {
                            message.channel.send(strings.formatMessage(message.author, "Uh oh! Failed to unban the user, please try again later."));
                            return false;
                        });
                })
                .catch((err) => {
                    message.channel.send(strings.formatMessage(message.author, "Uh oh! I could not get the bans for your server - check your permissions!"));
                    console.error(err);
                    return false;
                });
        }
    }
}

module.exports = commandUnban;