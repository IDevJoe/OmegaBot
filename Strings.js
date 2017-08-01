let strings = {
    "SENDING_HELP": "I am sending you a DM containing the commands I can process!",
    "HELP_DM": "Here are my commands",
    "GUILD_ONLY": "That command is guild-only",
    "ERROR": "There was an error and I was unable to complete your request.",
    "SERVER_INVITE": "https://discord.gg/uDpAgVg",
    "HELLO": "Hi there!\nI'm Omega, a bot with many commands. You can see my many commands by typing `!-!help` in any chat.\nFeel free to visit my Discord server, where we post changelogs and other cool things (We also offer support here): "
};

module.exports = strings;
module.exports.formatMessage = function(user, data) {
    return "<@"+user.id+"> | "+data;
};