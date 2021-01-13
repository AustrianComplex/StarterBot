const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ['addhost'],
    description: "(owner only) Add an administrator to a game. Hosts have the same amount of permissions as the owner, except they can't delete the game or add or remove hosts.",
    usage: "<game name>(server optional) <new host's tag>",
    erased: true,
    execute(message, args){

        //retrieve game id and host id using args
        var gameid = getid(message, args);
        var hostid = getnewhost(message, args);
        
        //verify successful values
        if(gameid == -1 || hostid == -1)
            return false;

        //verify owner
        if(!admin.isOwner(gameid, message.author.id))
        {
            return false;
        }

        admin.addHost(gameid, hostid);

        return true;
    }
}

var getid = function(message, args){

    //gameid will hold return value
    var gameid = -1;

    try
    {
        //if name is present, try to obtain
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

        //if name is not present, check the server
        else
        {
            gameid = admin.gameIdFromServerId(message.channel.guild.id);
        }
    }
    //if an error occurs, assume no proper id
    catch(error)
    {
        console.log(error);
        return -1;
    }

    //return gained gameid, which will be -1 if the method used couldn't find it
    return gameid;
}

//get the host id
var getnewhost = function(message, args){

    //host id will be the return value
    var hostid = -1;
    
    //no possible arg
    if(args.length < 2)
        return -1;

    //get host id, if it's invalid, hopefully it returns NaN
    hostid = args[args.length - 1].replace(/[<>&#!@]/g, "");
    
    //return hostid (either valid or -1)
    return hostid;
}