module.exports = {
    name: ["removeserver"],
    description: "Remove the current server from the game it is a part of, if any",
    args: false,
    numargs: 1,
    usage: "",
    execute(message, args)
    {
        const fs = require('fs');
        const utilities = require('../utilities.js');
        const client = require('../main.js').client;
        const Discord = require('discord.js');

        //only accept the standalone command
        if(args.length > 1)
        {
            return;
        }

        //check for proper channel type
        if(message.channel instanceof Discord.DMChannel)
        {
            message.reply("Must be in a server to use this command.");
            return;
        }

        //check for server ownership
        if(!utilities.verifyServerOwner(message, message.channel.guild.id))
        {
            return;
        }

        //get gameid
        const gameid = utilities.getGameIdFromServerMap(message.channel.guild.id);

        //check for existence in a game
        if(gameid == -1)
        {
            message.reply("This server is not part of any game.");
            return;
        }

        //remove from server.txt
        const serverdata = fs.readFileSync(`./games/${gameid}/servers.txt`);
        fs.writeFileSync(`./games/${gameid}/servers.txt`, serverdata.toString().replace(`${message.channel.guild.id}\n`, ""));

        //remove from servermap
        const servermapdata = fs.readFileSync("servermap.txt");
        fs.writeFileSync("servermap.txt", servermapdata.toString().replace(`${message.channel.guild.id}  ${gameid}\n`, ""));

        //notify of success
        const gamename = utilities.getGameNameFromId(gameid);
        console.log(`Successfully removed ${message.channel.guild.name} from ${gamename}!`);
        message.reply(`Successfully removed ${message.channel.guild.name} from ${gamename}!`);

        return;

    }
}