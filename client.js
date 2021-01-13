var client;

module.exports = {
    initializeClient()
    {
        var Discord = require('discord.js');
        client = new Discord.Client();
    },
    client()
    {
        return client;
    }
}