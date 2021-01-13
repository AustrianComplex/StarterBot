const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ['servers'],
    description: "(hosts only) Prints a list of all the servers that are a part of a game.",
    usage: "<gamename>(server optional)",
    erased: true,
    execute(message, args)
    {
        var gameid = getgameid(message, args);
        
        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        var gamename = admin.getName(gameid);

        var reply = `\`\`\`SERVERS: ${gamename}\n\n`;

        var serverids = admin.getServers(gameid);
        for(var i = 0; i < serverids.length; i++)
        {
            try{
                var server = client.guilds.cache.get(serverids[i]);
                reply += `${server.name} / ${server.owner.user.username}#${server.owner.user.discriminator}\n`;
            }
            catch(error)
            {
                console.log(error);
            }
        }
        reply += `\`\`\``;

        message.channel.send(reply);

        return true;
    }
}

//get the game id
var getgameid = function(message, args)
{
    //game id to be returned
    var gameid = -1;

    try
    {
        //look for gameid by name
        if(args.length > 1)
        {
            var gamename = "";
            for(var i = 1; i < (args.length - 1); i++)
            {
                gamename += `${args[i]} `;
            }
            gamename += `${args[args.length - 1]}`;

            gameid = admin.gameIdFromName(gamename);
        }

        //look for gameid by server
        else
        {
            gameid = admin.gameIdFromServerId(message.channel.guild.id);
        }
    }

    //if it fails, assume no id found
    catch(error)
    {
        console.log(error);
        gameid = -1;
    }

    //return found id or -1 for failure
    return gameid;
}