const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['votecount'],
    description: "(server only) Prints the current vote count, adhering to visibility rules.",
    usage: "",
    erased: true,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        if(gameid == -1)
            return false;

        var votingcount = lynching.getvotes(gameid);

        if(votingcount == -1)
            return false;

        var votinginformation = `\`\`\`Votes:\n\n` + lynching.convertVotesToString(votingcount) + `\`\`\``;

        message.channel.send(votinginformation);

    }
}