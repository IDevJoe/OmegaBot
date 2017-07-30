
let commands = [];

class hurricaneCommand {

    constructor(name, description, syntax) {
        this.name = name;
        this.description = description;
        this.syntax = syntax;
        this.guildOnly = false;
        this.live = false;
        this.execute = function(args, message) {};
        commands.push(this);
    }

}

module.exports = hurricaneCommand;
module.exports.commands = commands;