const main = require('./main.js');

module.exports= {
    //gamemap functions
    getGameNameFromId: function(id)
    {
        const fs = require('fs');

        //get gamemap data
        const gamerawdata = fs.readFileSync("gamemap.txt");

        //check each element of the gamemap for a matching id
        const gamedata = gamerawdata.toString().split(/\n/);
        for(var count = 0; count < gamedata.length; count++)
        {
            //split on a double space. names cannot have more than one space in them
            let gameargs = gamedata[count].split("  ");

            //if the game ids match, return the name
            if(gameargs[1] == id)
            {
                return gameargs[0];
            }
        }

        //no game found with that id
        return -1;
    },
    getGameIdFromName: function(gamename)
    {
        const fs = require('fs');

        //get gamemap data
        const gamerawdata = fs.readFileSync("gamemap.txt");

        //check each element of the gamemap for a matching id
        const gamedata = gamerawdata.toString().split(/\n/);
        for(var count = 0; count < gamedata.length; count++)
        {
            //split on a double space. names cannot have more than one space in them
            let gameargs = gamedata[count].split("  ");

            //if the game ids match, return the name
            if(gameargs[0] == gamename)
            {
                return gameargs[1];
            }
        }

        //no game found with that id
        return -1;
    },
    //usertag functions
    isUserTag: function (tag) {
        if(tag.match(/<@!?[0-9]+>/))
        {
            return true;
        }
        console.log(`Invalid tag argument.`);
        message.reply(`Needed to enter a user tag.`);
        return false;
    },
    getIdFromTag: function(tag)
    {
        return tag.replace(/[<>!@]/g, "");
    },
    //verification functions
    verifyOwner: function (message, gamename, error=true, userid=message.author.id) {
        
        const fs = require('fs');

        //get the game id
        let gameid = this.getGameIdFromName(gamename);

        //error getting game
        if(gameid == -1)
        {
            console.log(`No game with name ${gamename}`);
            message.reply(`No game \'${gamename}\' found!`);
        }
        
        //open up the owner.txt for the game
        var ownerdata = fs.readFileSync(`./games/${gameid}/owner.txt`);

        //check if the stored id matches the inputted user id
        if(ownerdata == userid)
        {
            return true;
        }
        if(error == true)
        {
            console.log(`Illegal attempt to access ${gamename} as owner`);
            message.reply(`You are not the owner of ${gamename}`);
        }
        return false;
    },
    verifyHost: function (message, gamename, error=true, userid=message.author.id)
    {
        const fs = require('fs');

        //get the game id
        let gameid = this.getGameIdFromName(gamename);

        //error getting game
        if(gameid == -1)
        {
            console.log(`No game with name ${gamename}`);
            message.reply(`No game \'${gamename}\' found!`);
        }
        
        //open up the hosts.txt for the game and parse the data
        var hostdata = fs.readFileSync(`./games/${gameid}/hosts.txt`).toString().split(/\n/);

        //check if the stored id matches the inputted user id
        for(var count = 0; count < hostdata.length; count++)
        {
            if(hostdata[count] == userid)
            {
                return true;
            }
        }
        if(error == true)
        {
            console.log(`Illegal attempt to access ${gamename} as host`);
            message.reply(`You are not a host of ${gamename}!`);
        }
        return false;
    },
    verifyGameExists: function(message, gamename, error=true)
    {
        const fs = require('fs');

        //if no id is returned
        if(this.getGameIdFromName(gamename) == -1)
        {
            if(error)
            {
                console.log(`No game ${gamename}`);
                message.reply(`No game \'${gamename}\' found!`);
            }
            return false;
        }

        //game id found
        return true;
    },
    //servermap functions
    getGameFromServerMap: function(guildid)
    {
        const fs = require('fs');

        //get servermap info
        const serverrawdata = fs.readFileSync("servermap.txt");

        //check each element for a guild id match
        const serverdata = serverrawdata.split(/\n/);
        for(var count = 0; count < serverdata.length; count++)
        {
            let serverelement = serverdata[count].split("  ");

            //if the guild ids match, return the game it's mapped to
            if(serverelement[0] == guildid)
            {
                return serverelement[1];
            }
        }

        //not a part of a game
        return -1;
    },
    //general utility
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
    }

}