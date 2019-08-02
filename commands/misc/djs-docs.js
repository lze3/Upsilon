const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const qs = require('querystring');

const SOURCES = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', '11.5-dev'];

module.exports = class Docs extends Command {
    constructor(client) {
        super(client, {
            name: 'docs',
            aliases: ['djshelp', 'djs'],
            group: 'misc',
            memberName: 'docs',
            description: 'Searches discord.js documentation.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'query',
                    type: 'string',
                    prompt: 'What would you like to search for?'
                }
            ]
        });
    }

    async run(message, { query }) {
        const q = query.split(' ');
        const docs = 'stable';
        const source = SOURCES.includes(q.slice(-1)[0]) ? q.pop() : docs;

        const queryString = qs.stringify({
            src: source,
            q: q.join(' '),
            force: true
        });
        const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
        const embed = await res.json();

        if (!embed) {
            return message.reply('I could not find what your were looking for, sorry.');
        }

        return message.reply({ embed });

    }
};