const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const connections = require('../../code/connections.js');

module.exports = {
    name: ["createconnection"],
    description: "(hosts only) Create a one-way connection from one channel in a server to another channel in either the same server or another server. Both servers must belong to a game in which you are host.",
    usage: "<start/end> <channel tag>(server optional)",
    erased: true,
    execute(message, args)
    {
        //verify arg length is correct
        if(args.length < 2)
            return false;

        //get game id and channelid
        var gameid = getgameid(message, args);
        var channelid = getchannelid(message, args);

        if(gameid == -1 || channelid == -1)
            return false;

        //verify host status
        if(!admin.isHost(gameid, message.author.id))
            return false;

        //determine whether starting or ending connection and do it
        switch(getargcode(message, args))
        {
            case 0:
                return createconnectionstart(gameid, channelid, message.author.id);
            case 1:
                return createconnectionend(gameid, channelid, message.author.id);
            default:
                return false;
        }
    }
}

var createconnectionstart = function(gameid, channelid, userid)
{
    if(connections.getinitializedconnection(gameid, userid) != -1)
        return false;

    connections.startconnection(gameid, userid, channelid);

    return true;
}

var createconnectionend = function(gameid, channelid, userid)
{
    if(connections.getinitializedconnection(gameid, userid) == -1)
        return false;

    connections.fulfillconnection(gameid, userid, channelid);

    return true;
}

var getgameid = function(message, args)
{
    //gameid will hold return value
    var gameid = -1;

    //get gameid
    try
    {
        gameid = admin.gameIdFromServerId(message.channel.guild.id);
    }
    catch(error)
    {
        gameid = -1;
    }

    return gameid;
}

//get channel id for connection
var getchannelid = function(message, args)
{
    if(args.length > 2)
    {
        var testid = args[2].replace(/[<>&!#]/, "");
        try{
            var channel = client.channels.cache.get(testid);
            if(channel.type == "dm")
                return -1;
        }
        catch(error)
        {
            return -1;
        }
        return testid;
    }
    return message.channel.id;
}

//returns 0 for start, 1 for end, -1 for error
var getargcode = function(message, args)
{
    if(args[1] == "start")
        return 0;

    if(args[1] == "end")
        return 1;

    return -1;
}