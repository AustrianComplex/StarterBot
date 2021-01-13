const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ['removehost'],
    description: "(owner only) Removes a host from a game.",
    usage: "<game name>(server optional) <host tag>",
    erased: true,
    execute(message, args){
        //retrieve game id and host id
        var gameid = getgameid(message, args);
        var hostid = gethostid(message, args);

        //verify correct information entered
        if(gameid == -1 || hostid == -1)
            return false;

        //verify owner permissions
        if(!admin.isOwner(gameid, message.author.id))
            return false;

        if(admin.isOwner(gameid, hostid))
            return false;

        //remove the host
        admin.removeHost(gameid, hostid);

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
        if(args.length > 2)
        {
            var gamename = "";
            for(var i = 1; i < (args.length - 2); i++)
            {
                gamename += `${args[i]} `;
            }
            gamename += `${args[args.length - 2]}`;

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

//retrieve host id from args
var gethostid = function(message, args)
{
    var hostid = -1;

    if(args.length < 2)
        return -1;

    hostid = args[args.length - 1].replace(/[<>&!@]/g, "");

    return hostid;
}