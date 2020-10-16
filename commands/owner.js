module.exports= {
    name: ["owner"],
    description: "Prints the owner of a game",
    args: true,
    numargs: 2,
    usage: "<game name>",
    execute(message, args){
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //get game name
        const gamename = utilities.getGameName(args, 1, args.length - 1);
        const gameid = utilities.getGameIdFromName(gamename);
        const dir = `./games/${gameid}`;

        //verify game exists
        if(!utilities.verifyGameExists(message, gamename))
        {
            return;
        } 
        
        //retrieve owner id
        const ownerid = fs.readFileSync(`${dir}/owner.txt`);

        //get owner tag
        const ownertag = `<@${ownerid}>`

        //output result
        console.log("completed owner request");
        message.reply(`${ownertag} is the owner of ${gamename}`);
    }
}