if(process.env.BB_TEST !== undefined) console.log("Beginning test...");

const discord = require('discord.js');
const express = require('express');
const path = require('path');
const fs = require('fs');
const needle = require('needle');
const morgan = require('morgan');
const onFinished = require('on-finished');

const disc_client = new discord.Client();
const Punishmentmanager = require('./punishmentManager');
let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'config.json')));
var expapp = express();
let first_ready = true;
const HC = require('./hurricaneCommand');
const Strings = require('./Strings');
const HPermissions = require('./Permissions');
const commandLoader = require('./commandLoader');
const commandLog = require('./commandLog');
const bodyParser = require('body-parser');
const APIManager = require('./APIManager');
const MusicManager = require('./MusicManager');
const htmlencode = require('htmlencode');
const cookieparser = require('cookie-parser');

expapp.set('x-powered-by', false);
expapp.set('view engine', 'ejs');
expapp.set('env', 'production');
expapp.set('views', path.join(__dirname, 'views'));
expapp.use('/static', express.static(path.join(__dirname, 'static')));
expapp.use(bodyParser.json());
expapp.use(cookieparser());
expapp.use(morgan('combined'));

const apiman = new APIManager(expapp, disc_client, config);
MusicManager.setClient(disc_client);

expapp.use('/api', (req, res, next) => {
    let tokenprov = req.get('Authorization');
    res.set('Access-Control-Allow-Origin', '*');
    if(req.method !== "OPTIONS" && req.method !== "GET") {
        eventlog_api(req, tokenprov);
    }
    if(req.path === "/info" || req.path === "/tokenvalid" || req.method === "OPTIONS" || req.path === "/bitbucket") {
        if(req.method === "OPTIONS") {
            res.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
            res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
        }
        if(req.method !== "OPTIONS" && req.path !== "/tokenvalid") {

        } else if(req.path === "/tokenvalid") {
        }
        next();
        return;
    }
    if(tokenprov === undefined || !apiman.tokenValidForDev(tokenprov)) {
        res.sendStatus(401);
        return;
    }
    next();
});

process.on('uncaughtException', function(err) {
    console.log('Uncaught exception: ' + err);
    needle.post(config.event_webhook, {content: "@everyone\n**UNCAUGHT EXCEPTION**\nHurricane cannot continue\n\n```\n"+err.stack+"```"}, {json: true}, () => {
        console.error("Hurricane will now exit.");
        process.exit(1);
    });
});
console.log("Error handler registered.");

expapp.use('/mapi', (req, res, next) => {
    let tokenprov = req.get('Authorization');
    res.set('Access-Control-Allow-Origin', '*');
    if(req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
        next();
        return;
    }
    if(tokenprov === undefined || !apiman.tokenValid(tokenprov)) {
        res.sendStatus(401);
        return;
    }
    next();
});

function eventlog_api(req, auth) {
    let user = apiman.distributedTokens.find((e) => e.token === auth);
    needle.post(config.event_webhook, {embeds:
        [{title: "API Call", description: req.method+" "+req.originalUrl, fields: [{name: "Request Body", inline: false, value: "`"+(req.body != undefined ? JSON.stringify(req.body) : "None")+"`"}, {name: "User", inline: false, value: (auth != null ? user.user.name+"#"+user.user.discriminator+" ("+user.user.id+")" : "Not Authenticated")}]}]}, {json: true});
}
function eventlog_command(logentr) {
    let logentry = logentr.object;
    needle.post(config.event_webhook, {embeds: [{title: "Command Execution", description: logentry.message.content, fields: [
        {name: "Channel", inline: false, value: `#${logentry.message.channel.name} (${logentry.message.channel.id})`},
        {name: "Guild", inline: false, value: `${logentry.message.guild.name} (${logentry.message.guild.id})`},
        {name: "User", inline: false, value: `${logentry.message.author.name} (${logentry.message.author.id})`},
        {name: "Successful", inline: false, value: (logentry.success ? 'Yes' : 'No')}],
        thumbnail: {url: logentry.message.author.avatar}}
        ]}, {json: true});
}

