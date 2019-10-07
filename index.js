// dependencies
const Discord = require('discord.js');
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const config = require('./config');
require('dotenv').config({
    path: __dirname + '/.env'
});

// misc and not 100% necessary
const colors = require('colors');
const moment = require('moment');

// utils
const LogsHandler = require('./utils/LogsHandler');
const serverStatusInfo = require('./utils/ServerStatTracking');
// eslint-disable-next-line no-unused-vars
const functions = require('./utils/Functions');
const request = require('request');

// setup and config-y stuff
const prefix = config.prefix || 'p.';
const client = new CommandoClient({
    commandPrefix: prefix,
    owner: '264662751404621825',
    invite: 'https://discord.gg/EqC2wFf',
    unknownCommandResponse: false
});

// variables
/**
 * Contains player data for a specific server
 *
 * @const {array}
 */
const playerData = [];

/**
 * Contains server data for a specific server
 *
 * @const {array}
 */
const serverData = [];

/**
 * Wait time for server data, this does not need to be as frequent as player data
 *
 * @type {number}
 */
let serverQueryTime = 6000;

/**
 * An object that provides long-auth-name, used in server data auto-updater
 */
const HSGAuths = {
    'CR': 'Casual Restricted',
    'CU': 'Casual Unrestricted',
    'M1': 'New Member',
    'M2': 'Member',
    'GS': 'General Staff',
    'A1': 'Junior Administrator',
    'A2': 'Senior Administrator',
    'A3': 'Lead Administrator',
    'DV': 'Developer',
    'CD': 'Chief of Development',
    'DR': 'Director'
};

/**
 * Determines whether the server is offline or not
 *
 * @type {boolean}
 */
let isProbablyOffline = false;

/**
 * Toggles Discord logging
 * @param {boolean} state Set logging state
 */
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
        ['information', 'Commands that provide useful information to the user.'],
        ['admin', 'Commands to help administration give out information and perform their tasks more easily.'],
        ['department', 'Commands that help Field Training Officers.'],
        ['fivem', 'Commands that are related to FiveM.'],
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

// suggestions
client.on('message', async message => {
    if (message.author.bot) return;
    if (config.suggestionChannels === undefined) return;

    for (const channel of config.suggestionChannels) {
        if (channel === message.channel.id) {
            await message.react('👍');
            await message.react('👎');
            break;
        }
    }
});

// this is for dynamic data that won't change often
setInterval(() => {

    // this boolean will get set to true once the data has been parsed and is not undefined
    if (serverStatusInfo) {

        // ignore this check because we dont want to use this feature
        if (!serverStatusInfo.status) return;

        // obviously, no channels = no endpoints = no data
        if (!serverStatusInfo || !serverStatusInfo.statusChannels || typeof serverStatusInfo.statusChannels !== 'object') return;

        // iteration
        for (const channel of serverStatusInfo.statusChannels) {

            // get channel from client's channels collection
            const guildChannel = client.channels.find(ch => ch.id === channel);

            // if channel couldn't be found in collection, return
            if (guildChannel === null) return console.log('foundchannel was null');

            // we use topic for endpoint, we can't request anything if there is no topic/endpoint
            if (!guildChannel.topic) return console.log('the channel had no topic');

            // request for hostname and stuff with timeout of 4000 to stop hangs
            request.get(`https://servers-live.fivem.net/api/servers/single/${guildChannel.topic}`, {
                timeout: 10000
            }, (err, _, body) => {
                if (err) {
                    if (!err.toString().includes('TIMEDOUT')) console.log(err.stack);
                    serverData[channel] = {
                        state: 'offline'
                    };
                }

                // /!\ IMPORTANT /!\
                // we must parse the data before we can begin displaying it. if it cannot be
                // parsed, there is something wrong and we need to check it

                // also, this crashes app if it's not caught
                try {
                    serverData[serverStatusInfo.statusChannels] = JSON.parse(body);
                }
                catch(e) {
                    return console.log(e.stack);
                }
            });

            // run code again if data for this channel (or ip) was not found
            if (serverData[channel] === undefined) {
                console.log('serverData[\'%s\'] was undefined, running again...', channel);
                serverData[channel] = {
                    state: 'offline'
                };
            }
            else {
                // every minute
                serverQueryTime = 60000;
            }
        }
    }
}, serverQueryTime);

