module.exports = {
    name: ["deleteconnection"],
    description: "Removes a connection for a game by a specified index",
    args: true,
    numargs: 2,
    usage: "<gamename(optional if in server)> <index>",
    execute(message, args)
    {
        const fs = require('fs');
        const utilities = require('../utilities.js');
        const client = require('../main.js').client;
        const Discord = require('discord.js');

        //get game name, game id, and connectionindex
        var gamename = "";
        var gameid = -1;
        var connectionindex = -1;
        if(args.length > 2)
        {
            gamename = utilities.getGameName(args, 1, args.length - 2);
            gameid = utilities.getGameIdFromName(gamename);
            connectionindex = args[args.length - 1];
        }
        else
        {
            //check not being sent from a DMChannel
            if(message.channel instanceof Discord.DMChannel)
            {
                message.reply("Must give game name for that command if not in a server.");
            }
            gameid = utilities.getGameIdFromServerMap(message.channel.guild.id);
            gamename = utilities.getGameNameFromId(gameid);
            connectionindex = args[args.length - 1];
        }

        //check argument validity
        if(gameid == -1)
        {
            console.log("No game exists for the connection to be removed from.");
            message.reply("No game to remove the connection from.");
            return;
        }
        if(!connectionindex.toString().match(/\d+/i))
        {
            console.log("No valid index given");
            message.reply("Please give a valid index number");
            return;
        }

        //check host status
        if(!utilities.verifyHost(message, gamename))
        {
            console.log("Attempt to delete a connection as a non-host");
            message.reply("Must be a host to do that.");
            return;
        }

        //get data
        var connectionrawdata = fs.readFileSync(`./games/${gameid}/connections.txt`).toString();
        var connectiondata = connectionrawdata.split("\n");

        //verify index exists
        if(connectionindex > connectiondata.length)
        {
            console.log("Attempt to delete a connection that doesn't exist.");
            message.reply("There is no connection at that index");
            return;
        }

        //delete entry
        let text = `${connectiondata[connectionindex - 1]}\n`;
        connectionrawdata = connectionrawdata.replace(text, "");
        fs.writeFileSync(`./games/${gameid}/connections.txt`, connectionrawdata);

        //notify
        console.log("Successfully deleted a connection!");
        message.reply("Successfully deleted connection!");

    }
}