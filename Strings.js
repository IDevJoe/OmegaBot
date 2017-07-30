let strings = {
    "SENDING_HELP": "I am sending you a DM containing the commands I can process!",
    "HELP_DM": "Here are my commands",
    "GUILD_ONLY": "That command is guild-only",
    "ERROR": "There was an error and I was unable to complete your request.",
    "SERVER_INVITE": "https://discord.gg/uDpAgVg"
};

module.exports = strings;
module.exports.formatMessage = function(user, data) {
    return "<@"+user.id+"> | "+data;
};