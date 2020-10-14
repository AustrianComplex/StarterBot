const main = require('./main.js');

module.exports= {
    isUserTag: function (tag) {
        if(tag.match(/<@!?[0-9]+>/))
        {
            return true;
        }
        console.log(`Invalid tag argument.`);
        message.reply(`Needed to enter a user tag.`);
        return false;
    },
    verifyOwner: function (message, gamename, error=true, userid=message.author.id) {
        const fs = require('fs');
        const dir = `./games/${gamename}`;

        //check for owner file
        if(!fs.existsSync(`${dir}/owner.txt`))
        {
            console.log(`Could not access owner file for ${gamename}!\nError data: ${err}\n`);
            message.reply(`could not verify you as the owner of ${gamename}. Contact the bot\'s maintainer about corrupted file data.`);
            return false;
        }

        //get id of true owner
        const data = fs.readFileSync(`${dir}/owner.txt`);

        //if ids don't match return false
        if(data != userid)
        {
            if(error == true)
            {
                console.log(`Illegal owner action of ${gamename}!`);
                message.reply(`you must be the owner of ${gamename} to do that!`);
            }
            return false;
        }

        //owner verified
        return true;
    },
    verifyHost: function (message, gamename, error=true, userid=message.author.id)
    {
        const fs = require('fs');
        const dir = `./games/${gamename}`;

        //check for administrator file
        if(!fs.existsSync(`${dir}/hosts.txt`))
        {
            console.log(`Could not access hosts file for ${gamename}!\nError data: ${err}\n`);
            message.reply(`could not verify you as a host of ${gamename}. Contact the bot\'s maintainer about corrupted file data.`);
            return false;
        }

        //get ids of administrators
        const data = fs.readFileSync(`${dir}/hosts.txt`);

        //get parsed administrator ids
        let administrators = data.toString().split(/\n/);

        //check for admin match
        for(var count = 0; count < administrators.length; count++)
        {
            //valid admin
            if(administrators[count] == userid)
            {
                return true;
            }
        }
        

        //wasn't a valid administrator
        if(error == true)
        {
            console.log(`Illegal host action of ${gamename}!`);
            message.reply(`you must be a host of ${gamename} to do that!`);
        }
        return false;
    },
    verifyGameExists: function (message, gamename)
    {
        const fs = require('fs');
        const dir = `./games/${gamename}`;

        //check for game directory
        if(!fs.existsSync(dir))
        {
            console.log(`Cannot find directory for ${gamename}`);
            message.reply(`Cannot find ${gamename}! Double check your spelling.`);
            return false;
        }

        //game exists
        return true;
    },
    getGameName: function(args, minindex, maxindex)
    {
        var name = args[minindex];
        for(var count = minindex + 1; count <= maxindex; count++)
        {
            name += " ";
            name += args[count];
        }
        return name;
    },
    getRandomInt: function(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },
    getIdFromTag: function(tag)
    {
        return tag.replace(/[<>!@]/g, "");
    },
    awaitconfirmation: function(message,)
    {
        
    }
}