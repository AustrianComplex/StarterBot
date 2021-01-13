const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ["removeserver"],
    description: "(server owner only) Remove the current server from the game it is a part of, if any.",
    usage: "",
    erased: true,
    execute(message, args)
    {
        //get id of game server is a part of
        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        //verify server is part of game
        if(gameid == -1)
            return false;

        //verify owner of server
        if(message.author.id != message.channel.guild.owner.id)
            return false;

        //remove the server
        admin.removeServer(gameid, message.channel.guild.id);

        //return success
        return true;
    }
}