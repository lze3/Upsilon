const { CommandoClient } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const path = require('path');
const colors = require('colors');
const config = require('./config');
const request = require('request');

const logChannels = config.logChannels;

require('dotenv').config({
    path: __dirname + '/.env'
});

const prefix = config.prefix || 'p.';
const client = new CommandoClient({
    commandPrefix: prefix,
    owner: '595789969965187072',
    invite: 'https://discord.gg/B7e72je',
    unknownCommandResponse: false
});

let serverData;
let playerData;

exports.backupLogs = false;
exports.toggleLogs = function(state) { this.backupLogs = state; };

colors.setTheme({
    success: 'green',
    error: 'red',
    warn: 'yellow',
    debug: 'cyan'
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['misc', 'Miscellaneous commands that don\'t fit in other groups.'],
        ['moderation', 'Commands to help moderators perform their tasks effectively.'],
        ['information', 'Commands that provide useful information to the user.'],
        ['admin', 'Commands to help administration give out information and perform their tasks more easily.'],
        ['department', 'Commands that help Field Training Officers.'],
        ['administration', 'Commands for administration, involves game server <-> Discord.']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        help: false
    })
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`.success);
    console.log(`Prefix is set to: ${prefix}`.debug);

});

// This checks server status every 3000msec
let i = 0;
setInterval(() => {
    if (config.plyCountOnStatus) {
        request.get('http://149.56.241.128:30123/players.json', {
            timeout: 2000
        }, function(pError, _, pBody) {
            if (pError) throw pError;
            try {
                playerData = JSON.parse(pBody);
            }
            catch(err) {
                playerData = {
                    players: 'Invalid JSON.'
                };
                console.log(err.stack);
            }
        });

        if (playerData !== undefined) {
            if (typeof playerData.players !== 'string') {
                if(serverData !== undefined && serverData.vars.sv_maxClients !== undefined) {
                    client.user.setActivity(`Player${playerData.length > 0 ? 's' : ''} online: ${playerData.length}/${serverData.vars.sv_maxClients}`, {
                        type: 'WATCHING'
                    });
                }
            }
        }
        else {
            i++;
            if (i >= 10) {
                client.user.setActivity('Server offline :(', {
                    type: 'WATCHING'
                });
            }
            else {
                client.user.setActivity('Obtaining server information...');
            }
        }
    }
}, 3000);

request.get('http://149.56.241.128:30123/info.json', {
    timeout: 2000
}, function(error, _, body) {
    if (error) throw error;
    try {
        serverData = JSON.parse(body);
    }
    catch(err) {
        serverData = {};
        console.log(err.stack);
    }
});

client.on('error', console.error);

client.on('warn', console.warn);

client.login(process.env['Bot_Token']);

client.on('messageDelete', message => {
    if (!config.logging) return;
    if (!message.guild) return;
    if (message.author.bot) return;

    const delEmbed = new RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setDescription(`**Message sent in ${message.channel} by ${message.author} was deleted**\n` + message.content)
        .setFooter(`ID: ${message.id}`)
        .setColor(config.embedColors.msgDelete)
        .setTimestamp();

    return client.channels.get(logChannels.actions).send(delEmbed);
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (!config.logging) return;
    if (!oldMessage.guild) return;
    if (oldMessage.author.bot) return;

    const editEmbed = new RichEmbed()
        .setAuthor(newMessage.author.tag, newMessage.author.avatarURL)
        .setDescription(`**Message edited in ${newMessage.channel}** | [Go to Message](${newMessage.url})`)
        .addField('Before', oldMessage.content)
        .addField('After', newMessage.content)
        .setColor(config.embedColors.msgEdit)
        .setFooter(`ID: ${newMessage.id}`)
        .setTimestamp();

    return client.channels.get(logChannels.actions).send(editEmbed);
});

client.on('channelCreate', channel => {
    if (!config.logging) return;

    const chCrEmbed = new RichEmbed()
        .setAuthor(channel.client.user.tag, channel.client.user.avatarURL)
        .setDescription(`**Channel created by ${channel.client.user.tag}**`)
        .addField('Name', channel.name)
        .addField('ID', channel.id)
        .setColor(config.embedColors.success)
        .setTimestamp();

    return client.channels.get(logChannels.actions).send(chCrEmbed);
});