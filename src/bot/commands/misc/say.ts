import { Message, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { stringify } from 'querystring';

export default class SayCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'say',
            group: 'misc',
            memberName: 'say',
            description: 'Sends a message as the bot',
            hidden: true,
            guildOnly: true,
            userPermissions: ['KICK_MEMBERS'],
            args: [
                {
                    key: 'text',
                    prompt: 'What would you like to say?',
                    type: 'string'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { text }: { text: string }) {
        message.delete();
        return message.say(text);
    }
}