module.exports = {
    name: ['hosts'],
    description: "Prints the list of hosts for a game.",
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
        
        //retrieve host ids
        const hostids = fs.readFileSync(`${dir}/hosts.txt`).toString().split(/\n/);

        //host id list
        var hostidlist = "";

        //populate hosts list
        for(var count = 0; count < hostids.length; count++)
        {
            hostidlist += `<@${hostids[count]}>\n`;
        }
        hostidlist[hostidlist.length - 1] = "";

        //output result
        console.log("completed hosts request");
        message.reply(`The hosts for ${gamename} are:\n${hostidlist}`);
    }
}