import { GuildMember, MessageEmbed, User } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';

const gameStates = {
    0: 'Playing',
    1: 'Streaming',
    2: 'Listening to',
    3: 'Watching'
};

const acknowledgements: Array<{ id: string, title: string, type: string}> = [
    {
        id: '264662751404621825',
        title: 'Bot Developer',
        type: 'user'
    }
];

export default class UserInfo extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'userinfo',
            aliases: ['whois', 'uinfo'],
            group: 'admin',
            memberName: 'userinfo',
            description: 'Returns information about a specified user.',
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'user',
                    prompt: 'Which user would you like to display information for?',
                    type: 'user',
                    default: (m: CommandoMessage) => m.author
                }
            ]
        });
    }

    public run(message: CommandoMessage, { user }: { user: User }) {
        message.delete();

        const current_date = new Date();

        const local_acknowledgements: any = {};
        local_acknowledgements[user.id] = [];

        const embed = new MessageEmbed();

        const member: GuildMember = (message.guild.members.find(fm => fm.id === user.id) as GuildMember); 

        for (const acknowledgement of acknowledgements) {
            if (acknowledgement.type === 'user') {
                if (user.id === acknowledgement.id) {
                    local_acknowledgements[user.id].push(acknowledgement.title);
                }
            }
        }

        if (message.guild.owner?.id === user.id) {
            local_acknowledgements[user.id].push('Server Owner');
        }

        embed.setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL() ?? undefined);
        if (user.avatarURL() !== undefined) {
            embed.setThumbnail(user.avatarURL() as string);
        }

        if (member.nickname !== undefined) {
            embed.addField('❯ Nickname', member?.nickname);
        }

        if (user.presence !== null) {
            const status = user.presence.status + (user.presence.activities !== null && user.presence.activities[0].type !== undefined ? user.presence.activities[0].type.toLowerCase()[0].toUpperCase() : '');
            embed.addField('❯ Status', status, true);
        }

        const joined_at = moment(member.joinedAt!);
        embed.addField('❯ Joined', `${joined_at.format('ddd, MMM D, YYYY H:mm A')} (${moment(current_date).diff(joined_at, 'days')} days ago)`, true);

        const created_at = moment(user.createdAt);
        embed.addField('❯ Registered', `${created_at.format('ddd, MMM D, YYYY H:mm A')} (${moment(current_date).diff(created_at, 'days')} days ago)`);

        const amount_of_roles = member.roles.array().length - 1;

        const roles = amount_of_roles > 0 ?
            member.roles.map(role => role.name !== '@everyone' ? '<@&' + role.id + '>' : '').join(' ') :
            'This user doesn\'t have any roles.';
        embed.addField(`❯ Roles [${amount_of_roles}]`, roles);

        if (local_acknowledgements[user.id].length > 0) {
            embed.addField('❯ User Acknowledgements', local_acknowledgements[user.id].map((title: string) => '• ' + title));
        }

        embed.setColor(message.guild.me?.roles.color!.color);
        if (member.roles.color !== null) {
            embed.setColor(member.roles.color.color);
        }

        embed.setFooter('Requested by ' + message.author.tag);

        if (user.id === '264662751404621825') {
            embed.addField('❯ Twitter', '[Go follow me](https://twitter.com/Zeemah_ "This is the bot developer, FYI.")');
        }

        return message.say(embed);
    }
}