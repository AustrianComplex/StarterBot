const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = './';

const fs = require('fs');
const utilities = require('./utilities.js');
 
client.commands = new Discord.Collection();

module.exports= {
    Discord: Discord,
    client: client,
    prefix: prefix
}

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

    //don't listen to bots they sus
    if (message.author.bot) return;

    //check for connections and send message
    let connected = utilities.checkConnections(message);
    if(connected.length != 0)
    {
        for(var count = 0; count < connected.length; count++)
        {
            client.channels.fetch(connected[count]).then(connectedchannel => {
                try{
                    connectedchannel.fetchWebhooks().then(webhooks => {
                        const webhook = webhooks.first();
                        var name = "";
                        if(message.member.nickname == null)
                            name = message.author.username;
                        else
                            name = message.member.nickname.toString();
                        var avatarurl = message.author.avatarURL();
                        webhook.send(message, { username: name, avatarURL: avatarurl });
                    }).catch(console.error);
                }
                catch(error) {
                    console.error('Error trying to send: ', error);
                }
            }).catch(error => {});
        }
    }

    // Command responses vvv

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
        console.log(error);
        message.reply('there was an error trying to execute that command!');
    }
});

// Keep at bottom vvv

client.login(require('./token.js').token);