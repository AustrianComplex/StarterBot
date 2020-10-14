module.exports= {
    name: ["owner"],
    description: "Prints the owner of a game",
    args: true,
    numargs: 2,
    usage: "<game name>",
    execute(message, args){
        const fs = require('fs');
        const utilities = require('../utilities.js');
        const client = require('../main.js');

        //get game name
        const gamename = utilities.getGameName(args, 1, args.length - 1);
        const dir = `./games/${gamename}`;

        //verify game exists
        if(!utilities.verifyGameExists(message, gamename))
        {
            return;
        }
        
        //verify owner.txt exists
        if(!fs.existsSync(`${dir}/owner.txt`))
        {
            console.log(`owner.txt for ${gamename} not found`);
            message.reply("an error occurred. Please contact bot maintainer");
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