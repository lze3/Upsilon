const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const colors = require('colors');
const config = require('./config');
const LogsHandler = require('./utils/LogsHandler');
const request = require('request');
const serverStatusInfo = require('./utils/ServerStatTracking');
const Discord = require('discord.js');
const moment = require('moment');
const functions = require('./utils/Functions');

require('dotenv').config({
    path: __dirname + '/.env'
});

const prefix = config.prefix || 'p.';
const client = new CommandoClient({
    commandPrefix: prefix,
    owner: '264662751404621825',
    invite: 'https://discord.gg/EqC2wFf',
    unknownCommandResponse: false
});

let playerData;
let serverData;

exports.backupLogs = false;

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

/* eslint-disable no-unused-vars */

/**
 * Debug stuff
 * @param {string} text
 */
const debugPrint = function(text) {
    client.channels.find(channel => channel.id === '605434026865590278').send(text);
};

/* eslint-enable no-unused-vars */

// let sent = false;
// let sentMessage;
/*
setInterval(() => {
    if (serverStatusInfo && serverStatusInfo.statusChannels) {
        console.log('ok, serverstatinfo is not null or whatever');
        if (typeof serverStatusInfo.statusChannels === 'object') {
            console.log('is an object too');
            for (const channel of serverStatusInfo.statusChannels) {
                console.log(channel);
                const foundChannel = client.channels.find(ch => ch.id === channel);
                if (foundChannel === null) break;
                if (foundChannel.topic !== undefined) {
                    try {
                        request.get(`http://${foundChannel.topic}/players.json`, (err, response, body) => {
                            if (err) return consoled.log(err.stack);
                            console.log(foundChannedl.topic);

                            try {d
                                playerData = JSON.parse(body);
                            }
                            catch(e) {
                                return console.log(e.stack);
                            }
                        });

                        if (playerData !== undefined) {
                            const format = playerData.map(ply => `${ply.name} | ${ply.id} - Ping: ${ply.ping}`);
                            if (!sent) {
                                const embed = new Discord.RichEmbed()
                                    .setColor('#7700EF')
                                    .setAuthor('HighSpeed-Gaming', 'https://i.imgur.com/qTPd0ql.png')
                                    .setTitle('Here is the updated server status, last updated @ ' + Date.now())
                                    .setDescription(format);
                                foundChannel.send(embed)
                                    .then(msg => sentMessage = msg);
                            }
                            else {
                                const embed = new Discord.RichEmbed(sentMessage.embeds[0]).setDescription(format);
                                sentMessage.edit(embed);
                            }
                            sent = true;
                        }
                        else {
                            return console.log('playerData was undefined, uh oh! this is bad');
                        }
                    }
                    catch(error) {
                        return console.log(error.stack);
                    }
                }
            }
        }
    }
    console.log('Waiting %s', serverStatusInfo.waitTime);
}, serverStatusInfo.waitTime || 3000);
*/

let serverDataObtained = false;

// this is for static data that won't change after server start
const sinfoHandle = setInterval(() => {
    if (!serverDataObtained) {
        if (!serverStatusInfo || !serverStatusInfo.statusChannels) return;
        for (const channel of serverStatusInfo.statusChannels) {
            const guildChannel = client.channels.find(ch => ch.id === channel);
            if (guildChannel === null) return console.log('foundchannel was null');
            if (!guildChannel.topic) return console.log('the channel had no topic');
            request.get(`https://servers-live.fivem.net/api/servers/single/${guildChannel.topic}`, {
                timeout: 4000
            }, (err, _, body) => {
                if (err) return console.log(err.stack);

                try {
                    serverData = JSON.parse(body);
                }
                catch(e) {
                    return console.log(e.stack);
                }
            });
        }

        if (serverData === undefined) {
            console.log('sv data was null, running interval again');
        }
        else {
            serverDataObtained = true;
        }
    }
    else {
        console.log('Interval cleared, this information is static and doesn\'t need to be requested more than once.');
        clearInterval(sinfoHandle);
    }
// minus 10 so it happens before other checks
}, (serverStatusInfo.waitTime || 3000) - 10);

setInterval(() => {
    if (!serverStatusInfo || !serverStatusInfo.status) return;
    if (serverStatusInfo.statusChannels === undefined) return;
    if (typeof serverStatusInfo.statusChannels === 'object') {
        for (const channel of serverStatusInfo.statusChannels) {
            const guildChannel = client.channels.find(ch => ch.id === channel);
            if (guildChannel === null) return console.log('Could not find channel in channels collection (%s)', channel);
            if (!guildChannel.topic) return;
            request.get(`http://${guildChannel.topic}/players.json`, {
                timeout: 4000
            }, (err, _, body) => {
                if (err) return console.log(err.stack);

                try {
                    playerData = JSON.parse(body);
                }
                catch(_e) {
                    return console.log(_e.stack);
                }
            });

            if (playerData === undefined) return console.log('playerData was undefined.');
            const format = playerData.length > 0 ?
                playerData.map(ply => `${ply.name} | ${ply.id} - Ping: ${ply.ping}`) :
                'No players online.';
            guildChannel.fetchMessages()
                .then(messages => {
                    console.log(typeof messages);
                    const statEmbed = new Discord.RichEmbed()
                        .setColor('#7700EF')
                        .setAuthor(functions.FiveMSanitize(serverData.Data.hostname), 'https://i.imgur.com/qTPd0ql.png')
                        .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss'))
                        .setDescription(format);

                    if (messages.array().length === 0) {
                        guildChannel.send(statEmbed);
                    }

                    messages.forEach(message_ => {
                        console.log('iterating');
                        if (message_ === null) return console.log('message_ was null');
                        if (message_.embeds.length >= 1) {
                            console.log('message has embeds!', message_.embeds.length);
                            const embed = new Discord.RichEmbed(message_.embeds[0])
                                .setDescription(format)
                                .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss'));

                            return message_.edit(embed);
                        }
                        else {
                            message_.delete();
                            console.log('found a message that was not status embed in #%s (%s)', guildChannel.name, guildChannel.id);
                        }
                    });
                });

            // console.log(playerData);
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