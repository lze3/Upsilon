import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { User, GuildMember } from 'discord.js';

export default class Ban extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'ban',
            aliases: ['b'],
            group: 'admin',
            memberName: 'ban',
            description: 'Bans a member from the guild.',
            userPermissions: ['BAN_MEMBERS'],
            clientPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'user',
                    prompt: 'Which user?',
                    type: 'user'
                },
                {
                    key: 'reason',
                    prompt: 'Why are you banning this user?',
                    type: 'string'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { user, reason }: { user: User, reason: string }) {
        const member: GuildMember|undefined = message.guild.members.find(fm => fm.id === user.id);

        message.delete();

        if (user.id === message.author.id) {
            return message.reply('you cannot ban yourself!');
        }

        if (member !== undefined) {
            try {
                message.guild.members.ban(user.id);
            }
            catch(e) {
                console.log(e.stack);
                return message.say('Uh oh! Something went wrong, developer was notified.');
            }
        }
        return message.say(`***${user.username}#${user.discriminator} was banned for ${reason}!***`);
    }
}