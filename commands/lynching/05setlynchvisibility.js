const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['setlynchvisibility'],
    description: "(hosts only) (server only) Sets the visibility of lynch votes.",
    usage: "<0/1>",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        if(args.length < 2)
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);
        var newsetting = args[1];

        if(gameid == -1 || newsetting == NaN || newsetting < 0 || newsetting > 1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        lynching.setlynchvisibility(gameid, newsetting);

        return true;
    }
}