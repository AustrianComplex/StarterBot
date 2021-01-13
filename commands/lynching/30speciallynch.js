const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['speciallynch', 'specialynch'],
    description: "(hosts only) (server only) Add a lynch vote onto a target that isn't counted as a normal lynch vote.",
    usage: "<target id>",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);
        var targetid = args[1].replace(/[<>&!@]/g, "");

        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        lynching.speciallynch(gameid, targetid);

        return true;
    }
}