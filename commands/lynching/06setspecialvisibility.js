const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['setspecialvisibility'],
    description: "(hosts only) (server only) Sets the visibility level of host-added or special lynch votes. 0 = Invisible, " + 
                 "1 = Number Of Votes Visible, 2 = Votes And Their Targets Visible, 3 = Full Votes Visible.",
    usage: "<0/1/2/3>",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        if(args.length < 2)
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);
        var newsetting = args[1];

        if(gameid == -1 || newsetting == NaN || newsetting < 0 || newsetting > 3)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        lynching.setspecialvisibility(gameid, newsetting);

        return true;
    }
}