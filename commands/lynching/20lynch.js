const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['lynch', 'lunch', 'heccinmurder', 'shank', 'gank', 'hang', 'kill', 'stab', 'cutup', 'grape', 'rape', 'murder',
            'sendtohell', 'expire', 'cancellifesubscription', 'execute', 'stringup', 'erase', 'hailmary', 'silence', 'remove',
            'delet', 'delete', 'knife', 'shouldertouch', 'uwu', 'owo', 'yeet', 'nuzzle', 'uwux3nuzzles'],
    description: "(server only) Vote to lynch a player. Lynching must be active to go through.",
    usage: "<user tag>",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);
        var targetid = args[1].replace(/[<>&!@]/g, "");

        if(gameid == -1 || targetid == NaN)
            return false;

        if(!lynching.isboundchannel(gameid, message.channel.id))
            return false;

        if(lynching.lynch(gameid, targetid, message.author.id) == true)
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