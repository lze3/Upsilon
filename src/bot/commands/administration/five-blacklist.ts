import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { get } from 'request';
import { black } from 'colors';
import { Message } from 'discord.js';

export default class FiveBlacklist extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'fivebl',
            aliases: ['fb', '5b'],
            group: 'admin',
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

    public run(message: CommandoMessage, { ip }: { ip: string }) {
        let blacklist: boolean = false;

        get(`https://runtime.fivem.net/blacklist/${ip}`, {
            timeout: 2000
        }, (err, response, body) => {
            if (err) {
                console.log(err.stack);
            }

            if (response.statusCode === 404) {
                blacklist = true;
            }

            message.reply(`the IP ${ip} is ${blacklist ? '' : 'not '}blacklisted.`);
            if (blacklist) {
                message.author.send(`**Blacklist reason for ${ip}:**\n\`\`\`${body}\`\`\``)
                    .catch(() => message.reply('I could not send you a message.')
                        .then((msg: Message|any) => (msg as any).delete(5000))
                    );
            }
        });

        return null;
    }
}