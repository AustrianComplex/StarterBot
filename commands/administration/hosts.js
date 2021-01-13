const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ['hosts'],
    description: "Prints the list of hosts for a game.",
    usage: "<game name>(server optional)",
    erased: true,
    execute(message, args){

        //retrieve game id
        var gameid = getgameid(message, args);

        //verify found game id
        if(gameid == -1)
            return false;
        
        //retrieve hosts
        var hosts = admin.getHosts(gameid);
        var gamename = admin.getName(gameid);
        
        //add host data to string
        var hoststr = `\`\`\`\nHOSTS: ${gamename}\n\n`;
        for(var i = 0; i < hosts.length; i++)
        {
            var user = client.users.cache.get(hosts[i]);
            hoststr += `${user.username}#${user.discriminator}\n`;
        }
        hoststr += `\`\`\``;

        //print host data
        message.channel.send(hoststr);

        //return success
        return true;
    }
}

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