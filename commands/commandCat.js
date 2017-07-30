const hurricaneCommand = require('../hurricaneCommand');
const needle = require('needle');
const discord = require('discord.js');
const strings = require('../Strings');

class commandCat extends hurricaneCommand {
    constructor() {
        super("cat", "Grabs a cat from random.cat and posts it", "");
        this.live = true;
        this.execute = function(args, message) {
            needle.get('http://random.cat/meow', (err, resp) => {
                if(!err && resp.statusCode === 200) {
                    let embed = new discord.RichEmbed();
                    embed.setTitle("Oh look! There's a cat");
                    embed.setImage(resp.body.file);
                    embed.setURL(strings.SERVER_INVITE);
                    message.channel.send("", {embed: embed});
                } else {
                    message.channel.send(strings.formatMessage(message.author, strings.ERROR));
                }
            });
        };
    }
}

module.exports = commandCat;