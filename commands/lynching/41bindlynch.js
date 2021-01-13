const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['bindlynch'],
    description: "(hosts only) (server only) Allows voting in bound channel. Multiple bound channels are permitted.",
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

        lynching.addvotingchannel(gameid, message.channel.id);

        return true;
    }
}