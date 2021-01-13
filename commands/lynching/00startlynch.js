const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['startlynch'],
    description: "(host only) (server only) Starts a lynch. Requires at least one update channel and at least one lynch role.",
    usage:  "<number of votes>",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);
        var votes = -1;
        if(args.length > 1)
        {
            votes = args[1];
        }
        
        if(gameid == -1 || votes == NaN || votes < -1)
            return false;

        return lynching.startlynch(gameid, votes);
    }
}