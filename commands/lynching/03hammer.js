const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['hammer'],
    description: "(hosts only) (server only) Ends lynch immediately, lynching a specific target.",
    usage: "<target tag>",
    erased: false,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        if(args.length < 2)
            return false;

        //get and verify game and target
        var gameid = admin.gameIdFromServerId(message.channel.guild.id);
        var targetid = -1;
        var testid = args[1].replace(/[<>&!@]/g, "");
        if(testid != NaN)
            targetid = testid;
        if(gameid == -1 || !lynching.isVotable(gameid, targetid))
            return false;

        //verify host
        if(!admin.isHost(gameid, message.author.id))
            return false;

        //hammer target
        lynching.hammer(gameid, targetid);

        return true;
    }
}