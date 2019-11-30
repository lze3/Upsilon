import { Channel, TextChannel, GuildChannel } from 'discord.js';
import { client } from '../bot';

const settings = {
    /**
     * Determines whether to update status or not
     */
    logStatus: false,

    /**
     * An array or string containing status channel(s)
     */
    statusChannels: [
        '627278142133764096'
    ],

    /**
     * Time the interval waits before running again, default is 15000ms (15sec)
     */
    waitTime: 7500
}

export const hsgAuths = {
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
}

// TODO
/*
function getServerInfoData(): void {
    
    // don't run if the status is false, obviously
    if (!settings.logStatus) return;

    // if no channels then no endpoints
    if (!settings.statusChannels || typeof settings.statusChannels !== 'object') return;

    // iteration
    for (const channel of settings.statusChannels) {

        // get channel from client's channel collection
        const guildChannel: GuildChannel|undefined = client.channels.find(ch => ch.id === channel && ch.type === 'text');


        // if channel couldn't be found in collection, return 
        if (guildChannel === undefined) return console.log('Could not find channel (%s) in bot\'s collection.', channel);

        // we use topic for endpoint, we can't request anything if there is no topic/endpoint
        if ()
    }

}
*/