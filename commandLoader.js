const commandHelp = require('./commands/commandHelp')
    ,commandCat = require('./commands/commandCat')
    ,commandUserInfo = require('./commands/commandUserInfo')
    ,commandGuildInfo = require('./commands/commandGuildInfo')
    ,commandStrike = require('./commands/commandStrike')
    ,commandKick = require('./commands/commandKick')
    ,commandBan = require('./commands/commandBan')
    ,commandPunishments = require('./commands/commandPunishments')
    ,commandLabelImage = require('./commands/commandLabelImage')
    ,commandDog = require('./commands//commandDog')
    ,commandDiscord = require('./commands/commandDiscord')
    ,commandRemovePunishment = require('./commands/commandRemovePunishment')
    ,commandFalsePunishment = require("./commands/commandFalsePunishment")
    ,commandSetQuestionsChannel = require("./commands/commandSetQuestionsChannel")
    ,commandAskStaff = require("./commands/commandAskStaff")
    ,commandWarning = require("./commands/commandWarning")
    ,commandUnban = require("./commands/commandUnban")
    ,commandMusic = require('./commands/commandMusic');

module.exports.loadCommands = function() {
    new commandHelp();
    new commandCat();
    new commandUserInfo();
    new commandGuildInfo();
    new commandWarning();
    new commandStrike();
    new commandKick();
    new commandBan();
    new commandPunishments();
    new commandRemovePunishment();
    new commandLabelImage();
    new commandDog();
    new commandDiscord();
    new commandFalsePunishment();
    new commandSetQuestionsChannel();
    new commandAskStaff();
    new commandUnban();
    new commandMusic();
};