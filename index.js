const { CommandoClient } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const path = require('path');
const colors = require('colors');

const logChannels = {
    actions: '610681448436858880'
};

require('dotenv').config({
    path: __dirname + '/.env'
});

const prefix = process.env['Prefix'] || '..';
const client = new CommandoClient({
    commandPrefix: prefix,
    owner: '595789969965187072',
    invite: 'https://discord.gg/B7e72je',
    unknownCommandResponse: false
});

module.exports = {
    backupLogs: false
};

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

client.on('error', console.error);

client.on('warn', console.warn);

client.login(process.env['Bot_Token']);

client.on('messageDelete', message => {
    console.log('messageDelete fired');
    if (!this.backupLogs) return console.log('backupLogs was not enabled though..');

    const delEmbed = new RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setTitle(`**Message sent in ${message.channel} by ${message.author} was deleted**`)
        .setDescription(message.content)
        .setFooter(`ID: ${message.id}`)
        .setTimestamp();

    client.channels.get(logChannels.actions).send(delEmbed);
});