setInterval(() => {

    // obviously we don't want to run this if the feature is disabled
    if (!serverStatusInfo || !serverStatusInfo.status) return;

    // if there are no channels in the array or string, we don't run because it's impossible to
    // know what to do
    if (serverStatusInfo.statusChannels === undefined || typeof serverStatusInfo.statusChannels !== 'object') return;

    // iteration
    for (const channel of serverStatusInfo.statusChannels) {

        // get the channel in the client's channels collection
        const guildChannel = client.channels.find(ch => ch.id === channel);

        // if the channel doesn't exist in the collection, we stop the code
        if (guildChannel === null) return console.log('Could not find channel in channels collection (%s)', channel);

        // in order to request data, we use channel topics for the IP and port, if there is no channel topic, there is no request
        // therefore, no code can be run
        if (!guildChannel.topic) return;

        // perform request and get data
        // timeout for 4000ms to prevent it hanging
        request.get(`http://${guildChannel.topic}/players.json`, {
            timeout: 4000
        }, (err, _, body) => {
            if (err) {
                console.log(err.stack);
                playerData[channel] = {
                    state: 'offline'
                };
            }

            // /!\ IMPORTANT /!\
            // we must parse the data before we can begin displaying it. if it cannot be
            // parsed, there is something wrong and we need to check it

            // also. this crashes app if it's not caught
            try {
                playerData[channel] = JSON.parse(body);
            }
            catch(_e) {
                playerData[channel] = {
                    state: 'offline'
                };
            }
        });

        // if player data doesn't exist, we can't display in the embed, obviously
        if (playerData[channel] === undefined) return console.log('playerData[\'%s\'] was undefined, running again...', channel);

        // likewise for server data
        if (serverData[channel] === undefined) return console.log('serverData[\'%s\'] was undefined, running again...', channel);

        // another proof check
        if (serverData[channel].state !== undefined) return;

        // server offline handling
        isProbablyOffline = false;
        if (playerData[channel].state !== undefined) isProbablyOffline = true;

        // this is the format we use toe display players
        // Name | ServerId - Ping: 100ms
        const format = playerData[channel].length > 0 ?
            '`' + playerData[channel].map(ply => `${ply.name}`).join(', ') + '`' :
            'No players online.';

        // this is for authorization and rpz
        let additionalFields;
        const shortAlvl = serverData[channel].Data.gametype.replace('HSG-RP | Authorization ', '');
        if (!isProbablyOffline) {
            additionalFields = [
                {
                    name: 'Authorization',
                    value: HSGAuths[shortAlvl] + ` (${shortAlvl})`
                },
                {
                    name: 'Roleplay Zone',
                    value: serverData[channel].Data.mapname
                }
            ];
        }

        guildChannel.fetchMessages()
            .then(messages => {
                let statEmbed;
                let offlineEmbed;
                if (!isProbablyOffline) {
                    statEmbed = new Discord.RichEmbed()
                        .setColor('#7700EF')
                        .setAuthor('HighSpeed-Gaming', 'https://i.imgur.com/qTPd0ql.png')
                        .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss') + '\n\n' +
                            `Total players: ${playerData[channel].length}/${serverData[channel].Data.vars.sv_maxClients}`)
                        .setDescription(format)
                        .setFooter('HighSpeed-Gaming 2019');

                    statEmbed.fields = additionalFields;
                }
                else {
                    offlineEmbed = new Discord.RichEmbed()
                        .setColor('#7700EF')
                        .setAuthor('HighSpeed-Gaming', 'https://i.imgur.com/qTPd0ql.png')
                        .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'))
                        .setFooter('HighSpeed-Gaming 2019');
                }

                if (messages.array().length === 0) {
                    console.log('There were no messages in the channel (%s), so I am sending the initial embed now...', channel);
                    if (isProbablyOffline) {
                        console.log('I think the server is offline.');
                        return guildChannel.send(offlineEmbed);
                    }

                    return guildChannel.send(statEmbed);
                }

                messages.forEach(message_ => {
                    // if a method is called on a null property, that is big bad!
                    if (message_ === null) return console.log('I found a null message object, running again.');

                    // delete any messages that are not from the bot
                    if (message_.author.id !== client.user.id) { return message_.delete(); }

                    // if the message has embeds, it is owned by the bot and is definitely the server status embed
                    if (message_.embeds.length >= 1) {
                        console.log('I found a message (%s) in the channel (%s) with embeds, editing this message with the updated information.',
                            message_.id,
                            channel
                        );

                        // server offline handling
                        if (isProbablyOffline) {
                            const embed = new Discord.RichEmbed(message_.embeds[0])
                                .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'));

                            embed.fields = null;
                            embed.description = null;

                            return message_.edit(embed);
                        }

                        // create an embed from the current embed and set the description to the updated info
                        const embed = new Discord.RichEmbed(message_.embeds[0])
                            .setDescription(format)
                            .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss') + '\n\n' +
                                `Total players: ${playerData[channel].length}/${serverData[channel].Data.vars.sv_maxClients}`);

                        embed.fields = additionalFields;

                        return message_.edit(embed);
                    }
                    else {
                        message_.delete();
                        console.log('found a message in %s by %s that was not status embed in #%s (%s)',
                            guildChannel.name,
                            message_.author.tag,
                            guildChannel.name,
                            guildChannel.id
                        );
                    }
                });
            });
    }
}, serverStatusInfo.waitTime || 3000);

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