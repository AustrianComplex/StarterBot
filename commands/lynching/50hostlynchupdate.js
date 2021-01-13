const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const lynching = require('../../code/lynchcommands.js');

module.exports = {
    name: ['hostlynchupdate'],
    description: "(hosts only) (server only) Send an update to a host update channel if it exists, or the hosts' dms otherwise.",
    usage: "",
    erased: true,
    execute(message, args)
    {
        if(message.channel.type == "dm")
            return false;

        var gameid = admin.gameIdFromServerId(message.channel.guild.id);

        if(gameid == -1)
            return false;

        if(!admin.isHost(gameid, message.author.id))
            return false;

        var fullvotes = lynching.getFullVotes(gameid);
        
        if(fullvotes == -1)
            return false;

        var voteinformation = `\`\`\`FULL VOTE INFORMATION:\n\n` + lynching.convertVotesToString(fullvotes) + `\`\`\``;

        admin.updateHosts(gameid, voteinformation);

        return true;
    }
}