module.exports = {
    name: ['transferowner'],
    description: "Transfers ownership of a game over to another person",
    args: true,
    numargs: 3,
    usage: "<game name> <user tag>",
    execute(message, args){
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //get game name
        const gamename = utilities.getGameName(args, 1, args.length - 2);
        const gameid = utilities.getGameIdFromName(gamename);
        const dir = `./games/${gameid}`;

        //verify game exists
        if(!utilities.verifyGameExists(message, gamename))
        {
            return;
        }

        //verify owner status of sender
        if(!utilities.verifyOwner(message, gamename))
        {
            return;
        }

        //get new owner's id from args and verify
        const newownertag = args[args.length - 1];
        if(!utilities.isUserTag(newownertag))
        {
            console.log('invalid user tag');
            message.reply("Enter a valid person to transfer ownership to");
            return;
        }
        const newownerid = utilities.getIdFromTag(newownertag);

        //write new owner into file
        fs.writeFileSync(`${dir}/owner.txt`, newownerid);

        //if not a host, append new owner to host file
        if(!utilities.verifyHost(message, gamename, false, newownerid))
        {
            fs.appendFileSync(`${dir}/hosts.txt`, `${newownerid}\n`);
        }

        //send confirmation
        console.log(`Ownership of ${gamename} transferred to ${newownerid}.`);
        message.reply(`You have transferred ownership of ${gamename} to ${newownertag}`);

        return;
    }
}