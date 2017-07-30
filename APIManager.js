const commandLog = require('./commandLog');
const MusicManager = require('./MusicManager');
const ytdl = require('ytdl-core');
const needle = require('needle');
const snowflake = require('node-snowflake');

let currentapiman = null;

class APIManager {
    constructor(expapp, disc_client, config) {
        currentapiman = this;
        this.expapp = expapp;
        this.disc_client = disc_client;
        this.config = config;
        this.distributedTokens = [];
        this.webhookCons = [];
        if(config.test_bot) {
            let tt = this.genToken();
            this.distributedTokens.push({token: tt, user:{name: "TEST", id: "TEST", discriminator: "TEST"}});
            console.log("Test token: "+tt);
        }
        this.tokenValid = this.tokenValid.bind(this);
    }

    tokenValidForDev(token) {
        let distributedTokens = this.distributedTokens;
        let toRet = false;
        toRet = distributedTokens.find((e) => e.token === token && e.manpan) != null;
        return toRet;
    }

    loadEndpoints() {
        let genToken = this.genToken;
        let expapp = this.expapp;
        let disc_client = this.disc_client;
        let config = this.config;
        let distributedTokens = this.distributedTokens;
        let tokenValid = this.tokenValid;

        // Websocket

        expapp.ws('/music/ws', (ws, req) => {
            ws.close(); // Music is experimental.
            return;
            let token = null;
            let guildid = null;
            let connid = snowflake.Snowflake.nextId();
            console.log("WS connection established with "+req.ip+" (_trace: "+connid+")");
            ws.on('close', (code, reason) => {
                let connection = this.webhookCons.find((e) => e.connid === connid);
                if(connection != null) {
                    this.webhookCons.splice(this.webhookCons.indexOf(connection), 1);
                }
                console.log("["+connid+"] WS closed: "+reason+" ("+code+")");
            });
            ws.on('message', (m) => {
                let payload = {};
                try {
                    payload = JSON.parse(m);
                } catch(e) {
                    ws.close(1001, "Invalid Payload");
                    return;
                }
                if(payload.e == null || payload.d == null) {
                    ws.close(1001, "Invalid Payload");
                    return;
                }
                const VALID_EVENTS = ["IDENT", "QUEUE"];
                if(VALID_EVENTS.indexOf(payload.e) === -1) {
                    ws.close(1002, "Invalid Event");
                    return;
                }
                if(payload.e === "IDENT") {
                    if(token != null || payload.d.token == null || payload.d.guild == null || isNaN(payload.d.guild)) {
                        ws.close(1002, "Invalid IDENT Payload");
                        return;
                    }
                    if(!this.tokenValid(payload.d.token)) {
                        ws.close(1003, "Invalid token");
                        return;
                    }
                    token = payload.d.token;
                    if(disc_client.guilds.array().find((e) => e.id === payload.d.guild) == null) {
                        console.log(payload.d.guild);
                        ws.close(1003, "Invalid guild");
                        return;
                    }
                    guildid = payload.d.guild;
                    let guild = disc_client.guilds.array().find((e) => e.id === guildid);
                    this.webhookCons.push({connid: connid, socket: ws, guild: guildid, token: token, sendUpdate: (event) => {
                        try {
                            let nq = [];
                            if (MusicManager.getVCForGuild(payload.d.guild) != null) {
                                MusicManager.getQueue(payload.d.guild).songs.forEach((e) => nq.push({
                                    title: e.title,
                                    user: e.user
                                }));
                            }
                            if (!config.test_bot) guild.fetchMember(distributedTokens.find((e) => e.token === token).user.id).then((member) => {
                                ws.send(JSON.stringify({
                                    e: event, d: {
                                        canManage: member.hasPermission("MUTE_MEMBERS"),
                                        volume: (MusicManager.getVCForGuild(guildid) != null ? MusicManager.getQueue(guild).volume * 100 : 0),
                                        percentage: (MusicManager.getVCForGuild(guildid) != null && MusicManager.getVCForGuild(guildid).dispatcher != null ? MusicManager.getVCForGuild(guildid).dispatcher.time / (MusicManager.getQueue(guildid).songs[0].length * 1000) : 0),
                                        connected: MusicManager.getVCForGuild(guildid) != null,
                                        queue: (MusicManager.getVCForGuild(guildid) != null ? nq : null),
                                        playing: (MusicManager.getVCForGuild(guildid) != null ? MusicManager.getQueue(guildid).playing : false),
                                        _trace: connid
                                    }
                                }));
                            }).catch((err) => {
                                console.log(err);
                                ws.close(1003, "User is not in guild");
                            });
                            if (config.test_bot) ws.send(JSON.stringify({
                                e: event, d: {
                                    canManage: true,
                                    volume: (MusicManager.getVCForGuild(guildid) != null ? MusicManager.getQueue(guildid).volume * 100 : 0),
                                    percentage: (MusicManager.getVCForGuild(guildid) != null && MusicManager.getVCForGuild(guildid).dispatcher != null ? MusicManager.getVCForGuild(guildid).dispatcher.time / (MusicManager.getQueue(guildid).songs[0].length * 1000) : 0),
                                    connected: MusicManager.getVCForGuild(guildid) != null,
                                    queue: (MusicManager.getVCForGuild(guildid) != null ? nq : null),
                                    playing: (MusicManager.getVCForGuild(guildid) != null ? MusicManager.getQueue(guild).playing : false),
                                    _trace: connid
                                }
                            }));
                        } catch(ex) {}
                    }});
                    let usr = distributedTokens.find((e) => e.token === token).user;
                    console.log("["+connid+"] Identified: "+usr.name+"#"+usr.discriminator+" ("+usr.id+")");
                    let connection = this.webhookCons.find((e) => e.connid === connid);
                    connection.sendUpdate("HELLO");
                }
                if(token == null) {
                    ws.close(1003, "Unauthorized");
                    return;
                }
                if(payload.e === "QUEUE") {
                    if(payload.d.id == null) {
                        ws.close(1002, "Invalid QUEUE Payload");
                        return;
                    }
                    if(MusicManager.getVCForGuild(guildid) == null) {
                        ws.close(1003, "Unauthorized");
                        return;
                    }
                    ytdl.getInfo("https://www.youtube.com/watch?v="+encodeURIComponent(payload.d.id), (err, info) => {
                        if(err != null) return;
                        let userinf = distributedTokens.find((e) => e.token === token).user;
                        MusicManager.queueGuildSong(guildid, payload.d.id, info.title, info.length_seconds, userinf);
                    });
                }
            })
        });
        console.log("Registered WS");

        // Main Endpoints

        expapp.get('/api/tokenvalid', (req, res) => {
            if(req.query.token === undefined || req.query.for === undefined) {
                res.sendStatus(400);
                return;
            }
            if(req.query.for === "music") {
                res.json({valid: tokenValid(req.query.token)});
                return;
            }
            if(req.query.for === "dev") {
                res.json({valid: this.tokenValidForDev(req.query.token)});
                return;
            }
            res.sendStatus(400);
        });

        expapp.get('/api/guilds/:guild/invite', (req, res) => {
            let guild = disc_client.guilds.array()[disc_client.guilds.keyArray().indexOf(req.params.guild)];
            if(guild === undefined) {
                res.sendStatus(404);
                return;
            }
            guild.defaultChannel.createInvite({temporary: true, maxUses: 1, maxAge: 1800}).catch(() => {
                res.sendStatus(403);
            }).then((invite) => {
                if(invite !== undefined) res.json({name: guild.name, code: invite.code+""});
            });
        });

        expapp.post("/api/github", (req, res) => {
            if(req.body.action !== "closed") return;
            if(!req.body.pull_request.merged) return;
            if(req.body.pull_request.base.label === "master") {
                needle.post(config.event_webhook, {content: "**Hurricane is preparing files for an update.**"}, {json: true});
                const exec = require('child_process').exec;
                exec(config.git_update_cmd === undefined ? "cd "+__dirname+" && git pull origin master" : config.git_update_cmd, (error, stdout, stderr) => {
                    if(stdout.length === 0) {
                        needle.post(config.event_webhook, {content: "**Hurricane failed to update**\n\n```\n"+stderr+"```"}, {json: true});
                    } else
                        needle.post(config.event_webhook, {content: "**Hurricane is restarting for an update**\n\n```\n"+stdout+"```"}, {json: true}, (err, resp) => {
                            disc_client.destroy();
                        });
                });
            }
            res.sendStatus(204);
        });

        expapp.post("/api/guilds/:guild/sendmessage", (req, res) => {
            let guild = disc_client.guilds.array()[disc_client.guilds.keyArray().indexOf(req.params.guild)];

            if(guild === null) {
                res.sendStatus(404);
                return;
            }

            guild.defaultChannel.send(req.body.message);
            res.sendStatus(200);
        });

        expapp.post('/api/login', (req, res) => {
            if(req.body.code === undefined) {
                res.sendStatus(400);
                return;
            }
            needle.post('https://discordapp.com/api/oauth2/token', {client_id: disc_client.user.id, client_secret: config.discord_secret, code: req.body.code, grant_type: "authorization_code", redirect_uri: "http://"+req.get('host')+"/discord_authorize"}, {}, (err, resp) => {
                if(resp.body.access_token === undefined) {
                    res.sendStatus(401);
                    console.log(resp.body);
                    return;
                }
                needle.get('https://discordapp.com/api/users/@me', {headers: {Authorization: 'Bearer '+resp.body.access_token}}, (errr, respp) => {
                    if(respp.body.id !== "174686142485102603") {
                        res.sendStatus(401);
                        return;
                    }
                    const login_token = genToken();
                    distributedTokens.push(login_token);
                    res.json({token: login_token});
                });
            });
        });

        expapp.get('/api/info', (req, res) => {
            res.json({
                serversJoined: disc_client.guilds.array().length,
                totalChannels: disc_client.channels.array().length,
                totalUsers: disc_client.users.array().length,
                botName: disc_client.user.username,
                botDiscrminator: disc_client.user.discriminator,
                botId: disc_client.user.id
            });
        });

        expapp.get('/api/commandlog', (req, res) => {
            res.json(commandLog.logged);
        });

        expapp.post('/api/shutdown', (req, res) => {
            res.sendStatus(204);
            disc_client.destroy();
        });

        expapp.get('/api/guilds', (req, res) => {
            res.json(disc_client.guilds.array());
        });

        expapp.get('/api/guilds/search', (req, res) => {
            if(req.query.q === undefined) {
                res.sendStatus(400);
                return;
            }
            res.json(disc_client.guilds.array().filter((e) => e.name.toLowerCase().match(new RegExp(`.*${req.query.q.toLowerCase()}.*`))));
        });

        expapp.put('/api/reportstats', (req, res) => {
            if(config.discordbots_api !== undefined) {
                needle.post('https://bots.discord.pw/api/bots/'+disc_client.user.id+"/stats", {server_count: disc_client.guilds.array().length}, {json: true, headers: {Authorization: config.discordbots_api}}, (err, resp) => {
                    console.log("Stats were reported to bots.discord.pw");
                });
            }
            res.sendStatus(204);
        });

        expapp.delete('/api/guilds/:guildId', (req, res) => {
            if(isNaN(req.params.guildId)) {
                res.json(disc_client.guilds.array());
                return;
            }
            let arr = disc_client.guilds.array();
            let found = null;
            for(let ci in arr) {
                if(arr[ci].id === req.params.guildId) {
                    found = arr[ci];
                    break;
                }
            }
            if(found === null) {
                res.json(disc_client.guilds.array());
                return;
            }
            found.leave();
            res.json(disc_client.guilds.filterArray((x) => x.id !== req.params.guildId));
        });

        expapp.post('/api/status', (req, res) => {
            if(req.body.newStatus === undefined) {
                res.sendStatus(400);
                return;
            }
            disc_client.user.setPresence({game: {name: "Hurricane v"+config.version+" | "+req.body.newStatus}});
            res.sendStatus(204);
        });

        // Music Endpoints

        expapp.get('/mapi/ytsearch', (req, res) => {
            if(req.query.q == null) {
             res.sendStatus(400);
             return;
             }
            needle.get('https://www.googleapis.com/youtube/v3/search?key='+config.googleKey+'&part=snippet&type=video&maxResults=5&q='+encodeURIComponent(req.query.q), (err, ress) => {
                if(ress.body.error != null) {
                    res.sendStatus(500);
                    return;
                }
                res.json(ress.body);
            })
        });

        expapp.get('/mapi/:server', (req, res) => {
            if(req.params.server == null || isNaN(req.params.server)) {
                res.sendStatus(400);
                return;
            }
            let nq = [];
            if(MusicManager.getVCForGuild(req.params.server) != null) {
                MusicManager.getQueue(req.params.server).songs.forEach((e) => nq.push({title: e.title, user: e.user}));
            }
            if(disc_client.guilds.array().find((e) => e.id === req.params.server) == null) {
                res.sendStatus(404);
                return;
            }
            let guild = disc_client.guilds.array().find((e) => e.id === req.params.server);
            if(!config.test_bot) guild.fetchMember(distributedTokens.find((e) => e.token === req.get('Authorization')).user.id).then((member) => {
                res.json({canManage: member.hasPermission("MUTE_MEMBERS"),
                    volume: (MusicManager.getVCForGuild(req.params.server) != null ? MusicManager.getQueue(req.params.server).volume*100 : 0),
                    percentage: (MusicManager.getVCForGuild(req.params.server) != null && MusicManager.getVCForGuild(req.params.server).dispatcher != null ? MusicManager.getVCForGuild(req.params.server).dispatcher.time/(MusicManager.getQueue(req.params.server).songs[0].length*1000) : 0),
                    connected: MusicManager.getVCForGuild(req.params.server) != null,
                    queue: (MusicManager.getVCForGuild(req.params.server) != null ? nq : null),
                    playing: (MusicManager.getVCForGuild(req.params.server) != null ? MusicManager.getQueue(req.params.server).playing : false)});
            }).catch((err) => {
                console.log(err);
                res.sendStatus(404);
            });
            if(config.test_bot) res.json({canManage: true,
                volume: (MusicManager.getVCForGuild(req.params.server) != null ? MusicManager.getQueue(req.params.server).volume*100 : 0),
                percentage: (MusicManager.getVCForGuild(req.params.server) != null && MusicManager.getVCForGuild(req.params.server).dispatcher != null ? MusicManager.getVCForGuild(req.params.server).dispatcher.time/(MusicManager.getQueue(req.params.server).songs[0].length*1000) : 0),
                connected: MusicManager.getVCForGuild(req.params.server) != null,
                queue: (MusicManager.getVCForGuild(req.params.server) != null ? nq : null),
                playing: (MusicManager.getVCForGuild(req.params.server) != null ? MusicManager.getQueue(req.params.server).playing : false)});
        });

        expapp.put('/mapi/:server/queue', (req, res) => {
            if(req.params.server == null || isNaN(req.params.server) || req.body.id == null) {
                res.sendStatus(400);
                return;
            }
            if(MusicManager.getVCForGuild(req.params.server) == null) {
                res.sendStatus(400);
                return;
            }
            ytdl.getInfo("https://www.youtube.com/watch?v="+encodeURIComponent(req.body.id), (err, info) => {
                if(err != null) {res.sendStatus(404); return;}
                let userinf = distributedTokens.find((e) => e.token === req.get('Authorization')).user;
                MusicManager.queueGuildSong(req.params.server, req.body.id, info.title, info.length_seconds, userinf);
                res.sendStatus(204);
            });
        });

        expapp.patch('/mapi/:server/volume', (req, res) => {
            if(req.body.volume == null || isNaN(req.body.volume)) {
                res.sendStatus(400);
                return;
            }
            if(MusicManager.getVCForGuild(req.params.server) == null) {
                res.sendStatus(400);
                return;
            }
            if(req.body.volume < 0 || req.body.volume > 100) {
                res.sendStatus(400);
                return;
            }
            MusicManager.setVolume(req.params.server, req.body.volume/100);
            res.sendStatus(200);
        });

        expapp.get('/wow', (req, res) => res.send("ok"));
    }

    tokenValid(token) {
        let distributedTokens = this.distributedTokens;
        let toRet = false;
        toRet = distributedTokens.find((e) => e.token === token) != null;
        return toRet;
    }


    genToken() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 50; i++) {
            if (i === 20 || i === 30) text += ".";
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

module.exports = APIManager;
module.exports.getApiMan = function() {return currentapiman;};