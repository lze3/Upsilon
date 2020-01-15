import { TextChannel, MessageEmbed, EmbedField } from 'discord.js';
import { client } from '../bot';
import * as request from 'request';
import * as moment from 'moment';
import '../lib/env';

const settings: {logStatus: boolean, statusChannels: string[], waitTime: number} = {
    /**
     * Determines whether to update status or not
     */
    logStatus: (process.env.AUTO_STATUS ?? 'false') === 'true',

    /**
     * An array or string containing status channel(s)
     */
    statusChannels: [
        '639620849279696896'
    ],

    /**
     * Time the interval waits before running again, default is 15000ms (15sec)
     */
    waitTime: 2000
}

const hsgAuths: any = {
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

let serverQueryTime: number = 6000;

const serverData: any = {};
const playerData: any = {};

let probablyOfflineTick: number = 0;
let isProbablyOffline: boolean;

function getServerInfoData(): void {
    
    // don't run if the status is false, obviously
    if (!settings.logStatus) {
        return;
    }

    // if no channels then no endpoints
    if (!settings.statusChannels || typeof settings.statusChannels !== 'object' || settings.statusChannels.length === 0) {
        return;
    }

    // iteration
    for (const channel of settings.statusChannels) {
        
        let guildChannel: TextChannel;

        // get channel from client's channel collection
        guildChannel = client.channels.find(ch => ch.id === channel) as TextChannel;

        // if channel couldn't be found in collection, return 
        if (guildChannel === undefined) {
            return console.log('Could not find channel (%s) in bot\'s collection.', channel);
        }

        // if there is no topic, there is no endpoint, and no request
        if (!guildChannel.topic) { 
            return console.log('the channel had no topic');
        }

        const topic_deliminator = guildChannel.topic.split(/ +\| +/);
        const IP = topic_deliminator[0];
        const serverName = topic_deliminator[1] || null;
        const iconUrl = topic_deliminator[2] || null;

        // request for hostname and stuff with a timeout of 10000ms to stop hangs
        request.get(`https://servers-live.fivem.net/api/servers/single/${IP}`, {
            timeout: 10000
        }, (err, _, body) => {
            if (err) {
                probablyOfflineTick++;
                if (!err.toString().includes('TIMEDOUT')) {
                    console.log(err.stack);
                }
                serverData[channel] = {
                    state: 'offline'
                };
            }

            // /!\ IMPORTANT /!\
            // we must parse the data before we can begin to display it. if it cannot be
            // parsed, there is something wrong and we need to check it

            // also, this crashes app if it's not caught
            try {
                serverData[channel] = JSON.parse(body);
            }
            catch(e) {
                probablyOfflineTick++;
                console.log('The following error is referring to IP: %s', IP);
                return console.log(e.toString() + '\n');
            }
        });

        // run code again if data for this channel (or ip) was not found
        if (serverData[channel] === undefined) {
            console.log('serverData[\'%s\'] was undefined, running again...', channel);
            serverData[channel] = {
                state: 'offline'
            };
            probablyOfflineTick++;
        }
        else {
            // every minute
            serverQueryTime = 60000;
        }
    }
}
const getServerInfoThread = setInterval(getServerInfoData, serverQueryTime);

function setServerStatusInfoThread(): void {

    // don't run if state is false, obviously
    if (!settings.logStatus) {
        return;
    }

    // if no channels then no endpoints
    if (!settings.statusChannels || typeof settings.statusChannels !== 'object' || settings.statusChannels.length === 0) {
        return;
    }

    for (const channel of settings.statusChannels) {
    
        let guildChannel: TextChannel;

        guildChannel = client.channels.find(ch => ch.id === channel) as TextChannel;

        // if the channel doesn't exist in the client's collection, we stop the code
        if (guildChannel === undefined) {
            return console.log('Could not find channel (%s) in bot\'s collection.', channel);
        }
    
        // in order to request data, we use channel topics for ip and port, if there is no channel topic, there is no request
        // therefore, no code can be run
        if (!guildChannel.topic) {
            return console.log('No IP found, returning');
        }

        const topic_delim = guildChannel.topic.split(/ +\| +/);
        const IP = topic_delim[0];
        const serverName = topic_delim[1] || 'FiveM';
        const iconUrl = topic_delim[2] || undefined;

        if (!IP) {
            return console.log('No IP found...');
        }

        // requesting
        request.get(`http://${IP}/players.json`, {
            timeout: 4000
        }, (err, _, body) => {
            if (err) {
                console.log(err.stack);
                probablyOfflineTick++;
            }

            try {
                playerData[channel] = JSON.parse(body);
            }
            catch(e) {
                playerData[channel] = {
                    state: 'offline'
                };
                probablyOfflineTick++;
            }
        });

        if (playerData[channel] === undefined) {
            return console.log('playerData[\'%s\'] was undefined, running again...', channel);
        }

        if (serverData[channel] === undefined) {
            return console.log('serverData[\'%s\'] was undefined, running again...', channel);
        }

        if (serverData[channel].Data === undefined) {
            return console.log('serverData[\'%s\'].Data was undefined, running again...', channel);
        }

        if (isProbablyOffline) { isProbablyOffline = false; }
        if (probablyOfflineTick >= 5) {
            isProbablyOffline = true;
            probablyOfflineTick = 0;
        }

        const format = playerData[channel].length > 0 ?
            '`' + playerData[channel].map((ply: IPlayerDataStruct) => `${ply.name}`).join(', ') + '`' :
            'No players online.';

        let additionalFields: EmbedField[];
        if (!isProbablyOffline && serverData[channel].Data.gametype && serverData[channel].Data.gametype.includes('Authorization')) {
            const shortAlvl = hsgAuths[serverData[channel].Data.gametype.replace('HSG-RP | Authorization ', '')];
            additionalFields = [
                {
                    name: 'Authorization',
                    value: hsgAuths[shortAlvl] + ` (${shortAlvl})`
                },
                {
                    name: 'Roleplay Zone',
                    value: serverData[channel].Data.mapname
                }
            ]
        }

        guildChannel.messages.fetch()
            .then(messages => {
                let statEmbed;
                let offlineEmbed;
                if (!isProbablyOffline) {
                    statEmbed = new MessageEmbed()
                        .setColor('#7700EF')
                        .setAuthor(serverName, iconUrl)
                        .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss') + '\n\n' +
                            `Total players: ${playerData[channel].length}/${serverData[channel].Data.vars.sv_maxClients}`)
                        .setDescription(format)
                        .setFooter(`${serverName} 2019`);

                    if (typeof additionalFields === 'object') {
                        statEmbed.fields = additionalFields;
                    }
                }
                else {
                    offlineEmbed = new MessageEmbed()
                        .setColor('#7700EF')
                        .setAuthor(serverName, iconUrl)
                        .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'))
                        .setFooter(`${serverName} 2019`);
                }

                if (messages.array().length === 0) {
                    console.log('There were no messages in the channel (%s), so I am sending the initial embed now...', guildChannel?.name);
                    if (isProbablyOffline) {
                        console.log('I think the server is offline.');
                        return guildChannel?.send(offlineEmbed);
                    }
                    
                    return guildChannel?.send(statEmbed);
                }

                messages.forEach(indexed_message => {
                    if (indexed_message === null) {
                        return console.log('I found a null message object, running again.');
                    }

                    if (indexed_message.author.id !== client.user?.id) { return indexed_message.delete(); }

                    if (indexed_message.embeds.length >= 1) {
                        console.log('I found a message (%s) in the channel (%s) with embeds, editing this message with the updated information.',
                            indexed_message.id,
                            guildChannel?.name);

                        if (isProbablyOffline) {
                            const offline_embed = new MessageEmbed(indexed_message.embeds[0])
                                .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'));

                            delete offline_embed.fields;
                            delete offline_embed.description;

                            return indexed_message.edit(offline_embed);
                        }

                        const embed = new MessageEmbed(indexed_message.embeds[0])
                            .setDescription(format)
                            .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss') + '\n\n' +
                                `Total players: ${playerData[channel].length}/${serverData[channel].Data.vars.sv_maxClients}`);
                        
                        if (typeof additionalFields === 'object') {
                            embed.fields = additionalFields;
                        }

                        const topicDelim = guildChannel.topic.split(/ +\| +/);
                        if (embed.author !== topicDelim[1]) {
                            embed.setAuthor(topicDelim[1], topicDelim[2]);
                            embed.setFooter(topicDelim[1] + ' 2019');
                        }

                        return indexed_message.edit(embed);
                    }
                    else {
                        indexed_message.delete();
                        console.log('I found a message in %s by %s that was not status in #%s (%s)',
                            guildChannel?.name,
                            indexed_message.author.tag,
                            guildChannel?.name,
                            guildChannel?.id);
                    }
                });
            });
    }
}
const setServerInfoThread = setInterval(setServerStatusInfoThread, settings.waitTime || 3000);

interface IPlayerDataStruct {
    name: string;
    id: number;
    identifiers: string[];
    ping: number;
}

// might use sometime in the future
/*
interface serverDataStruct {
    [key: string]: any;
    Data: {
        sv_maxClients: number;
        clients: number;
        gamename: string;
        protocol: number;
        hostname: string;
        gametype: string;
        mapname: string;
        enhancedHostSupport: boolean;
        resources: string[];
        server: string;
        vars: {
            Teamspeak?: string;
            Website?: string;
            locale?: string;
            onesync_enabled: string;
            sv_enhancedHostSupport: string;
            sv_lan: string;
            sv_licenseKeyToken: string;
            sv_maxClients: string;
            sv_scriptHookAllowed: string;
            svn?: string;
            tags: string;
            premium?: string;
        };
        players: object[];
        upvotePower: number;
        svMaxclients: number;
        lastSeen: Date;
        iconVersion: number;
    }
}
*/