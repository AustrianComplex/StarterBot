const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();
const serversetup = require('../../code/serversetup.js');

module.exports = {
    name: ["defaultserver"],
    description: "Converts the current server into a default format for mafia games",
    usage: "",
    execute(message, args)
    {

        //verify in a server channel
        if(message.channel.type == "dm")
            return false;

        //verify server owner
        if(message.author.id != message.channel.guild.owner.id)
            return false;

        //get guild object
        const server = message.channel.guild;

        serversetup.defaultserversetup(server);
    }
}