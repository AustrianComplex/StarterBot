const client = require('../client.js').client();
const Discord = require('discord.js');
const fs = require('fs');
const dir = './games'
const admin = require('./administration.js');

/*
GETTERS
*/

//Number[][]
var getconnections = function(gameid)
{
    var returnvalue = [];
    var connections = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString().split("\n");
    for(var i = 0; i < (connections.length - 1); i++)
    {
        var current = connections[i].split("  ");
        returnvalue[i] = [current[0], current[1]]
    }
    return returnvalue;
}

var getnumberofconnections = function(gameid)
{
    var connections = getconnections(gameid);
    return connections.length;
}

//Number
var getinitializedconnection = function(gameid, userid)
{
    var connections = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString().split("\n");
    for(var i = 0; i < (connections.length - 1); i++)
    {
        var current = connections[i].split("  ");
        if(current[1] == userid)
        {
            return current[0];
        }
    }
    return -1;
}

//Number[]
var getdestinationsforchannel = function(gameid, channelid)
{
    var returnvalue = [];
    var connections = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString().split("\n");
    for(var i = 0; i < (connections.length - 1); i++)
    {
        var current = connections[i].split("  ");
        if(current[0] == channelid)
        {
            returnvalue.push(current[1]);
        }
    }
    return returnvalue;
}

//Number[]
var getsourcesforchannel = function(gameid, channelid)
{
    var returnvalue = [];
    var connections = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString().split("\n");
    for(var i = 0; i < (connections.length - 1); i++)
    {
        var current = connections[i].split("  ");
        if(current[1] == channelid)
        {
            returnvalue.push(current[0]);
        }
    }
    return returnvalue;
}

/*
SETTERS
*/

//true/false
var startconnection = function(gameid, userid, channelid)
{
    if(getinitializedconnection(gameid, userid) != -1)
        return false;

    var rawconnectiondata = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString();
    fs.writeFileSync(`${dir}/${gameid}/connections.txt`, `${rawconnectiondata}${channelid}  ${userid}\n`);
    return true;
}

//true/false
var fulfillconnection = function(gameid, userid, channelid)
{
    if(getinitializedconnection(gameid, userid) == -1)
        return false;

    var rawconnectiondata = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString();
    fs.writeFileSync(`${dir}/${gameid}/connections.txt`, rawconnectiondata.replace(`${userid}`, `${channelid}`));
    return true;
}

var addconnection = function(gameid, channelid1, channelid2)
{
    fs.appendFileSync(`${dir}/${gameid}/connections.txt`, `${channelid1}  ${channelid2}\n`);
}

var removeconnectionbyid = function(gameid, channelid1, channelid2)
{
    var rawconnectiondata = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString();
    fs.writeFileSync(`${dir}/${gameid}/connections.txt`, rawconnectiondata.replace(`${channelid1}  ${channelid2}\n`, ""));
}

var removeconnectionbyindex = function(gameid, index)
{
    if(index >= getnumberofconnections(gameid))
        return;

    var rawconnectiondata = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString();
    var connectiondata = rawconnectiondata.split("\n");
    fs.writeFileSync(`${dir}/${gameid}/connections.txt`, rawconnectiondata.replace(`${connectiondata[index]}\n`, ""));
}

var removesourcebyindex = function(gameid, channelid, index)
{
    var sourcedata = getsourcesforchannel(gameid, channelid);

    if(sourcedata.length <= index)
        return;

    var rawconnectiondata = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString();
    fs.writeFileSync(`${dir}/${gameid}/connections.txt`, rawconnectiondata.replace(`${sourcedata[index]}  ${channelid}\n`, ""));
}

var removedestinationbyindex = function(gameid, channelid, index)
{
    var destinationdata = getdestinationsforchannel(gameid, channelid);

    if(destinationdata.length <= index)
        return;

    var rawconnectiondata = fs.readFileSync(`${dir}/${gameid}/connections.txt`).toString();
    fs.writeFileSync(`${dir}/${gameid}/connections.txt`, rawconnectiondata.replace(`${channelid}  ${destinationdata[index]}\n`, ""));
}

/*
SENDERS
*/

