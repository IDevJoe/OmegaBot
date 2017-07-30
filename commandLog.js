let logged = [];

class commandLog {

    constructor(message, success) {
        this.message = message;
        this.success = success;
        this.object = {message: {content: message.content, channel: {id: message.channel.id, name: message.channel.name}, guild: {id: message.guild.id, name: message.guild.name}, author: {id: message.author.id, name: message.author.username+"#"+message.author.discriminator, avatar: message.author.displayAvatarURL}}, success: success, timestamp: new Date().toLocaleString()};
        logged.unshift(this.object);
        if(logged.length > 50) {
            logged.pop();
        }
    }

}

module.exports = commandLog;
module.exports.logged = logged;