function eventlog_joinLeave(join, guild) {
    let hasgi = false;
    if(guild.icon !== null) hasgi = true;
    needle.post(config.event_webhook, {embeds: [{title: (join ? 'Added' : 'Removed'), description: `${guild.name} (${guild.id})\n**New guild count:** ${guild.client.guilds.array().length}`, fields: [
        {name: "Channel Count", inline: false, value: guild.channels.array().length},
        {name: "Member Count", inline: false, value: guild.memberCount},
        {name: "Region", inline: false, value: (guild.region)},
        {name: "Additional Information", inline: false, value: (join ? "You can perform more actions in the Hurricane Management Console." : 'No additional information')}],
        thumbnail: {url: (hasgi ? guild.iconURL : null)}}
    ]}, {json: true});
}

Punishmentmanager.loadPunishments();


expapp.get('/', (req, res) => {
    res.send("Hurricane Management Panel v1.5");
});

expapp.get('/login', (req, res) => {
    let next = req.query.next;
    if(next != null && !next.startsWith("http://"+encodeURIComponent(req.hostname)+"/music/")) {
        res.status(400).send("<pre>Invalid Request: Invalid next URI</pre>");
        return;
    }
    if(config.test_bot) {
        res.cookie("token", apiman.distributedTokens[0].token, {});
        if(next == null) {res.send("Your token is <pre>"+htmlencode.htmlEncode(apiman.distributedTokens[0].token)+"</pre>");} else {res.redirect(next);}
        return;
    }
    let authuri = "https://discordapp.com/api/oauth2/authorize?client_id=" + disc_client.user.id + "&scope=identify+email&redirect_uri=" + encodeURIComponent("http://"+req.hostname+"/discord_authorize") + "&response_type=code";
    if(req.cookies.token == null) {
        if(next != null) res.cookie("loginNext", next, {expires: new Date(Date.now() + 300000)});
        res.redirect(authuri);
        return;
    }
    if(!apiman.tokenValid(req.cookies.token)) {
        if(next != null) res.cookie("loginNext", next, {expires: new Date(Date.now() + 300000)});
        res.redirect(authuri);
        return;
    }
    if(req.cookies.loginNext != null) {
        res.cookie("loginNext", req.cookies.loginNext, {expires: new Date(Date.now() - 5000)});
        if(req.cookies.loginNext.startsWith("http://"+encodeURIComponent(req.hostname)+"/music/")) {
            res.redirect(req.cookies.loginNext);
            return;
        }
    }
    if(next != null) {
        res.redirect(next);
        return;
    }
    res.send("Your token is <pre>"+htmlencode.htmlEncode(req.cookies.token)+"</pre>");
});

expapp.get('/music/:server', (req, res) => {
    if(isNaN(req.params.server)) {
        res.sendStatus(404);
        return;
    }
    res.render('music', {server: req.params.server});
});

