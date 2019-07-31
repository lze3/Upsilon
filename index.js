const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const colors = require('colors');

colors.setTheme({
    success: 'green',
    error: 'red',
    warn: 'yellow',
    debug: 'blue'
});

const client = new CommandoClient({
    commandPrefix: '..',
    owner: '595789969965187072',
    invite: ''
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['misc', 'Useless commands that don\'t serve much purpose other than entertainment.'],
        ['moderation', 'Commands to help moderators perform their tasks effectively.']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`.success);

    client.user.setActivity('Rewrite by scandula#7925 using Commando');
});

client.on('error', console.error);

client.login('NTQxMjk2NjMyMjMxMTAwNDM4.XQsZzA.9oe7tvUOORExlX7DWENyqU6qzu0');