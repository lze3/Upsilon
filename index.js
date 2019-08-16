const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const colors = require('colors');
const config = require('./config');
const LogsHandler = require('./utils/LogsHandler');
const request = require('request');

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

// Logging System
// Messages
client.on('messageDelete', async message => {
    if (!config.logging) return;
    LogsHandler.messageDelete(message);
});

client.on('messageUpdate', async (newMessage, oldMessage) => {
    if (!config.logging) return;
    LogsHandler.messageUpdate(newMessage, oldMessage);
});

client.on('messageReactionAdd', async (messageReaction, user) => {
    if (!config.logging) return;
    LogsHandler.messageReactionAdd(messageReaction, user);
});

client.on('messageReactionRemove', async (messageReaction, user) => {
    if (!config.logging) return;
    LogsHandler.messageReactionRemove(messageReaction, user);
});

client.on('messageReactionRemoveAll', async message => {
    if (!config.logging) return;
    LogsHandler.messageReactionRemoveAll(message);
});

// Channels
client.on('channelCreate', async channel => {
    if (!config.logging) return;
    LogsHandler.channelCreate(channel);
});

client.on('channelDelete', async channel => {
    if (!config.logging) return;
    LogsHandler.channelDelete(channel);
});

client.on('channelPinsUpdate', async (channel, time) => {
    if (!config.logging) return;
    LogsHandler.channelPinsUpdate(channel, time);
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (!config.logging) return;
    LogsHandler.channelUpdate(oldChannel, newChannel);
});

// Bans
client.on('guildBanAdd', async (guild, user) => {
    if (!config.logging) return;
    LogsHandler.guildBanAdd(guild, user);
});

client.on('guildBanRemove', async (guild, user) => {
    if (!config.logging) return;
    LogsHandler.guildBanRemove(guild, user);
});

// Members
client.on('guildMemberAdd', async member => {
    if (!config.logging) return;
    LogsHandler.guildMemberAdd(member);
});

client.on('guildMemberRemove', async member => {
    if (!config.logging) return;
    LogsHandler.guildMemberRemove(member);
});

// Roles
client.on('roleCreate', async role => {
    if (!config.logging) return;
    LogsHandler.roleCreate(role);
});

client.on('roleDelete', async role => {
    if (!config.logging) return;
    LogsHandler.roleDelete(role);
});

client.on('roleUpdate', async (oldRole, newRole) => {
    if (!config.logging) return;
    LogsHandler.roleUpdate(oldRole, newRole);
});