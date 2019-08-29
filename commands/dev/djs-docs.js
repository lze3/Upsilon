const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const qs = require('querystring');

const SOURCES = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', '11.5-dev'];

class Docs extends Command {
    constructor() {
        super('djs-docs', {
            description: 'Searches Discord.JS documentation.',
            clientPermissions: 'EMBED_LINKS',
            args: [
                {
                    id: 'query',
                    type: 'string',
                    prompt: {
                        start: 'What would you like to search for?',
                        retry: 'Please provide something valid to search for.'
                    }
                }
            ]
        });
    }

    async exec(message, { query }) {
        const q = query.split(' ');
        const docs = 'stable';
        const source = SOURCES.includes(q.slice(-1)[0]) ? q.pop() : docs;

        const querystring = qs.stringify({
            src: source,
            q: q.join(' '),
            force: true
        });
        const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${querystring}`);
        const embed = await res.json();

        if (!embed) {
            return message.reply('I could not find that.');
        }

        return message.reply({
            embed
        });
    }
}

module.exports = Docs;