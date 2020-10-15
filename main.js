const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = './';

const fs = require('fs');
 
client.commands = new Discord.Collection();

module.exports= {
    Discord: Discord,
    client: client,
    prefix: prefix
}
 
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
 
    for (let i = 0; i < command.name.length; i++) {
        client.commands.set(command.name[i], command);
    }
}


client.once('ready', () => {
    console.log('BotBoi is online!');
    console.log(commandFiles);
});

client.on('message', message =>{

    // Command responses vvv

    console.log(message.guild);
    console.log(message.guild.id);

    if (message.author.bot) return;

    const args = message.content.split(/ +/);

    const commandName = args[0].toLowerCase();

    // Commands vvv

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    if (command.args && args.length < command.numargs) {
        
        message.reply(`This command requires arguments.\nExample: \`${prefix}${command.name} ${command.usage}\``);
        return;
    }

    try {
        command.execute(message, args);
    } catch (error) {
        if(error instanceof Array)
        {
            console.log(error[0]);
            message.reply(error[1]);
        }
        else
        {
            console.log(error);
            message.reply('there was an error trying to execute that command!');
        }
    }
});

// Keep at bottom vvv

client.login(require('./token.js').token);