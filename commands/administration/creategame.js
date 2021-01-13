const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports= {
    name: ['creategame'],
    description: "Creates a new mafia game. Establishes game directory and files.",
    usage: "<name>",
    erased: false,
    execute(message, args){
        if(args.length < 2)
            return false;

        var gamename = "";
        for(var i = 1; i < (args.length - 1); i++)
        {
            gamename += `${args[i]} `;
        }
        gamename += `${args[args.length - 1]}`;

        if(admin.gameIdFromName(gamename) != -1)
            return false;

        admin.createGame(gamename, message.author.id);

        return true;
    }
}