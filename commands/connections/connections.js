const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const connections = require('../../code/connections.js');

module.exports = {
    name: ["connections"],
    description: "(hosts only) Prints a list of connections with their indexes.",
    usage: "<gamename>(server optional)",
    erased: true,
    execute(message, args)
    {
        //get game id
        var gameid = getgameid(message, args);

        //verify valid game
        if(gameid == -1)
            return false;

        //verify host status
        if(!admin.isHost(gameid, message.author.id))
            return false;

        //clear out faulty connections
        connections.cleanseConnections(gameid);

        //retrieve connection list
        var connectionlist = connections.getconnections(gameid);
        var gamename = admin.getName(gameid);

        //initialize string
        var reply = `\`\`\`CONNECTIONS: ${gamename}\n\n`;

        //for each connection
        for(var i = 0; i < connectionlist.length; i++)
        {
            //retrieve channels
            try{
                var channel1 = client.channels.cache.get(connectionlist[i][0]);
                var channel2 = client.channels.cache.get(connectionlist[i][1]);

                //add to string
                reply += `${i + 1}: ${channel1.guild.name}/${channel1.name} -> ${channel2.guild.name}/${channel2.name}\n`;
            }
            catch(error)
            {
                try{
                    var channel1 = client.channels.cache.get(connectionlist[i][0]);
                    var user = client.users.cache.get(connectionlist[i][1]);

                    //add to string
                    reply += `${i + 1}: ${channel1.guild.name}/${channel1.name} -> Unlinked (${user.username}#${user.discriminator})`;
                }
                catch(err)
                {
                    console.log(err);
                }
            }
        }
        reply += `\`\`\``;

        //send response
        message.channel.send(reply);

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
        //get gameid from name
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
        //get gameid from server
        else
        {
            gameid = admin.gameIdFromServerId(message.channel.guild.id);
        }
    }
    //if error, then assume no valid id
    catch(error)
    {
        console.log(error);
        gameid = -1;
    }

    //return game id or -1 if failed
    return gameid;
}