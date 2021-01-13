const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ["lynchupdatechannels"],
    description: "(hosts only) (server only) Posts a list of lynch update channels.",
    usage: "",
    erased: true,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        var channels = lynching.getupdatechannels(gameid);
        var gamename = admin.getName(gameid);
    
        var reply = `\`\`\`LYNCH UPDATE CHANNELS: ${gamename}\n\n`;
        for(var i = 0; i < channels.length; i++)
        {
            reply += `${channels[i].guild.name}: ${channels[i].name}\n`;
        }
        reply += `\`\`\``;

        message.channel.send(reply);
    }
}