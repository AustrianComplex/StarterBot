const fs = require('fs');
const Discord = require('discord.js');
const admin = require('../../code/administration.js');
const client = require('../../client.js').client();

module.exports= {
    name: ["owner"],
    description: "Prints the owner of a game.",
    usage: "<game name(optional if in server)>",
    erased: true,
    execute(message, args){
        //fetch the game id
        var gameid = getgameid(message, args);

        //verify game id
        if(gameid == -1)
            return false;

        //retrieve the id of the owner
        var ownerid = admin.getOwner(gameid);
        var gamename = admin.getName(gameid);

        //retrieve the owner
        var owner = client.users.cache.get(ownerid);

        //push owner information into reply string
        var ownerstr = `\`\`\`\nOWNER: ${gamename}\n\n${owner.username}#${owner.discriminator}\`\`\``;

        //send reply
        message.channel.send(ownerstr);

        //return success
        return true;
    }
}

//get the game id
var getgameid = function(message, args)
{
    //game id to be returned
    var gameid = -1;

    try
    {
        //look for gameid by name
        if(args.length > 1)
        {
            var gamename = "";
            for(var i = 1; i < (args.length - 1); i++)
            {
                gamename += `${args[i]} `;
            }
            gamename += `${args[args.length - 1]}`;

            gameid = admin.gameIdFromName(gamename);
        }

        //look for gameid by server
        else
        {
            gameid = admin.gameIdFromServerId(message.channel.guild.id);
        }
    }

    //if it fails, assume no id found
    catch(error)
    {
        console.log(error);
        gameid = -1;
    }

    //return found id or -1 for failure
    return gameid;
}