const Discord = require('discord.js');

const clientfile = require('./client.js');
clientfile.initializeClient();
const client = clientfile.client();

const prefix = './';

const fs = require('fs');

const admin = require('./code/administration.js');
const connections = require('./code/connections.js');
const lynching = require('./code/lynchcommands.js');
const serversetup = require('./code/serversetup.js');
var secrets = null;
try{
    secrets = require('./code/secrets.js');
}
catch(err)
{
    console.log("No secrets.js file found");
}
 
client.commands = new Discord.Collection();

//if there is no gamemap.txt file, make one
if(!fs.existsSync("gamemap.txt"))
{
    fs.writeFileSync("gamemap.txt", "");
}

//if there is no servermap.txt file, make one
if(!fs.existsSync("servermap.txt"))
{
    fs.writeFileSync("servermap.txt", "");
}

const commandCategories = fs.readdirSync('./commands/');
var commandFiles = [];
for(var directory of commandCategories)
{
    var currentcommandFiles = fs.readdirSync(`./commands/${directory}`).filter(file => file.endsWith('.js'));

    for(var file of currentcommandFiles){
        const command = require(`./commands/${directory}/${file}`);
        commandFiles.push([command.name[0]]);
        for(let i = 0; i < command.name.length; i++){
            client.commands.set(command.name[i], command);
        }
    }
}

client.once('ready', () => {
    console.log('BotBoi is online!');
    console.log(commandFiles);
});

client.on('message', message =>{

    //don't listen to bots they sus
    if (message.author.bot) return;

    //check secrets
    try{ secrets.checkSecrets(message); }
    catch(error)
    { console.log('secrets error'); }

    //check for connections and send message

    try{ connections.checkConnections(message); }
    catch(error)
    { console.log('connections error'); }

    // Command responses vvv

    //check for prefix match
    if(message.content.length < prefix.length || message.content.substring(0, prefix.length) != prefix)
        return;

    //get arguments for command
    const args = message.content.split(/ +/);

    //get name of command
    const commandName = args[0].toLowerCase().slice(prefix.length);



    // Commands vvv

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        var returnvalue = command.execute(message, args);
        if(returnvalue == false)
        {
            message.channel.send(`Your execution of the command failed. Make sure you spelled everything correctly` +
                                ` and that you are in an appropriate channel\n` +
                                `${command.name[0]} ${command.usage}: ${command.description}`);
        }
        if(command.erased == true)
        {
            try{
                message.delete();
            }
            catch(err)
            {
                console.log(err);
            }
        }
    } catch (error) {
        console.log(error);
        message.reply('there was an error trying to execute that command!');
    }
});

// Keep at bottom vvv

client.login(require('./token.js').token);

module.exports= {
    prefix: prefix
}