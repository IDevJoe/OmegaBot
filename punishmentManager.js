const fs = require('fs');
const snowflake = require('node-snowflake').Snowflake;
const path = require('path');
var punishments = [];

class Punishment {
    constructor(guild, user, punisher, type, reason) {
        this.guild = guild;
        this.user = user;
        this.type = type;
        this.reason = reason;
        this.punisher = punisher;
        this.id = snowflake.nextId();
        punishments.push(this);
        fs.writeFileSync(path.join(__dirname, 'punishmentlog.json'), JSON.stringify(punishments));
    }
}

let punishmentType = {
    "WARNING": "WARNING",
    "STRIKE": "STRIKE",
    "KICK": "KICK",
    "BAN": "BAN",
    "UNBAN": "UNBAN"
};

module.exports.Punishment = Punishment;
module.exports.PunishmentType = punishmentType;
module.exports.getPunishmentForUser = function(id) {
    return punishments.filter((e) => e.user === id);
};
module.exports.getWarningsForUser = function(id) {
    return punishments.filter((e) => e.user === id && e.type === punishmentType.WARNING);
};
module.exports.getStrikesForUser = function(id) {
    return punishments.filter((e) => e.user === id && e.type === punishmentType.STRIKE);
};
module.exports.getKicksForUser = function(id) {
    return punishments.filter((e) => e.user === id && e.type === punishmentType.KICK);
};
module.exports.getBansForUser = function(id) {
    return punishments.filter((e) => e.user === id && e.type === punishmentType.BAN);
};
module.exports.GetUnbansForUser = function(id) {
    return punishments.filter((e) => e.user === id && e.type === punishmentType.UNBAN);
};
module.exports.getPunishmentById = function(id) {
    return punishments.find((e) => e.id === id);
};
module.exports.loadPunishments = function() {
    if(fs.existsSync(path.join(__dirname, 'punishmentlog.json'))) punishments = JSON.parse(fs.readFileSync(path.join(__dirname, 'punishmentlog.json')));
};
module.exports.removePunishment = function(punishment) {
    let ind = punishments.indexOf(punishment);
    punishments.splice(ind, 1);
    fs.writeFileSync(path.join(__dirname, 'punishmentlog.json'), JSON.stringify(punishments));
};