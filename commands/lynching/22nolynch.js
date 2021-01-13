const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['nolynch'],
    description: "(server only) Vote for no one to be lynched.",
    usage: "",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        if(gameid == -1)
            return false;

        if(!lynching.isboundchannel(gameid, message.channel.id))
            return false;

        if(lynching.nolynch(gameid, message.author.id) == true)
        {
            var emoji = lynching.getemoji(gameid);
            try{
                message.react(emoji);
            }
            catch(error)
            {
                try{
                    emoji = message.guild.emojis.cache.get(emojistr);
                    message.react(emoji);
                }
                catch(err)
                {
                    message.react("😎");
                }
            }
        }

        return true;
    }
}