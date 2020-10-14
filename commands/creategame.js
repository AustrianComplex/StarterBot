module.exports= {
    name: ['creategame'],
    description: "Creates a new mafia game. Establishes game directory and files.",
    args: true,
    numargs: 2,
    usage: "<name>",
    execute(message, args){
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //get game name and directory name
        const gamename = utilities.getGameName(args, 1, args.length - 1);
        const dir = `./games/${gamename}`;

        //notify console of start of action
        console.log(`\nReceived request to create game ${gamename}.`);

        //check to see if directory (and therefore game name) already exists
        if(fs.existsSync(dir)) {
            const error = ["Conflict in naming game.\n", "a game with that name already exists! Please choose another name."];
            console.log(error[0]);
            message.reply(error[1]);
            return;
        }

        //make new game directory
        fs.mkdir(dir, (err) => {
            if(err)
            {
                const error = [`Error creating game directory for ${gamename}. Error data: ${err}\n`, "an error occured and your game could not be made!"];
                console.log(error[0]);
                message.reply(error[1]);
                return;
            }
        });

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