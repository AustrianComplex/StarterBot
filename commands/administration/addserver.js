const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ['addserver'],
    description: "(hosts only) (server owner only) Adds a server to a game. Must be owner of both to execute.",
    usage: "<game name>",
    erased: true,
    execute(message, args){
        
        //retrieve game id
        var gameid = getgameid(message, args);
        
        //if not a valid game name, return false
        if(gameid == -1)
            return false;

        //verify server channel
        if(message.channel.type == 'dm')
            return false;

        //get server id
        var guildid = message.channel.guild.id;

        //verify server is not already a member of another game
        if(admin.gameIdFromServerId(guildid) != -1)
            return false;

        //verify server owner
        if(message.author.id != message.channel.guild.owner)
            return false;

        //verify game owner
        if(!admin.isHost(gameid, message.author.id))
            return false;

        //add server
        admin.addServer(gameid, guildid);
        
        return true;
    }
}

var getgameid = function(message, args)
{
    var gamename = "";
    for(var i = 1; i < (args.length - 1); i++)
    {
        gamename += `${args[i]} `;
    }
    gamename += `${args[args.length - 1]}`;

    var gameid = admin.gameIdFromName(gamename);

    return gameid;
}