const hurricaneCommand = require('../hurricaneCommand');
const discord = require('discord.js');
const strings = require('../Strings');
const needle = require('needle');
const fs = require('fs');
const path = require('path');

class commandLabelImage extends hurricaneCommand {

    translateSafeSearch(s) {
        if(s === "UNKNOWN") return "Unknown";
        if(s === "VERY_UNLIKELY") return "Very Unlikely";
        if(s === "UNLIKELY") return "Unlikely";
        if(s === "POSSIBLE") return "Possible";
        if(s === "LIKELY") return "Likely";
        if(s === "VERY_LIKELY") return "Very Likely";
        return s;
    }

    constructor() {
        super("labelimage", "Labels an image with appropriate tags", "[image URL/attachment]");
        this.live = true;
        let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config', 'config.json')));
        this.execute = function(args, message) {
            if(args.length !== 1 && message.attachments.array().length === 0) {
                message.channel.send(strings.formatMessage(message.author, 'Please attach an image or include the image URL'));
                return;
            } else if(args.length === 0 && message.attachments.array().length !== 1) {
                message.channel.send(strings.formatMessage(message.author, 'Please attach an image or include the image URL'));
                return;
            }
            let imageURL;
            if(message.attachments.array().length !== 0) {
                imageURL = message.attachments.array()[0].proxyURL;
            } else if(args.length !== 0) {
                imageURL = args[0];
            }
            message.channel.send(strings.formatMessage(message.author, 'Labeling that image!'));
            needle.post(`https://vision.googleapis.com/v1/images:annotate?key=${config.googleKey}`, {
                "requests": {
                    "image": {
                        "source": {
                            "imageUri": imageURL
                        }
                    },
                    "features": [
                        {
                            "type": "SAFE_SEARCH_DETECTION",
                            "maxResults": 10
                        },
                        {
                            "type": "WEB_DETECTION",
                            "maxResults": 10
                        }
                    ]
                }
            }, {"json": true}, (err, resp) => {
                if(resp.body.responses[0].error !== undefined) {
                    message.channel.send(strings.formatMessage(message.author, 'The URL provided is invalid or we cannot access that location.'));
                    console.log(resp.body.responses[0].error);
                    return false;
                }
                let embed = new discord.RichEmbed();
                embed.setTitle("Image information");
                embed.setThumbnail(imageURL);
                embed.setDescription("Provided by [Google Vision API](https://cloud.google.com/vision/)");
                let response = resp.body.responses[0];
                let safeSearch = response.safeSearchAnnotation;
                embed.addField("Likelihoods", `**Adult Content:** ${this.translateSafeSearch(safeSearch.adult)}\n**Modified from original (Spoof):** ${this.translateSafeSearch(safeSearch.spoof)}\n**Medical Image:** ${this.translateSafeSearch(safeSearch.medical)}\n**Violent Content:** ${this.translateSafeSearch(safeSearch.violence)}`);
                let webDetection = response.webDetection.webEntities;
                webDetection.forEach((e) => {
                    embed.addField(e.description, `**Score:** ${e.score}`, true);
                });
                embed.setURL(strings.SERVER_INVITE);
                message.channel.send("", {embed: embed});
            });
        }
    }
}

module.exports = commandLabelImage;