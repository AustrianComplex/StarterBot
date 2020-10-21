module.exports = {
    name: ["createconnection"],
    description: "Create a one-way connection from one channel in a server to another channel in either the same server or another server. Both servers must belong to a game in which you are host.",
    args: true,
    numargs: 2,
    usage: "<start/end>",
    createStartConnection: function(message, gameid)
    {
        const fs = require('fs');
        const client = require('../main.js').client;
        
        //check to see if user has any active start connections
        var connectionrawdata = fs.readFileSync(`./games/${gameid}/connections.txt`)
        var connectiondata = connectionrawdata.toString().split("\n");
        for(var count = 0; count < connectiondata.length; count++)
        {
            //if the user has an active start connection, and the start location can be resolved, notify them and return
            let connectionpiece = connectiondata[count].split("  ");
            if(connectionpiece[1] == message.author.id)
            {
                try{
                    client.channels.fetch(connectionpiece[0]).then(channel => {
                        console.log("Attempt to initiate a connection start when one already exists.");
                        message.reply(`You already have a connection start to end. Connection start: ${channel.guild.name}: ${channel.name}`);
                    });
                }
                catch(error)
                {
                    //if an error occurs, log it, then remove the previous connection start and start over
                    console.log("An error occurred while fetching a channel's connection start. Removing connection...");
                    message.reply("You had a starting connection, but the channel could not be found. Removing connection start and replacing it with the new one...");
                    connectionrawdata = connectionrawdata.toString().replace(`${connectiondata[count]}\n`, "");
                    fs.writeFileSync(`./games/${gameid}/connections.txt`, connectionrawdata);
                    createStartConnection(message, gameid);
                }
                return;
            }
        }

        //user does not have an existing connection start. create one
        var channelid = message.channel.id;
        var userid = message.author.id;

        fs.appendFileSync(`./games/${gameid}/connections.txt`, `${channelid}  ${userid}\n`);

        //notify
        console.log("Connection start successfully created!");
        message.reply("Connection start successfully created!");
    },
    createEndConnection: function(message, gameid)
    {
        const fs = require('fs');
        const client = require('../main.js').client;

        //get user id
        const userid = message.author.id;

        //check to see if the user has any connection starts
        var connectionrawdata = fs.readFileSync(`./games/${gameid}/connections.txt`);
        var connectiondata = connectionrawdata.toString().split("\n");
        for(var count = 0; count < connectiondata.length; count++)
        {
            //found a starting connection
            let connectionpiece = connectiondata[count].split("  ");
            if(connectionpiece[1] == userid)
            {
                //verify start point still exists
                try{
                    client.channels.fetch(connectionpiece[0]).then(channel => {
                        if(channel.id == connectionpiece[0]);
                                //you're good. if this throws an error channel wasn't found
                    });
                }
                catch(error)
                {
                    //if an error occurs, log it, then remove the previous connection start
                    console.log("An error occurred while fetching a channel's connection start. Removing connection...");
                    message.reply("You had a starting connection, but the channel could not be found. Removing connection start.");
                    connectionrawdata = connectionrawdata.toString().replace(`${connectiondata[count]}\n`, "");
                    fs.writeFileSync(`./games/${gameid}/connections.txt`, connectionrawdata);
                    return;
                }
                
                connectionrawdata = connectionrawdata.toString().replace(`${userid}`, `${message.channel.id}`);
                fs.writeFileSync(`./games/${gameid}/connections.txt`, connectionrawdata);
                message.channel.createWebhook(message.channel.name).then(console.log).catch(console.error);

                //notify
                console.log("Connection end completed!");
                message.reply("Connection end completed!");
                return;
            }
        }

        console.log("Attempt to end a connection when no connection exists.");
        message.reply("You do not have a connection start!");
    },
    execute(message, args)
    {
        const fs = require('fs');
        const utilities = require('../utilities.js');
        const client = require('../main.js').client;
        const Discord = require('discord.js');

        //check args length
        if(args.length > 2)
        {
            return;
        }

        //make sure channel is in a server
        if(message.channel instanceof Discord.DMChannel)
        {
            message.reply("Cannot have a link in a DM channel");
            return;
        }

        //get game id
        const gameid = utilities.getGameIdFromServerMap(message.channel.guild.id);

        //verify server part of a game
        if(gameid == -1)
        {
            console.log("Attempt to establish a connection in a server not belonging to a game");
            message.reply("This server is not part of any game.");
            return;
        }

        //get game name
        const gamename = utilities.getGameNameFromId(gameid);

        //verify host of game
        if(!utilities.verifyHost(message, gamename))
        {
            console.log("Attempt to establish a connection in a game by a non-host");
            message.reply("Must be a host to use that command.");
            return;
        }

        //check args for a start or end statement
        if(args[1] != "start" && args[1] != "end")
        {
            console.log("Failed to specify start/end");
            message.reply(`${this.name[0]} ${this.usage}`);
            return;
        }

        //start of connection
        if(args[1] == "start")
            this.createStartConnection(message, gameid);

        //end of connection
        else
            this.createEndConnection(message, gameid);

        return;
    }
}