//Number[]
var getconnectionsforchannel = function(channelid)
{
    //get channel and check for guild channel
    var rawchannel = client.channels.cache.get(channelid);   
    if(rawchannel.type != "text" && rawchannel.type != "news" && rawchannel.type != "store")
    {
        return [];
    }

    //get guild and check for game in that guild
    var guildid = rawchannel.guild.id;
    var gameid = admin.gameIdFromServerId(guildid);
    if(gameid == -1)
    {
        return [];
    }

    cleanseConnections(gameid);

    //get connections
    var connections = getdestinationsforchannel(gameid, channelid);

    return connections;
}

var sendmessageonchannelsdefaultparams = function(channels, message)
{
    var name;
    if(message.member.nickname == null)
        name = message.member.user.username;
    else
        name = message.member.nickname;
    sendmessageonchannels(channels, message.content, message.member.user.avatarURL(), name);
}

var sendmessageonchannels = function(channels, message, sentavatar=null, sentname=null)
{
    var name = sentname;
    var avatar = sentavatar;

    //if no avatar or name were sent, use the message avatar and sentname
    if(name == null)
        name = client.user.username;
    if(avatar == null)
        avatar = client.user.avatarURL();

    for(var i = 0; i < channels.length; i++)
    {
        try{
            var channel = client.channels.cache.get(channels[i]);
            channel.fetchWebhooks().then(webhooks => {

                //found webhook, send on it
                var webhook = webhooks.first();
                webhook.send(message, { username: name, avatarURL: avatar });
            }).catch(error => {
    
                //no webhook found, create new one
                channel.createWebhook(channel.name).then(console.log).catch(console.error);
    
                //fetch new webhook and send on it
                channel.fetchWebhooks().then(webhooks => {
                    var webhook = webhooks.first();
                    webhook.send(message, { username: name, avatarURL: avatar });
                }).catch(error => {
                    console.error(error);
    
                    //if all else fails, send message plainly
                    channel.send(`${name}: ${message}`);
                });
            });
        }
        catch(error)
        {
            //nothing, should be a user id that slipped past the cleanse so as to not ruin connections that are being made
        }
    }
}

var checkConnections = function(message)
{
    var channels = getconnectionsforchannel(message.channel.id);
    if(channels.length > 0)
    {
        sendmessageonchannelsdefaultparams(channels, message);
    }
}

/*
HELPER FUNCTIONS
*/

var cleanseConnections = function(gameid)
{
    var connectionlist = getconnections(gameid);

    for(var i = 0; i < connectionlist.length; i++)
    {
        try
        {
            var channel1 = client.channels.cache.get(connectionlist[i][0]);
            var channel2 = client.channels.cache.get(connectionlist[i][1]);
            var user2 = client.users.cache.get(connectionlist[i][1]);
            if(channel1 == undefined || (channel2 == undefined && user2 == undefined))
            {
                removeconnectionbyid(gameid, connectionlist[i][0], connectionlist[i][1]);
                console.log(`Removed faulty connection from ${connectionlist[i][0]} to ${connectionlist[i][1]}`);
            }
        }
        catch(error)
        {
            console.log(`Removed faulty connection from ${connectionlist[i][0]} to ${connectionlist[i][1]}`);
            removeconnectionbyid(gameid, connectionlist[i][0], connectionlist[i][1]);
        }
    }
}

module.exports = {
    getconnections: getconnections,
    getinitializedconnection: getinitializedconnection,
    getsourcesforchannel: getsourcesforchannel,
    getdestinationsforchannel: getdestinationsforchannel,
    getnumberofconnections: getnumberofconnections,
    startconnection: startconnection,
    fulfillconnection: fulfillconnection,
    addconnection: addconnection,
    removeconnectionbyid: removeconnectionbyid,
    removeconnectionbyindex: removeconnectionbyindex,
    removesourcebyindex: removesourcebyindex,
    removedestinationbyindex: removedestinationbyindex,
    getconnectionsforchannel: getconnectionsforchannel,
    sendmessageonchannels: sendmessageonchannels,
    sendmessageonchannelsdefaultparams: sendmessageonchannelsdefaultparams,
    cleanseConnections: cleanseConnections,
    checkConnections: checkConnections
}