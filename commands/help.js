module.exports = {
    name: ["help", "commands"],
    description: "Gives a list of all available commands, their description, and their usage.",
    args: false,
    numargs: 1,
    usage: "",
    execute(message, args){
        const fs = require('fs');

        //log request
        console.log("help request");

        //get commandfiles
        const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

        //printed message
        printedmessage = "";

        //add command information
        for(const file of commandFiles){
            const command = require(`./${file}`);

            //get name and alternate names
            var name = command.name[0];
            for(var count = 1; count < command.name.length; count++)
            {
                name += `/${command.name[count]}`;
            }

            //get usage
            var usage = command.usage;

            //get description
            var description = command.description;

            //add to message
            printedmessage += `\`\`${name} ${usage}:\`\`\n${description}\n`;
        }

        //send help
        message.channel.send(printedmessage);
    }
}