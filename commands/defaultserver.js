module.exports = {
    name: ["defaultserver"],
    description: "converts the current server into a default format for mafia games",
    args: false,
    numargs: 1,
    usage: "",
    execute(message, args)
    {
        const fs = require('fs');
        const utilities = require('../utilities.js');
        const client = require('../main.js').client;
        const Discord = require('discord.js');

        //verify in a server
        if(message.channel instanceof Discord.DMChannel)
        {
            message.reply("You must be in a server to use this command.");
            return;
        }

        //verify server owner
        if(!utilities.verifyServerOwner(message, message.channel.guild.id))
        {
            console.log("Attempt to default a server by a non-owner.");
            message.reply("Must be server owner to default a server.");
            return;
        }

        //get guild object
        const server = message.channel.guild;

        //delete all channels and categories
        server.channels.cache.forEach(channel => channel.delete().catch(error => {console.log(error)}));

        //delete all roles not in use by the bot (or everyone)
        server.roles.cache.forEach(role => {
            server.members.fetch(client.user.id).then(botmember => {
                var roleinbot = false;
                botmember.roles.cache.forEach(r => {
                    if(r == role)
                    {
                        roleinbot = true;
                    }
                });
                if(role != server.roles.everyone && !roleinbot)
                {
                    role.delete().catch(error => {console.log(error)});
                }
            });
        });

        //create host role
        server.roles.create({
            data: {
                name: "Host",
                color: "YELLOW",
                mentionable: true,
                permissions: ["ADMINISTRATOR"]
            }
        }).catch(error => {console.log(error)});

        //create co-host role
        server.roles.create({
            data: {
                name: "Co-Host",
                color: "GREEN",
                mentionable: true,
                permissions: ["ADMINISTRATOR"]
            }
        }).catch(error => {console.log(error)});

        //create player role
        server.roles.create({
            data: {
                name: "Player",
                color: "RED",
                mentionable: true,
                permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "CHANGE_NICKNAME"]
            }
        }).catch(error => {console.log(error)});

        //create observer role
        server.roles.create({
            data: {
                name: "Observer",
                color: "BLUE",
                mentionable: true,
                permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "CHANGE_NICKNAME"]
            }
        }).catch(error => {console.log(error)});

        //create dead role
        server.roles.create({
            data: {
                name: "Dead",
                color: "PURPLE",
                mentionable: true,
                permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "CHANGE_NICKNAME"]
            }
        }).catch(error => {console.log(error)});

        //create pregame category
        var pregameid;
        server.channels.create("PREGAME", {type: "category"}).then(channel => {
            pregameid = channel.id;
            server.channels.create("welcome", {type: "text"}).then(channel => {
                channel.setParent(pregameid);
            }).catch(error => {});
            server.channels.create("pregame-chat", {type: "text"}).then(channel => {
                channel.setParent(pregameid);
            }).catch(error => {});
        }).catch(error => {});    //category

        //create information section
        var informationid
        server.channels.create("INFORMATION", {type: "category"}).then(channel => {
            informationid = channel.id;
            server.channels.create("announcements", {type: "text"}).then(channel => {
                channel.setParent(informationid);
            }).catch(error => {});
            server.channels.create("rules", {type: "text"}).then(channel => {
                channel.setParent(informationid);
            }).catch(error => {});
            server.channels.create("questions", {type: "text"}).then(channel => {
                channel.setParent(informationid);
            }).catch(error => {});
        }).catch(error => {});

        //create game section
        var gameid;
        server.channels.create("GAME", {type: "category"}).then(channel => {
            gameid = channel.id;
            server.channels.create("day", {type: "text"}).then(channel => {
                channel.setParent(gameid);
            }).catch(error => {});
            server.channels.create("night", {type: "text"}).then(channel => {
                channel.setParent(gameid);
            }).catch(error => {});
            server.channels.create("player-shoutouts", {type: "text"}).then(channel => {
                channel.setParent(gameid);
            }).catch(error => {});
            server.channels.create("last-wills", {type: "text"}).then(channel => {
                channel.setParent(gameid);
            }).catch(error => {});
            server.channels.create("graveyard", {type: "text"}).then(channel => {
                channel.setParent(gameid);
            }).catch(error => {});
        }).catch(error => {});

        //create off topic section
        var offtopicid;
        server.channels.create("OFF TOPIC", {type: "category"}).then(channel => {
            offtopicid = channel.id;
            server.channels.create("memes", {type: "text"}).then(channel => {
                channel.setParent(offtopicid);
            }).catch(error => {});
        }).catch(error => {});

        //create dead section
        var deadid; //to get the category for easy parenting
        server.channels.create("REALM OF THE DEAD", {type: "category"}).then(channel => {
            channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: false });
            channel.guild.roles.fetch().then(roles => {
                roles.cache.forEach(role => {
                    if(role.name == "Player")
                    {
                        channel.updateOverwrite(role, {VIEW_CHANNEL: false});
                    }
                });
            }).catch(error => {console.log(error)});
            deadid = channel.id;
            server.channels.create("dead-chat", {type: "text"}).then(channel => {
                channel.setParent(deadid);
            }).catch(error => {});
        }).catch(error => {});
    }
}