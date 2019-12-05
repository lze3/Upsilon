import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember } from 'discord.js';

export default class Kick extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'kick',
            aliases: ['k'],
            group: 'admin',
            memberName: 'kick',
            description: 'Kicks a user from the guild.',
            userPermissions: ['KICK_MEMBERS'],
            clientPermissions: ['KICK_MEMBERS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Which member are you wanting to kick?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'Why are you kicking this member?',
                    type: 'string'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { member, reason }: { member: GuildMember, reason: string }) {
        message.delete();

        if (member.user.id === message.author.id) {
            return message.reply('you cannot kick yourself!');
        }

        try {
            member.kick(reason);
        }
        catch(e) {
            console.log(e.stack);
            return message.say('Uh oh! Something went wrong, developer was notified.');
        }
        return message.say(`***${member.user.username} was kicked for ${reason}!***`);
    }
}