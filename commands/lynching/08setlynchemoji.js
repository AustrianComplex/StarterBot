const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['setlynchemoji'],
    description: "(hosts only) (server only) Set the emoji that the bot reacts with on a successful lynch vote.",
    usage: "<emoji>",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        if(args.length < 2)
            return false;

        var emojiid = args[1];

        var emojiargs = args[1].split(":");

        if(emojiargs.length == 3)
            emojiid = emojiargs[2].replace(">", "");

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        try{
            message.guild.emojis.cache.get(args[1]);
        }
        catch(error)
        {
            console.log(error);
            return false;
        }
        
        lynching.setemoji(gameid, emojiid);

        return true;
    }
}