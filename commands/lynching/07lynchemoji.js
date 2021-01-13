const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['lynchemoji'],
    description: "(hosts only) (server only) Prints the emoji the bot reacts to successful lynch votes with.",
    usage: "",
    erased: true,
    execute(message, args)
    {
        if(message.channel.type == "type")
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        var emoji = lynching.getemoji(gameid);

        message.channel.send(emoji);
    }
}