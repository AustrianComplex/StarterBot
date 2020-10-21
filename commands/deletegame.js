module.exports= {
    name: ['deletegame'],
    description: "Deletes all files related to a game previously created.",
    args: true,
    numargs: 2,
    usage: "<game name>",
    execute(message, args){
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //get game name
        const gamename = utilities.getGameName(args, 1, args.length - 1);

        //get game id
        const gameid = utilities.getGameIdFromName(gamename);

        //get game directory
        const dir = `./games/${gameid}`;

        //log request in console
        console.log(`\nReceived request to delete ${gamename}.`);

        //verify existence of game
        if(!utilities.verifyGameExists(message, gamename))
        {
            return;
        }

        //verify ownership of game
        if(!utilities.verifyOwner(message, gamename))
        {
            return;
        }

        //delete game files
        try{
            fs.rmdirSync(dir, { recursive: true });
        }
        catch(err)
        {
            console.log(`Could not delete game directory for ${gamename}!\nError data: ${err}\n`);
            message.reply("an error occurred while deleting your game!");
            return;
        }

        //delete entry from gamemap
        var hostdata = fs.readFileSync("gamemap.txt");
        hostdata = hostdata.toString().replace(`${gamename}  ${gameid}\n`, "");
        fs.writeFileSync("gamemap.txt", hostdata);

        //delete servers from servermap
        var serverdata = fs.readFileSync("servermap.txt");
        serverdata = hostdata.toString().replace (/\d+/ + `  ${gameid}\n`, "");
        fs.writeFileSync("servermap.txt", serverdata);


        //create message for user
        switch(utilities.getRandomInt(0, 3)){
            case 0: 
                endmessage = "At least it won't be lonely now...";
                break;
            case 1:
                endmessage = "Thank you for recycling your ų̴̯̭̖̃̉̄̀̽́̿͑̅̓́̃͋͋͝S̷̢̧̡̢̡̧̡̨̢̨̥̞͉͍̞͙̜͉̫͉̜̞̠͖̝̲̰̟͍͍̱̭̟̹͙͖͙̖͉͈͈̞͈̝͎̦͓͉̰͎̙̜̩̟̮̖͍̤͉͔̘̬̝͇͍̺͓̠͕͚̼̩̺̹͖̜̲̟͔͇͚̙̞̖͎̟̖̬̼̟̫̩͎͎̥͎͖͓̥̲̮̱͇̠͎̻͙̰̘̻͙̜̳̣͑̊̒̀̇̎͊̌̀͊̈͗̄́̏͊̈́͛̐̓̆̏̏̿̏̿̈͋́̎͋̾̎̓̍̒̎͌͊͌͆̋͊̿͆͛̌̽̂̊̌̈́͊̿͑̾̅̏̎̚̚̚̚͘͘͜͜͜͜͝͝͠ͅé̷̡̢̛̛̤͉̯͎͕̪̦̥͓̗̺͔̟̜̙͇̭̜̳̞̦̹̗̳͚̜̳̬̖͈̰̮̰̻͎̭͕̫̘͚͚̮͈̳͓͙̖̫͈͖̺̰̲͈͎̟͍̳̙̦͓̝͗̄́̈́̾̀̿̒̅͒̑̔͂͐̃͌̔̾͑̏̊̈́̏͒̔͑̓́̓̓̌̉͂̊̋̅́̈́̽͑̈͐̓̄͛͗̽͆̓̎͆̒̐͂̃͑͊̐̿̀̒̎̈́̓͋̒̀͐̔̊́̒̿͗̒̑͛̈̌̈̇͒͘̚͘̚͘̕̕̚͜͜͝͝͠͝͠͝͝͠ͅͅl̶̡̡̛̛̛̛̙̹͓̪̦̮͎͎̠͚͇̎̿̂̍̋̌̇̑̅̒̂̌͂͒͐͂̈́̉̀̈́̄̐̀̇̈́̿͗̓̀̊̆̄̋͐̽̋̀̈́̎̅̓͊͒̌̓̎̎̍̀̈́͌̒̾́͋̔̾̒͗͗͑͗͗͂̔͊̏̐̒̈̐̽̉̓̄͋̃̾̎͆̔̾́̓̍͂̊̇̀͂̊̂̐̀̅̔̋̀͑̔́̋̃̿̃̒̒̈́͗͌́̿͌̇́͆͗̀̋̾̂̌͗̃̾̕̕͘̕͘̚̚͝͝͝͝͝͝͝͝͠͠͝Ę̸̧̡̧̢̧̢̡̧̢̡̨̛̛͎̥̪̥͈̤͇̙̹̣̠̥̠̪̜̟̠̪̯̘͖͚̠̫̯͍̠͖͙̣̪̱̱̘͍̼͙̙̺͓̮͍̣͖̬͓̲̟͉̟̳͔̪̥̪͙̭͚̺̺̪̮͕͕̗͓̗̗̤͚͉͇͖͔̹̘͇̳̗̖̟̰̣̗͙͔̥̖̭̮͚̦̫̜̥̝̪̝̖͎̯̹͚̥̪̰̯͛͋̋͌̋͐͐̀̓̎̆̃̆͋̐̈͑̄̑͛̈́̋̔̂͛͑̀̓͌̑͆̔͐̽̽̅̒̐͆̉̀͗̈́̓̅͛͂̏̌̌̂̇͐̾̈́̑̐̽̍̓͛͊̃͊̿̈́̔͑͌̓͑͆̉̏͂̀̂̐̐͗̇̈́̀͆͒̋̏̈̉̂̓̎̆̊̇̋͊͂̇͒̓̀̄̔͋̉̍̉̍̊͂͑̊̈͒̀͐͋͊̓̔̇́̋͌̔̈́̀͘̕͘͘̕̚̕͜͜͜͜͠͝͝͝͝͝͠͠͝͝͝͠͝͝ͅş̴̢̧̡̢̧̨̡̧̨̡̧̢̧̡̡̢̡̨̬͉̬̬̥̟̩̫̩͖̭͎͉̱̗̳͖̗̪̜̩͇͕̜̜̺͇̯̳͍̬͙̯̲͍͖̰̱̗͇̰̠̲̬͖͎͇̲̦̲̗̝̤̳̪͈̰̝̮̭̼̰͉̳̯̺̥̖͎̙̮͍̲͕̺̞̮͚̖̤̩̻̦̱͕͇͓̣̼͈̝͈̼̰͙̼͓͚̖̜̠̣͍̮̝̭͎̱̖̹̯͎͎̻̥͚̖̝̺̘̘̺̹͍͍̘̗́́̏̏͐̕͘͜ͅͅͅS̵̨̨̢̡̺͈̠̞̻̞̹͖͈͉̹͍̥͓͉̰̩̖̰͓̲̠͚͖̗̰̝̗̥̠̥̪͗̈́̅̾͂͋͗̃͆̍̋̈́̈́͑̐̎̄̈́̀̈́̊͂͆̽̕̚̕͜͠͠ ̸̡̨̡̧̧̢̢̧̧̧̡̛̛̤̘̝̗͓͙̥̬̠͎̻͓͈͎͔̦̮̙͉̬̟͎̪̟͚̱̞̗̳̻̬͚̣̭͇̘̬̰̞̬̜̲̤̙̗̞͙͎̼̘̥̫̞͓͖̟͚̦̜̻̼̞̳̰͍͖̜͙̩͕̜͈̻͎̻̱̩͇͖͚̥͙̯̤͓̲̣̺̰̭̗̣̰̰̤͍͇͇̦͓̲͖͚̰̌̅̾͛͐͐͂̓͌́̈́̍͗͌͐̈́͛̉̍̕͜͜͝͠͝ͅͅͅͅĢ̵̨̡̧̨̨̢̨̛̛̛̪͓̙͕̬͕̤͓̰̯̪̦͚͙̫̹̭͍͍̤̪̳̭̥̣̮͙͕̲̭̣̤̘͎̪̜̙͔͇̮̝̫̹͇̻͔̩͙̩͔̫͎̼͙̖͍̣̮̮̭͍̱͔̺̪̪͙̠͇̦͔̞̖̥̖͙̲̦͖̯̥̼̈̐̏̽͛̿̆͋̍́́̎͂̔̎̋͂̅̉̆͛̑̐͌̐̍͐̔̃́̀́́̒̀̄͐̊̄̌́̿͆͆̈͛̈́̃͋̇͐͊͐̈̐̎̔̒̓̄͛̆̈̑̎̈́̑̂̌͊̈́̐̄͗͐̓́̽̌̑̉̈́̅̾̓́̋̈́̒̇̕͘̕̕̕̚͘͜͜͜͜͝͝͠͝͝͝ͅą̶̡̡̧̢̨̡̢̨̨̨͈̣̟̫͔̻̯̻̜̳̤̹͎͈̩͚̥͔͈̦̬͖̪̗̲͍͕̹̭̻͎̯̪̫̱̺̜͎̩͔̗͕̞̗̻̮̖̥̝̥̮̫̟̣̤̙͓̞̪̹͓̩̳̞͓̱̭̠̫̪̠̼̩̫͕͎͉̘̟̬̤̥̻̼͙͉̫̯̭̘̣͈͎̞͇͓̙̙̘̦̫͎͍̭͓̥͖͙͇̘͉̙̖̠͚̼̼̱̖͈͔͖̱̮̖̕͜͜͜͜ͅͅͅr̸̢̨̢̡̧̨̡̨̧̨̨̡̧̛̛̛̘͔͚̥͕͉̙̘̫̼͎̣̺͕͇͙͇̗̠̦͇͎̲͇͎̙̱̫̭̮̹͈̱͍̺̤̠̮͉̰̞̪̞͍̱̪̯̺̮̬̹̦̰̫̖̭̟̭̟̺̞̘̪̟̥̼͙̗̫̜͔͔͎̱̫͔̞̬͈͉̦͖̣͎̪͉͙̺̪̠͉̫̠̯̖̮̹̻̟̩͎͈̳̜̬̳̗̝̟̳̰̤͎̹̼̜͈̯̱͇̠̺͙̹͙̫̥͔̪̥̬͗̊̆͋͐̍̾͗̒̌̏͋̒͛̑̈́͒͆̏̓͑̋̎̓̐̿̆́͑̀̍̑͑̓͑̇̀̿̀͊́̄̅̒̒̂̀͆̂͌̄̀̅̎̓̏̇̈́̋͆̃̈̃͆͒͊̄̍̀̾̑̽̋͌̀̉̍͑͗̀̾͐̓́̄̂̆̚̕̕̕͜͜͜͜͜͜͠͝͝͠͝͝͠͠͝͠͠ͅB̴̨̧̨̨̢̨̧̡̡̨̢̨̡̨̨̧̛̛̻͉̺̭̝̞̫̫̬͓̘̺̘͕͓͎͚̲̖̘͇̖̖̯̰̜̮̟̮̖̥̱͚̥̰̪̯̤̝͍͓͙̜͖̙̺̲̣͓̩̟̫̙̮͙̣̭͚̬̘͚̝̦͎̭̯̱̗̘̜̺̲̖̠̫͍̣͇̫̖̖̺̪͖͈͕̹̩̘͓̗͕̯̤̞͉̼͔̘͈̼̰̟͚̜͉͕̖̽̏̓͋́̒̇̅͒̇̓̈́̅͒͗́̂͂͆̒̈́̅̐͆͒̀̌̄̑̿̃͆͋̽̎̇̏̏̓̍̓̑̽́̃̇̽́̂́́̇̊̏̔̍͛͋͂͛̾̎͆̔̾͋̋̈́̈́̾̑̄́̃̉́̆͌̋̄̏̉̒̊̋̒̓̂̆͗̅͗͆̽̎̔̋̑̎̄͂̄̏̕̚͘̕̚̚̚̕̚̚̚͜͠͝͝͠͠͝͝͝͠͝͠͝͝ą̴̢̢̨̢̢̧̧̨̨̡̧̧̢̨̨̡̜͍̱̣͖̟̠̺̘͓͈̖̟̖̣̝̭̦͍͍̟͉̩̪̩̘̹̜͖̬̼̮̺͎͓͔̣̳͍̲̣̝͓̭͚̻̣̘̤͔͖̪͈͓͓̥̠̙͍͚̲̤̗̖̙̻̪̤̹͉̜̖̞̣̰̭͔̩͈̩͖͓̺͎̜̦͚̖̰̞̪̩̦̟̳͎͚̜̺̱͍͇̙̦̩̣̳̭̲̭̩̪̞̜̭̤͈͔̹̱̝̈́͌̐̄́͒̏̃̃̐̈́̏̈́͒͛͑͑͒̐͘͜͜͜͜ͅͅg̸̢̧̛̛̛̝͇̝͔̞͎͎̺̫̖̘͒͐̾̓̇̓̒͒͌̑͊͌̔͛̓̋̈́͗̍́̈́̌̀͋̍̔̈́̋̆̓͆̄̎̀̇̈̿̔̉͘̚͝͝͝ͅȨ̶̧̛̛̛͓͈͓͍͎̬̙̖͉̣̩̦̼̝̳̘͇̹̺̘̞̺̱̪̲̝̝̰͉̟̥̲̝̝̗͇̾̽̌̿̉̈̋̉̍̂́̔̎̊̔̊̀͌̒̾͋͗̄̓͊͛̂̉͋̈̈́͗̊͛͑͆̐̂̍̀̀̔͗̀̃̿̔̅̋͐̏͌̋̈́͋͛̍͆͂́́̔̌͋́̿̓̾̽̇́͆̽̃͐͑̈́̅̃̈̆̎͗̀̎̈́͋͒̐͌̀̓̓̋͗́͊͑͛̓͒͂̄̽̃͐̿̽̎̅̋̋͂̉̋͆͋͆̏͆̚͘͘͘̕͘͘͘͜͜͜͜͝͠͠͠͝͝͝͝  assets.";
                break;
            case 2:
                endmessage = "We'll be sad to see it go, but you've got the server evidence! And hopefully a whole lot of corpses!";
                break;
        }

        //notify console and user of success
        console.log(`${gamename} deleted successfully.\n`);
        message.reply(`${gamename} was deleted successfully. ${endmessage}`);
    }
}