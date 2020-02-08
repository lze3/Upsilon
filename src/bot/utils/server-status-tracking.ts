import { TextChannel, MessageEmbed, EmbedField, Channel } from 'discord.js';
import { client } from '../bot';
import * as request from 'request';
import * as moment from 'moment';
import '../lib/env';
import { time_log, get_environment_variable, get_auth_level_by_acronym } from './functions';

const settings: { logStatus: boolean, statusChannels: string[], customTaskResponse: string, waitTime: number } = {
    /**
     * Determines whether to update status or not
     */
    logStatus: get_environment_variable('AUTO_STATUS', 'false') === 'true',

    /**
     * An array or string containing status channel(s)
     */
    statusChannels: [
        '627278142133764096'
    ],

    /**
     * Where task responses are sent
     */
    customTaskResponse: '675487739180875790',

    /**
     * Time the interval waits before running again, default is 15000ms (15sec)
     */
    waitTime: 5000
};

let runTasks: boolean = true;

export function ToggleTasks(state: boolean): void|null {
    runTasks = state;
}

let serverQueryTime: number = 6000;

const serverData: any = {};
const playerData: any = {};

let probablyOfflineTick: number = 0;
let isProbablyOffline: boolean;

function getServerInfoData(): void {

    // don't run if the status is false, obviously
    if (!settings.logStatus) {
        clearInterval();
    }

    // if no channels then no endpoints
    if (!settings.statusChannels || typeof settings.statusChannels !== 'object' || settings.statusChannels.length === 0) {
        return;
    }

    // iteration
    for (const channel of settings.statusChannels) {

        let guildChannel: Channel|undefined;

        // get channel from client's channel collection
        guildChannel = client.channels.find(ch => ch.id === channel);

        // if channel couldn't be found in collection, return
        if (guildChannel === undefined || !(guildChannel instanceof TextChannel)) {
            return time_log('Could not find channel (${channel}) in bot\'s collection.');
        }

        // if there is no topic, there is no endpoint, and no request
        if (!guildChannel.topic) {
            return time_log('the channel had no topic');
        }

        const topic_deliminator: string[] = guildChannel.topic.split(/ +\| +/);
        const IP: string = topic_deliminator[0];
        const serverName: string = topic_deliminator[1] || null;
        const iconUrl: string = topic_deliminator[2] || null;

        // request for hostname and stuff with a timeout of 10000ms to stop hangs
        request.get(`http://${IP}/dynamic.json`, {
            timeout: 10000
        }, (err, response, body) => {
            if (err || response.statusCode === 404) {
                probablyOfflineTick++;
                if (err && !err.toString().includes('TIMEDOUT')) {
                    console.log(err.stack);
                }
                serverData[channel] = {
                    state: 'offline'
                };
                return;
            }

            // /!\ IMPORTANT /!\
            // we must parse the data before we can begin to display it. if it cannot be
            // parsed, there is something wrong and we need to check it

            // also, this crashes app if it's not caught
            try {
                serverData[channel].dynamic = JSON.parse(body);
            }
            catch(e) {
                probablyOfflineTick++;
                time_log(`The following error is referring to http://${IP}/dynamic.json`);
                return console.log(e.toString() + '\n');
            }
        });

        request.get(`http://${IP}/info.json`, {
            timeout: 2000
        }, (err, response, body) => {
            if (err || response.statusCode === 404) {
                probablyOfflineTick++;
                if (err && !err.toString().includes('TIMEDOUT')) {
                    console.log(err.stack);
                }
                serverData[channel] = {
                    state: 'offline'
                };
                return;
            }

            try {
                serverData[channel].info = JSON.parse(body);
            }
            catch(e) {
                probablyOfflineTick++;
                time_log(`The following error is referring to http://${IP}/info.json:`);
                return console.log(e.toString() + '\n');
            }
        });

        // run code again if data for this channel (or ip) was not found
        if (serverData[channel] === undefined) {
            time_log(`serverData[${channel}] was undefined, running again...`);
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
const getServerInfoThread: NodeJS.Timeout = setInterval(getServerInfoData, serverQueryTime);

const prevServerData: any = {};
const prevPlayerData: any = {};
let taskSent: boolean = false;
function setServerStatusInfoThread(): void {

    // don't run if state is false, obviously
    if (!settings.logStatus) {
        clearInterval();
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
            return time_log(`Could not find channel (${channel}) in bot\'s collection.`);
        }

        // in order to request data, we use channel topics for ip and port, if there is no channel topic, there is no request
        // therefore, no code can be run
        if (!guildChannel.topic) {
            return time_log('No IP found, returning');
        }

        const topic_delim: string[] = guildChannel.topic.split(/ +\| +/);
        const IP: string = topic_delim[0];
        const serverName: string = topic_delim[1] || 'FiveM';
        const iconUrl: string = topic_delim[2] || undefined;

        if (!IP) {
            return time_log('No IP found...');
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
            return time_log(`playerData[${channel}] was undefined, running again...`);
        }

        if (serverData[channel] === undefined) {
            return time_log(`serverData[${channel}] was undefined, running again...`);
        }

        if (isProbablyOffline) { isProbablyOffline = false; }
        if (probablyOfflineTick >= 5) {
            isProbablyOffline = true;
            probablyOfflineTick = 0;
        }

        const format: string = playerData[channel].length > 0 ?
            '`' + playerData[channel].map((ply: IPlayerDataStruct) => `${ply.name}`).join(', ') + '`' :
            'No players online.';

        let additionalFields: EmbedField[];
        const [ is_hsg, auth_level ]: [ boolean, string|null ] = get_auth_level_by_acronym(serverData[channel].dynamic.gametype);
        if (!isProbablyOffline && is_hsg) {
            additionalFields = [
                {
                    name: 'Authorization',
                    value: auth_level
                },
                {
                    name: 'Roleplay Zone',
                    value: serverData[channel].dynamic.mapname
                }
            ];
        }

        guildChannel.messages.fetch()
            .then(messages => {
                let statEmbed: MessageEmbed;
                let offlineEmbed: MessageEmbed;
                if (!isProbablyOffline) {
                    statEmbed = new MessageEmbed()
                        .setColor('#7700EF')
                        .setAuthor(serverName, iconUrl)
                        .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss') + '\n\n' +
                            `Total players: ${playerData[channel].length}/${serverData[channel].dynamic.sv_maxclients}`)
                        .setDescription(format)
                        .setFooter(`${serverName} 2019`);

                    if (additionalFields.length > 0) {
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
                        time_log('I think the server is offline.');
                        guildChannel?.send(offlineEmbed);
                    }

                    guildChannel?.send(statEmbed);
                }

                messages.forEach(indexed_message => {
                    if (indexed_message === null) {
                        return time_log('I found a null message object, running again.');
                    }

                    if (indexed_message.author.id !== client.user?.id) { return indexed_message.delete(); }

                    if (indexed_message.embeds.length >= 1) {
                        time_log(`I found a message (${indexed_message.id}) in the channel (${guildChannel.name}) with embeds, editing this message with the updated information.`);

                        if (isProbablyOffline) {
                            const offline_embed: MessageEmbed = new MessageEmbed(indexed_message.embeds[0])
                                .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'));

                            delete offline_embed.fields;
                            delete offline_embed.description;

                            indexed_message.edit(offline_embed);
                        }

                        const embed: MessageEmbed = new MessageEmbed(indexed_message.embeds[0])
                            .setDescription(format)
                            .setTitle('Here is the updated server status, last updated @ ' + moment(Date.now()).format('h:mm:ss') + '\n\n' +
                                `Total players: ${playerData[channel].length}/${serverData[channel].dynamic.sv_maxclients}`);

                        if (typeof additionalFields === 'object') {
                            embed.fields = additionalFields;
                        }

                        const topicDelim: string[] = guildChannel.topic.split(/ +\| +/);
                        if (embed.author !== topicDelim[1]) {
                            embed.setAuthor(topicDelim[1], topicDelim[2]);
                            embed.setFooter(topicDelim[1] + ' 2019');
                        }

                        indexed_message.edit(embed);

                        if (runTasks && !taskSent) {
                            taskSent = true;
                            if (prevPlayerData[channel] && (prevPlayerData[channel].length !== playerData[channel].length) && is_hsg && auth_level === 'Casual Restricted') {
                                let tChannel: TextChannel;
                                tChannel = client.channels.find(ch => ch.id === settings.customTaskResponse) as TextChannel;

                                tChannel.send(`Hey, <@264662751404621825>, server player count is 31 and authorization is CR. I was told to tell you.`);
                            }
                        }
                        prevServerData[channel] = serverData[channel];
                        prevPlayerData[channel] = playerData[channel];
                    }
                    else {
                        indexed_message.delete();
                        time_log(`I found a message in ${guildChannel?.name} by ${indexed_message.author.tag} that was not status in #${guildChannel?.name} (${guildChannel?.id})`);
                    }
                });
            });
    }
}
const setServerInfoThread: NodeJS.Timeout = setInterval(setServerStatusInfoThread, settings.waitTime || 3000);

setInterval(() => {
    if (runTasks && taskSent) {
        taskSent = false;
    }
}, 3000);

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