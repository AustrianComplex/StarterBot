const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['removevote'],
    description: "(hosts only) (server only) Removes the ability to vote from a specific user.",
    usage: "<userid>...",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        if(args.length < 2)
            return false;

        //get game id and role id
        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        //verify game exists
        if(gameid == -1)
            return false;

        //verify host
        if(!admin.isHost(gameid, message.author.id))
            return false;

        //add each role to list
        for(var i = 1; i < args.length; i++)
        {
            var current = args[i].split("><");
            for(var j = 0; j < current.length; j++)
            {
                var targetid = current[j].replace(/[<>&!@]/g, "");
                lynching.addvotingexception(gameid, targetid);
            }
        }

        return true;
    }
}