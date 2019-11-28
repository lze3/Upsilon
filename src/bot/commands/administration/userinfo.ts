import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class UserInfo extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'userinfo',
            group: 'admin',
            memberName: 'uinfo',
            description: 'Returns information about a specific user',
            args: [
                {
                    key: 'user',
                    prompt: 'Which user whould you like to display information for?',
                    type: 'user',
                    default: (m: CommandoMessage) => m.author
                }
            ]
        });
    }

    public run(message: CommandoMessage, { text }: { text: string }) {
        return message.say('smiley');
    }
}