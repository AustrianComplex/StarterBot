const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ['bindhostupdates'],
    description: "(hosts only) Adds this channel as one for hosts to receive host updates.",
    usage: "",
    erased: true,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        var gameid = admin.gameIdFromServerId(message.guild.id);

        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        admin.addhostupdatechannel(gameid, message.channel.id);

        return true;
    }
}