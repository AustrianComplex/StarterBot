const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['lynchroles'],
    description: "(hosts only) (server only) Lists the roles of users that are able to be lynched or vote for a lynch.",
    usage: "",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        //get game id and role id
        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        //verify game exists
        if(gameid == -1)
            return false;

        //verify host
        if(!admin.isHost(gameid, message.author.id))
            return false;

        var roles = lynching.getroles(gameid);
        var gamename = admin.getName(gameid);

        var reply = `LYNCH ROLES: ${gamename}\n\n`;
        for(var i = 0; i < roles.length; i++)
        {
            reply += `${roles[i].guild.name}: ${roles[i].name}\n`;
        }
        admin.sendcodemessage(reply, message.channel);
    }
}