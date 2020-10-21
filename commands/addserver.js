module.exports = {
    name: ['addserver'],
    description: "Adds a server to a game. Must be owner of both to execute.",
    args: true,
    numargs: 2,
    usage: "<game name>",
    execute(message, args){
        const fs = require('fs');
        const client = require('../main.js').client;
        const utilities = require('../utilities.js');
        const Discord = require('discord.js');

        //get game name and game id
        const gamename = utilities.getGameName(args, 1, args.length - 1);
        const gameid = utilities.getGameIdFromName(gamename);

        //message not sent in server
        if(message.channel instanceof Discord.DMChannel)
        {
            console.log("Server command in non-server channel.");
            message.reply("You must be in a server to use this command.");
            return;
        }

        //check if message sender is owner of game
        if(!utilities.verifyOwner(message, gamename))
        {
            return;
        }

        //check if message sender is owner of server
        if(!utilities.verifyServerOwner(message, message.channel.guild.id))
        {
            return;
        }

        //server already belongs to a game
        if(utilities.getGameIdFromServerMap(message.channel.guild.id) != -1)
        {
            console.log(`Attempt to add server to ${gamename} when it was already in a game.`)
            message.reply("This server is already a member of another game.");
            return;
        }

        //add server to servermap.txt
        fs.appendFileSync("servermap.txt", `${message.channel.guild.id}  ${gameid}\n`);

        //add server to game's server.txt
        fs.appendFileSync(`./games/${gameid}/servers.txt`, `${message.channel.guild.id}\n`);

        //notify about change
        console.log(`Server added to ${gamename}`);
        message.reply(`Successfully added ${message.channel.guild.name} to ${gamename}`);

        return;
    }
}