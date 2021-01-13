const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports= {
    name: ["games"],
    description: "Lists all currently managed games.",
    usage: "",
    erased: true,
    execute(message, args)
    {
        var names = admin.getGameNames();
        var ids = admin.getGameIds();

        var printstring = "\`\`\`Games List:\n";
        for(var i = 0; i < names.length; i++)
        {
            printstring += `${names[i]} (${ids[i]})\n`;
        }
        printstring += "\`\`\`";
        
        message.channel.send(printstring);

        return true;
    }
}