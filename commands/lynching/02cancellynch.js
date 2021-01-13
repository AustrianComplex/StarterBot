const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['cancellynch'],
    description: "(hosts only) (server only) Cancels the lynch in progress.",
    usage: "",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == 'dm')
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        lynching.cancellynch(gameid);

        return true;
    }
}