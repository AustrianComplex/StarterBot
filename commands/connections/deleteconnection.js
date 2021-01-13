const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const connections = require('../../code/connections.js');

module.exports = {
    name: ["deleteconnection"],
    description: "(hosts only) Removes a connection for a game by a specified index.",
    usage: "<game name> <index>",
    erased: true,
    execute(message, args)
    {
        //get gameid and index
        var gameid = getgameid(message, args);
        var index = getindex(message, args);

        //verify gameid and index are valid
        if(gameid == -1 || index == -1)
            return false;

        //verify host permissions
        if(!admin.isHost(gameid, message.author.id))
            return false;

        //remove connection
        connections.removeconnectionbyindex(gameid, index);

        //return success
        return true;
    }
}

var getgameid = function(message, args)
{
    var gameid = -1;

    try
    {
        //get by name
        if(args.length > 2)
        {
            var gamename = "";
            for(var i = 1; i < (args.length - 2); i++)
            {
                gamename += `${args[i]} `;
            }
            gamename += `${args[i]}`;

            gameid = admin.gameIdFromName(gamename);
        }
        //get by server
        else
        {
            gameid = admin.gameIdFromServerId(message.channel.guild.id);
        }
    }
    //if error, assume invalid game
    catch(error)
    {
        console.log(error);
        gameid = -1;
    }

    //returns game id on success and -1 on failed
    return gameid;
}

var getindex = function(message, args)
{
    //index will hold return value
    var index = -1;
    
    //get index
    var testindex = args[args.length - 1];

    //verify a valid number was entered
    if(testindex != NaN && testindex > 0)
        index = testindex;

    //return index or -1 on failure. -1 adjustment is for 1 based index conversion to 0 based index
    return (index - 1);
}