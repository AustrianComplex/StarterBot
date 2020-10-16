module.exports= {
    name: ['creategame'],
    description: "Creates a new mafia game. Establishes game directory and files.",
    args: true,
    numargs: 2,
    usage: "<name>",
    execute(message, args){
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //get game name
        const gamename = utilities.getGameName(args, 1, args.length - 1);

        //notify console of start of action
        console.log(`\nReceived request to create game ${gamename}.`);

        //check to see if the game already exists
        if(utilities.verifyGameExists(message, gamename, false))
        {
            console.log("Conflict in naming game.");
            message.reply("a game with that name already exists!");
            return;
        }

        //create a new game id
        var gameid = utilities.getRandomInt(0, 99999999);
        while(utilities.getGameNameFromId(gameid) != -1)
        {
            gameid = utilities.getRandomInt(0, 99999999);
        }

        //map to gamemap.txt
        fs.appendFileSync("gamemap.txt", `${gamename}  ${gameid}\n`);

        //create directory
        const dir = `./games/${gameid}`

        //make new game directory
        fs.mkdir(dir, (err) => {
            if(err)
            {
                console.log(`Error creating game directory for ${gamename}. Error data: ${err}`);
                message.reply("An error occured and your game could not be made!");
                return;
            }
        });

        //create name file
        fs.writeFileSync(dir + '/name.txt', `${gamename}`);
        console.log(`Name file for ${gamename} created successfully!`);

        //create owner file
        fs.writeFileSync(dir + '/owner.txt', `${message.author.id}`);
        console.log(`Owner file for ${gamename} created successfully!`);

        //create administrators file initialized with just the creator
        fs.writeFileSync(dir + '/hosts.txt', `${message.author.id}`);
        console.log(`Host file for ${gamename} created successfully!`);

        //create server list
        fs.writeFileSync(dir + '/servers.txt', '');
        console.log(`Server file for ${gamename} created successfully!`);

        //create player list
        fs.writeFileSync(dir + '/players.txt', '');
        console.log(`Players file for ${gamename} created successfully!`);

        //create observer list
        fs.writeFileSync(dir + '/observers.txt', '');
        console.log(`Observers file for ${gamename} created successfully!`);

        //notify console and user of success
        console.log(`${gamename} was created successfully!\n`);
        message.reply(`${gamename} was created successfully!`);
    }
}