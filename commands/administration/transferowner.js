const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports = {
    name: ['transferowner'],
    description: "(owner only) Transfers ownership of a game over to another person.",
    usage: "<game name>(server optional) <user tag>",
    erased: true,
    execute(message, args){
        var gameid = getgameid(message, args);
        var userid = getuserid(message, args);

        //verify there's valid arguments
        if(gameid == -1 || userid == -1)
            return false;

        //verify owner status
        if(!admin.isOwner(gameid, message.author.id))
            return false;

        //transfer owner
        admin.transferOwner(gameid, userid);

        //return success
        return true;
    }
}

var getgameid = function(message, args)
{
    //gameid will hold return value
    var gameid = -1;

    try
    {
        //get id from name
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
        //get id from server
        else
        {
            gameid = admin.gameIdFromServerId(message.channel.guild.id);
        }
    }
    //if error, assume no valid game
    catch(error)
    {
        console.log(error);
        gameid = -1;
    }

    //return gameid or -1 if it fails
    return gameid;
}

var getuserid = function(message, args)
{
    //userid will hold return value
    var userid = -1;

    //get host id
    userid = args[args.length - 1].replace(/[<>&!@]/g, "");

    //returns new id or -1 if fails
    return userid;
}