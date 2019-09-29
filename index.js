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
//  for playerdata that will be used in an embed which updated every x msec
const playerData = [];

//  for server data, likewise for the above
const serverData = [];

// determines whether the server data has been obtained
let serverDataObtained = false;

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

// this is for static data that won't change after server start
const sinfoHandle = setInterval(() => {

    // this boolean will get set to true once the data has been parsed and is not undefined
    if (serverStatusInfo && !serverDataObtained) {

        // ignore this check because we dont want to use this feature
        if (!serverStatusInfo.status) return;

        // obviously, no channels = no endpoints = no data
        if (!serverStatusInfo || !serverStatusInfo.statusChannels) return;

        // this can be an object or string, if object, we iterate and treat each index differently
        if (typeof serverStatusInfo.statusChannels === 'object') {

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
                    timeout: 4000
                }, (err, _, body) => {
                    if (err) return console.log(err.stack);

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
                    return console.log('serverData[\'%s\'] was undefined, running again...', channel);
                }
                else {
                    // this boolean stops the code execution, it only needs to be run once since the data will not changed
                    serverDataObtained = true;
                }
            }
        }

        // if it is a string, it is a lot easier and can just be a simple:
        //      - get channel from collection, do normal shit for proofing
        else if (typeof serverStatusInfo.statusChannels === 'string') {

            // get channel from collection
            const guildChannel = client.channels.find(ch => ch.id === serverStatusInfo.statusChannels);

            // ensure channel is in collection
            if (guildChannel === null) return console.log('could not find channel (%s) in client\'s collection', serverStatusInfo.statusChannels);

            // channel needs to have a topic so that the IP can be requested
            if (!guildChannel.topic) return console.log('the channel has no topic, no endpoint to request');

            // request for hostname and stuff with timeout of 4000ms to stop hangs
            request.get(`https://servers-live.fivem.net/api/servers/single/${guildChannel.topic}`, {
                timeout: 4000
            }, (err, _, body) => {
                if (err) return console.log(err.stack);

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
            if (serverData[serverStatusInfo.statusChannels] === undefined) {
                return console.log('serverData[\'%s\'] was undefined, running again...', serverStatusInfo.statusChannels);
            }
            else {
                // this boolean stops the code from executing, it only needs to be run once since the data will not be changed
                serverDataObtained = true;
            }
        }
    }
    else {
        // clear interval
        console.log('Interval cleared, this information is static and doesn\'t need to be requested more than once.');
        clearInterval(sinfoHandle);
    }
// minus 10 so it happens before other checks
}, (serverStatusInfo.waitTime || 3000) - 10);

setInterval(() => {

    // obviously we don't want to run this if the feature is disabled
    if (!serverStatusInfo || !serverStatusInfo.status) return;

    // if there are no channels in the array or string, we don't run because it's impossible to
    // know what to do
    if (serverStatusInfo.statusChannels === undefined) return;

    // this is for iterating over the object so all channels get the 'right treatment'
    if (typeof serverStatusInfo.statusChannels === 'object') {

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
                if (err) return console.log(err.stack);

                // /!\ IMPORTANT /!\
                // we must parse the data before we can begin displaying it. if it cannot be
                // parsed, there is something wrong and we need to check it

                // also. this crashes app if it's not caught
                try {
                    playerData[channel] = JSON.parse(body);
                }
                catch(_e) {
                    return console.log(_e.stack);
                }
            });

            // if player data doesn't exist, we can't display in the embed, obviously
            if (playerData[channel] === undefined) return console.log('playerData[\'%s\'] was undefined, running again...', channel);

            // likewise for server data
            if (serverData[channel] === undefined) return console.log('serverData[\'%s\'] was undefined, running again...', channel);

            // this is the format we use toe display players
            // Name | ServerId - Ping: 100ms
            const format = playerData[channel].length > 0 ?
                playerData[channel].map(ply => `${ply.name} | ${ply.id} - Ping: ${ply.ping}`) :
                'No players online.';
            guildChannel.fetchMessages()
                .then(messages => {
                    const statEmbed = new Discord.RichEmbed()
                        .setColor('#7700EF')
                        .setAuthor(serverData[channel].Data.hostname.replace(/\^[0-9]/, ''), 'https://i.imgur.com/qTPd0ql.png')
                        .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss'))
                        .setDescription(format)
                        .setFooter('HighSpeed-Gaming 2019');

                    if (messages.array().length === 0) {
                        guildChannel.send(statEmbed);
                        return console.log('There were no messages in the channel (%s), so I am sending the initial embed now...', channel);
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

                            // create an embed from the current embed and set the description to the updated info
                            const embed = new Discord.RichEmbed(message_.embeds[0])
                                .setDescription(format)
                                .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss'));

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