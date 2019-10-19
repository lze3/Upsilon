const { Command } = require('discord.js-commando');
const request = require('request');

module.exports = class fiveblacklist extends Command {
    constructor(client) {
        super(client, {
            name: 'fivebl',
            aliases: ['fb', '5b'],
            group: 'administration',
            memberName: 'fivebl',
            description: 'Checks if a FiveM server is blacklisted.',
            ownerOnly: true,
            hidden: true,
            args: [
                {
                    key: 'ip',
                    prompt: 'Which IP would you like to check?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { ip }) {
        let blacklist = true;
        request.get(`https://runtime.fivem.net/blacklist/${ip}`, {
            timeout: 2000
        }, (err, response, body) => {
            if (err) {
                console.log(err.stack);
            }

            if (response.statusCode === 404) {
                blacklist = false;
            }

            message.reply(`the IP ${ip} is ${blacklist ? '' : 'not '}blacklisted.`);
            if (blacklist) {
                message.author.send('**Blacklist reason for ' + ip + '**:\n```' + body + '```')
                    .catch(() => message.reply('I couldn\'t send you a message.')
                        .then(msg => msg.delete(5000))
                    );
            }
        });
    }
};