expapp.get('/discord_authorize', (req, res) => {
    if(req.query.code === undefined) {
        res.sendStatus(400);
        return;
    }
    needle.post('https://discordapp.com/api/oauth2/token', {client_id: disc_client.user.id, client_secret: config.discord_secret, code: req.query.code, grant_type: "authorization_code", redirect_uri: "http://"+req.get('host')+"/discord_authorize"}, {}, (err, resp) => {
        if(resp.body.access_token === undefined) {
            res.sendStatus(401);
            console.log(resp.body);
            console.log(JSON.stringify({client_id: disc_client.user.id, client_secret: config.discord_secret, code: req.query.code, grant_type: "authorization_code", redirect_uri: "http://"+req.get('host')+"/discord_authorize"}));
            return;
        }
        needle.get('https://discordapp.com/api/users/@me', {headers: {Authorization: 'Bearer '+resp.body.access_token}}, (errr, respp) => {
            let dev = false;
            if(HPermissions.isIdDev(respp.body.id)) {
                /*needle.post(config.event_webhook, {embeds: [{title: "OAuth flow failed.", description: `**${respp.body.username}#${respp.body.discriminator}** was denied access to the console. This could indicate a security flaw.`, fields: [
                    {name: "User ID", inline: false, value: `${respp.body.id}`}]}
                ]}, {json: true});
                res.sendStatus(401);*/
                dev = true;
            }
            const login_token = apiman.genToken();
            apiman.distributedTokens.push({token: login_token, manpan: dev, user: {name: respp.body.username, discriminator: respp.body.discriminator, id: respp.body.id}});
            let split_token = login_token.split('.');
            let censored_token = '';
            for(let i=0;i<split_token[0].length;i++) {
                censored_token += 'x';
            }
            censored_token += '.';
            censored_token += split_token[1];
            censored_token += '.';
            for(let i=0;i<split_token[2].length;i++) {
                censored_token += 'x';
            }
            needle.post(config.event_webhook, {embeds: [{title: "OAuth flow completed", description: `Granted **${respp.body.username}#${respp.body.discriminator}** a token.`, fields: [
                {name: "User ID", inline: false, value: `${respp.body.id}`},
                {name: "Generated Token", inline: false, value: censored_token}]}
            ]}, {json: true});
            let redirto = "/login";
            res.cookie("token", login_token, {expires: new Date(Date.now()+31536000000)});
            res.redirect('/login');
        });
    });
});

apiman.loadEndpoints();

if(process.env.BB_TEST === undefined) expapp.listen(config.web_port);
console.log("Web interface launched on port "+config.web_port);

console.log("Running through data file initialization...");

if(!(fs.existsSync(path.join(__dirname, "data", "askstaff.json"))))
    fs.writeFileSync(path.join(__dirname, "data", "askstaff.json"), "{}"); // askstaff.json

disc_client.on('ready', () => {
    if(first_ready) console.log("Connected and authenticated with Discord.");
    first_ready = false;
    disc_client.user.setPresence({game: {name: "Hurricane v"+config.version+" | ..\\help"}})
});

disc_client.on('guildCreate', (guild) => {
    eventlog_joinLeave(true, guild);
    guild.defaultChannel.send('Hi there!\nI\'m Hurricane, a bot with many commands. You can see my many commands by typing `..\\help` in any chat.\nFeel free to visit my Discord server, where we post changelogs and other cool things (We also offer support here): '+Strings.SERVER_INVITE)
});
disc_client.on('guildDelete', (guild) => {
    eventlog_joinLeave(false, guild);
});

disc_client.on('message', (message) => {
    if(config.test_bot !== undefined && !HPermissions.isDev(message.author)) return;
    if(message.author.bot) return;
    if(!message.content.startsWith("..\\")) return;
    let command = message.content.substr(3);
    let args = message.content.split(" ");
    command = args[0].substr(3);
    args.shift();
    let exec = HC.commands[command.toLowerCase()];
    HC.commands.forEach((cmd) => {
        if(cmd.name.toLowerCase() === command) {
            exec = cmd;
        }
    });
    if(exec === undefined) return;
    if(!exec.live && !HPermissions.isDev(message.author)) return;
    if(message.channel.type !== "text") {
        return;
    }
    let result = exec.execute(args, message);
    if(result || result === undefined) {
        eventlog_command(new commandLog(message, true));
    } else {
        eventlog_command(new commandLog(message, false));
    }
    console.log(message.author.username+"#"+message.author.discriminator+" ("+message.author.id+") executed ..\\"+command+" in #"+message.channel.name+" ("+message.channel.id+") of "+message.channel.guild.name+" ("+message.channel.guild.id+")");
});

disc_client.on('disconnect', () => {
    process.exit();
});

if(process.env.BB_TEST === undefined) disc_client.login(config.token);

// Commands
commandLoader.loadCommands();

// Tokens


if(process.env.BB_TEST !== undefined) console.log("Test complete.");