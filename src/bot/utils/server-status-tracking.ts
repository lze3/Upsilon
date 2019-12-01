import { Channel, TextChannel, GuildChannel, Guild } from 'discord.js';
import { client } from '../bot';
import { ArgumentType } from 'discord.js-commando';
import * as request from 'request';

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

const hsgAuths = {
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
    for (const channel of Object.keys(settings.statusChannels)) {
        
        let guildChannel: TextChannel|undefined;

        // get channel from client's channel collection
        client.guilds.forEach(guild => {
            guildChannel = (guild.channels.get(channel) as TextChannel);
        });

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

    for (const channel of Object.keys(settings.statusChannels)) {
    
        let guildChannel: TextChannel|undefined;

        client.guilds.forEach(guild => {
            guildChannel = (guild.channels.get(channel) as TextChannel);
        });

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

        if (playerData[channel] === undefined) return console.log('playerData\'%s\'] was undefined, running again...', channel);

        if (serverData[channel] === undefined) return console.log('serverData\'%s\'] was undefined, running again...', channel);

        if (serverData[channel].Data === undefined) return console.log('serverData\'%s\'].Data was undefined, running again...', channel);

        if (serverData[channel].state !== undefined) isProbablyOffline = true;

        const format = playerData[channel].length > 0 ?
            '`' + playerData[channel].map((ply: playerDataStruct) => `${ply.name}`).join(', ') + '`' :
            'No players online.';

        let additionalFields: object[];
        const shortAlvl = hsgAuths[serverData[channel].Data.gametype.replace('HSG-RP | Authorization ', '')] !== undefined ?? null;
        if (!isProbablyOffline) {
            additionalFields = [
                {
                    name: 'Authorization',
                    value: hsgAuths[shortAlvl] + ` (${shortAlvl})`
                }
            ]
        }
    }
}

interface playerDataStruct {
    name: string;
    id: number;
    identifiers: object;
    ping: number;
}