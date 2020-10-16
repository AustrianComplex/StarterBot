module.exports= {
    name: ['addhost'],
    description: "Add an administrator to a game. Hosts have the same amount of permissions as the owner, except they can't delete the game or add or remove hosts.",
    args: true,
    numargs: 3,
    usage: "<game name> <new host's tag>",
    execute(message, args){
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //constants for this function
        const gamename = utilities.getGameName(args, 1, args.length - 2);
        const gameid = utilities.getGameIdFromName(gamename);
        const newadmintag = args[args.length - 1];
        const dir = `./games/${gameid}`;

        //log the request
        console.log(`Addhost request for ${gamename}`)

        //check to see if the game exists
        if(!utilities.verifyGameExists(message, gamename)) 
        {
            return;
        }

        //verify owner
        if(!utilities.verifyOwner(message, gamename))
        {
            return;
        }
        
        //check to see if the admin tag is a valid user tag
        if(!utilities.isUserTag(newadmintag))
        {
            return;
        }

        //strip excess characters from the user tag to get the user id
        const newadminid = utilities.getIdFromTag(newadmintag);

        //check for the existence of the administrators file
        if(utilities.verifyHost(message, gamename, false, newadminid))
        {
            console.log(`Attempt to add host that already exists to ${gamename}`);
            message.reply(`${newadmintag} is already a host of ${gamename}!`);
            return;
        }

        //add user to the end
        try{
            fs.appendFileSync(`${dir}/hosts.txt`, `\n${newadminid}`);
        }
        catch(err)
        {
            console.log(`Error occurred while adding host to ${dir}/hosts.txt. Error data: ${err}\n`);
            message.reply("an error occurred in fulfilling your request.");
            return;
        }

        //notify console and user of success
        console.log(`Successfully added ${newadminid} as a host for ${gamename}!\n`);
        message.reply(`${newadmintag} was successfully added to ${gamename} as a host!`);
    }
}