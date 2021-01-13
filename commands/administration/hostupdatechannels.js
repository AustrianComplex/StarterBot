const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ["hostupdatechannels"],
    description: "(hosts only) Prints a list of host update channels",
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

        var channels = admin.gethostupdatechannels(gameid);
        var gamename = admin.getName(gameid);
        
        var reply = `\`\`\`HOST UPDATE CHANNELS: ${gamename}\n\n`;
        for(var i = 0; i < channels.length; i++)
        {
            reply += `${channels[i].guild.name}: ${channels[i].name}\n`;
        }
        reply += `\`\`\``;

        message.channel.send(reply);
    }
}