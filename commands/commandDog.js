const hurricaneCommand = require('../hurricaneCommand');
const needle = require('needle');
const discord = require('discord.js');
const strings = require('../Strings');

class commandDog extends hurricaneCommand {
    constructor() {
        super("dog", "Grabs a dog from random.dog and posts it", "");
        this.live = true;
        this.execute = function(args, message) {
            needle.get('https://random.dog/woof.json', (err, resp) => {
                if(!err && resp.statusCode === 200) {
                    let embed = new discord.RichEmbed();
                    embed.setTitle("Woof!");
                    embed.setImage(resp.body.url);
                    embed.setURL(strings.SERVER_INVITE);
                    message.channel.send("", {embed: embed});
                } else {
                    message.channel.send(strings.formatMessage(message.author, strings.ERROR));
                }
            });
        };
    }
}

module.exports = commandDog;