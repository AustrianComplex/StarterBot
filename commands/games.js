module.exports= {
    name: ["games"],
    description: "lists all currently managed games",
    args: false,
    numargs: 1,
    usage: "",
    execute(message, args)
    {
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //ignore outside of use case
        if(args.length > 1)
        {
            return;
        }

        //populate the games list
        var gameslist = "";
        const gamedata = fs.readFileSync("gamemap.txt").toString().split(/\n/);
        console.log(gamedata.length);
        for(var count = 0; count < gamedata.length; count++)
        {
            gameslist += `${gamedata[count].split("  ")[0]}\n`;
        }

        //respond with the games list and return
        message.reply(`The following games are being tracked by this bot:\n${gameslist}`);
        return;
    }
}