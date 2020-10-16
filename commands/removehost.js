module.exports = {
    name: ['removehost'],
    description: "Removes a host from a game",
    args: true,
    numargs: 3,
    usage: "<name> <host tag>",
    execute(message, args){
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //get consts
        const gamename = utilities.getGameName(args, 1, args.length - 2);
        const gameid = utilities.getGameIdFromName(gamename);
        const dir = `./games/${gameid}`;
        const oldadmintag = args[args.length - 1];

        //verify game existence
        if(!utilities.verifyGameExists(message, gamename))
        {
            return;
        }

        //verify owner
        if(!utilities.verifyOwner(message, gamename))
        {
            return;
        }

        //verify host tag and get host id
        if(!utilities.isUserTag(oldadmintag))
        {
            return;
        }

        //get id
        const oldadminid = utilities.getIdFromTag(oldadmintag);

        //verify host status
        if(!utilities.verifyHost(message, gamename, false, oldadminid))
        {
            console.log(`${oldadmintag} is not a host of ${gamename}`);
            message.reply(`${oldadmintag} is not a host of ${gamename}`);
            return;
        }

        //verify non-owner status of admin
        if(oldadminid == message.author.id)
        {
            console.log("Attempt to cancel own host status by owner");
            message.reply("You can't make yourself not a host as owner.");
            return;
        }
        
        //attempt to remove host from file
        try
        {
            var hostdata = fs.readFileSync(`${dir}/hosts.txt`);
            var newhostdata = hostdata.toString().replace(`\n${oldadminid}`, "");
            fs.writeFileSync(`${dir}/hosts.txt`, newhostdata);
        }
        catch(err)
        {
            console.log(`An error occurred while modifying hosts.txt. Error data:\n${err}`);
            message.reply("An error occurred! Please contact bot maintainer.");
            return;
        }

        //notify of success
        console.log(`Successfully deleted ${oldadminid} as a host of ${gamename}`);
        message.reply(`${oldadmintag} was removed from their host position on ${gamename}.`);
        
        return;
    }
}