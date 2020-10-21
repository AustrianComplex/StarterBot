module.exports = {
    name: ["connections"],
    description: "Prints a list of connections with their indexes",
    args: true,
    numargs: 1,
    usage: "<gamename(optional if in server>",
    execute(message, args)
    {
        const fs = require('fs');
        const utilities = require('../utilities.js');
        const client = require('../main.js').client;
        const Discord = require('discord.js');

        //get gameid and gamename
        var gameid = -1;
        var gamename = "";
        if(args.length > 1)
        {
            gamename = utilities.getGameName(args, 1, args.length - 1);
            gameid = utilities.getGameIdFromName(gamename);
        }
        else
        {
            //verify not in a dmchannel for servermap privileges
            if(message.channel instanceof Discord.DMChannel)
            {
                message.reply("Need game name if you are not in a server belonging to a game.");
                return;
            }
            gameid = utilities.getGameIdFromServerMap(message.channel.guild.id);
            gamename = utilities.getGameNameFromId(gameid);
        }

        //verify data
        if(gameid == -1)
        {
            console.log("No game found for connections.");
            message.reply("Could not find the game you were looking for. Are you in a server belonging to a game?");
            return;
        }

        //verify host status
        if(!utilities.verifyHost(message, gamename))
        {
            console.log("Attempt to access host function as non-host.");
            message.reply("You must be a host to use that command.");
        }

        //get game connection data
        var connectionrawdata = fs.readFileSync(`./games/${gameid}/connections.txt`).toString();
        var connectiondata = connectionrawdata.split("\n");

        //establish variable to hold list
        var connectionlist = "\`\`\`";

        //get connections
        for(var count = 0; count < connectiondata.length - 1; count++)
        {
            //prep for connection
            let connectionpiece = connectiondata[count].split("  ");
            connectionlist += `${count + 1}: `;

            //get connection startpoint
            try{
                let piece = client.channels.cache.get(connectionpiece[0]);
                if(piece.parent != undefined)
                    connectionlist += `${piece.guild.name}/${piece.parent.name}/${piece.name} -> `
                else
                    connectionlist += `${piece.guild.name}/${piece.name} -> `;
            }
            catch(error){console.log(error)}
            
            //get connection endpoint
            try{
                let piece2 = client.channels.cache.get(connectionpiece[1]);
                if(piece2.parent != undefined)
                    connectionlist += `${piece2.guild.name}/${piece2.parent.name}/${piece2.name}\n`;
                else
                    connectionlist += `${piece2.guild.name}/${piece2.name}\n`;
            }
            catch(error){console.log(error)}
        }
        connectionlist += "\`\`\`"
        if(connectionlist.length == 6)
        {
            message.reply("There are no connections for the game at this time.");
        }
        else
        {
            message.reply(`Connections for ${gamename}:\n${connectionlist}`);
        }

        //notify console
        console.log("connections list request complete.");

        //return
        return;
    }
}