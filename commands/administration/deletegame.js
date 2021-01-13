const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports= {
    name: ['deletegame'],
    description: "(owner only) Deletes all files related to a game previously created.",
    usage: "<game name>",
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

        //get game id
        var gameid = admin.gameIdFromName(gamename);

        //verify valid game found
        if(gameid == -1)
            return false;

        //verify that sender was game owner
        if(!admin.isOwner(gameid, message.author.id))
            return false;

        //delete game
        admin.deleteGame(gameid)

        return true;
    }
}