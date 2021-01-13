const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['endwithoutlynch'],
    description: "(hosts only) (server only) Ends the current lynch vote as a 'no lynch' immediately.",
    usage: "",
    erased: false,
    execute(message, args)
    {
        //verify server channel
        if(message.channel.type == "dm")
            return false;

        //get game id
        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        lynching.endnolynch(gameid);

        return true;
    }
}