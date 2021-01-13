const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['unbindlynchupdates'],
    description: "(hosts only) (server only) Removes this channel as a place for lynch updates to be posted.",
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

        lynching.removeupdatechannel(gameid, message.channel.id);

        return true;
    }
}