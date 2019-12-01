import { Channel, TextChannel, GuildChannel, Guild, MessageEmbed, EmbedField, Message, DiscordAPIError } from 'discord.js';
import { client } from '../bot';
import { ArgumentType } from 'discord.js-commando';
import * as request from 'request';
import * as moment from 'moment';
import { SpawnSyncOptionsWithStringEncoding } from 'child_process';

const settings: {logStatus: boolean, statusChannels: string[], waitTime: number} = {
    /**
     * Determines whether to update status or not
     */
    logStatus: true,

    /**
     * An array or string containing status channel(s)
     */
    statusChannels: [
        '639620849279696896'
    ],

    /**
     * Time the interval waits before running again, default is 15000ms (15sec)
     */
    waitTime: 7500
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

let isProbablyOffline: boolean;

// TODO
function getServerInfoData(): void {
    
    // don't run if the status is false, obviously
    if (!settings.logStatus) return;

    // if no channels then no endpoints
    if (!settings.statusChannels || typeof settings.statusChannels !== 'object' || settings.statusChannels.length === 0) return;

    // iteration
    for (const channel of settings.statusChannels) {
        
        let guildChannel: TextChannel;

        // get channel from client's channel collection
        guildChannel = client.channels.find(ch => ch.id === channel) as TextChannel;

        // if channel couldn't be found in collection, return 
        if (guildChannel === undefined) return console.log('Could not find channel (%s) in bot\'s collection.', channel);

        // if there is no topic, there is no endpoint, and no request
        if (!guildChannel.topic) return console.log('the channel had no topic');

        // request for hostname and stuff with a timeout of 10000ms to stop hangs
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
            // we must parse the data before we can begin to display it. if it cannot be
            // parsed, there is something wrong and we need to check it

            // also, this crashes app if it's not caught
            try {
                serverData[channel] = JSON.parse(body);
            }
            catch(e) {
                console.log('The following error is referring to IP: %s', guildChannel?.topic);
                return console.log(e.toString() + '\n');
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

const getServerInfoThread = setInterval(getServerInfoData, serverQueryTime);

function setServerStatusInfoThread(): void {

    // don't run if state is false, obviously
    if (!settings.logStatus) return;

    // if no channels then no endpoints
    if (!settings.statusChannels || typeof settings.statusChannels !== 'object' || settings.statusChannels.length === 0) return;

    for (const channel of settings.statusChannels) {
    
        let guildChannel: TextChannel|undefined;

        guildChannel = client.channels.find(ch => ch.id === channel) as TextChannel;

        // if the channel doesn't exist in the client's collection, we stop the code
        if (guildChannel === undefined) return console.log('Could not find channel (%s) in bot\'s collection.', channel);;
    
        // in order to request data, we use channel topics for ip and port, if there is no channel topic, there is no request
        // therefore, no code can be run
        if (!guildChannel.topic) return console.log('No IP found, returning');

        // requesting
        request.get(`http://${guildChannel.topic}/players.json`, {
            timeout: 4000
        }, (err, _, body) => {
            if (err) {
                console.log(err.stack);
                playerData[channel] = {
                    state: 'offline'
                };
            }

            try {
                playerData[channel] = JSON.parse(body);
            }
            catch(e) {
                playerData[channel] = {
                    state: 'offline'
                };
            }
        });

        if (playerData[channel] === undefined) return console.log('playerData[\'%s\'] was undefined, running again...', channel);

        if (serverData[channel] === undefined) return console.log('serverData[\'%s\'] was undefined, running again...', channel);

        if (serverData[channel].Data === undefined) return console.log('serverData[\'%s\'].Data was undefined, running again...', channel);

        if (serverData[channel].state !== undefined) isProbablyOffline = true;

        const format = playerData[channel].length > 0 ?
            '`' + playerData[channel].map((ply: playerDataStruct) => `${ply.name}`).join(', ') + '`' :
            'No players online.';

        let additionalFields: EmbedField[];
        const emptyFields: EmbedField[] = [];
        if (serverData[channel].Data.gametype.includes('Authorization')) {
            const shortAlvl = hsgAuths[serverData[channel].Data.gametype.replace('HSG-RP | Authorization ', '')];
            if (!isProbablyOffline) {
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
        }

        guildChannel.messages.fetch()
            .then(messages => {
                let statEmbed;
                let offlineEmbed;
                if (!isProbablyOffline) {
                    statEmbed = new MessageEmbed()
                        .setColor('#7700EF')
                        .setAuthor('HighSpeed-Gaming', 'https://i.imgur.com/qTPd0ql.png')
                        .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss') + '\n\n' +
                            `Total players: ${playerData[channel].length}/${serverData[channel].Data.vars.sv_maxClients}`)
                        .setDescription(format)
                        .setFooter('HighSpeed-Gaming 2019');

                    if (typeof additionalFields === 'object') {
                        statEmbed.fields = additionalFields;
                    }
                }
                else {
                    offlineEmbed = new MessageEmbed()
                        .setColor('#7700EF')
                        .setAuthor('HighSpeed-Gaming', 'https://i.imgur.com/qTPd0ql.png')
                        .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'))
                        .setFooter('HighSpeed-Gaming 2019');
                }

                if (messages.array().length === 0) {
                    console.log('There were no messages in the channel (%s), so I am sending the initial embed now...', guildChannel?.name);
                    if (isProbablyOffline) {
                        console.log('I think the server is offline.');
                        return guildChannel?.send(offlineEmbed);
                    }
                    
                    return guildChannel?.send(statEmbed);
                }

                messages.forEach(message_ => {
                    if (message_ === null) return console.log('I found a null message object, running again.');

                    if (message_.author.id !== client.user?.id) { return message_.delete(); }

                    if (message_.embeds.length >= 1) {
                        console.log('I found a message (%s) in the channel (%s) with embeds, editing this message with the updated information.',
                            message_.id,
                            guildChannel?.name);

                        if (!isProbablyOffline) {
                            const embed = new MessageEmbed(message_.embeds[0])
                                .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'));

                            delete embed.fields;
                            delete embed.description;

                            return message_.edit(embed);
                        }

                        const embed = new MessageEmbed()
                            .setDescription(format)
                            .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss') + '\n\n' +
                                `Total players: ${playerData[channel].length}/${serverData[channel].Data.vars.sv_maxClients}`);
                            
                        embed.fields = additionalFields;

                        return message_.edit(embed);
                    }
                    else {
                        message_.delete();
                        console.log('I found a message in %s by %s that was not status in #%s (%s)',
                            guildChannel?.name,
                            message_.author.tag,
                            guildChannel?.name,
                            guildChannel?.id);
                    }
                });
            });
    }
}
const setServerInfoThread = setInterval(setServerStatusInfoThread, settings.waitTime || 3000);

interface playerDataStruct {
    name: string;
    id: number;
    identifiers: string[];
    ping: number;
}

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