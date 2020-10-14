module.exports= {
    name: ["games"],
    description: "lists all currently managed games",
    args: false,
    numargs: 1,
    usage: "",
    execute(message, args)
    {
        const fs = require('fs');
        const utilities = require('../utilities.js');

        //ignore outside of use case
        if(args.length > 1)
        {
            return;
        }

        const dir = "./games";

        //read games directory
        fs.readdir(dir, (err, files) => {
            if(err) {
                console.log(`An error occurred while trying to access the games directory. Error data:\n${err}`)
                message.reply("An error occurred while fetching the games list!");
            }

            var filenames = "";
            files.forEach(file => {
                filenames += `${file}\n`;
            })
            message.reply(`This is the list of current game names:\n${filenames}`);
        });

        return;
    }
}