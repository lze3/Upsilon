const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const moment = require('moment');

module.exports = class UserInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'userinfo',
            aliases: ['whois', 'uinfo'],
            group: 'moderation',
            memberName: 'userinfo',
            description: 'Obtains information about a user.',
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'user',
                    prompt: 'Which user would you like to get information for?',
                    type: 'user',
                    default: self => self.author
                }
            ]
        });
    }

    run(message, { user }) {
        // create the new embed object
        const embed = new RichEmbed();

        // get the member from the user
        const member = message.guild.members.find(foundMember => foundMember.id === user.id);

        // this is the username; will be undefined if they don't have one
        const nickname = user.nickname;
        if (nickname !== undefined) embed.addField('Nickname', nickname);

        // this is the user's status
        const status = user.presence.status + (user.presence.game !== null ? ' playing ' + user.presence.game : '');
        if (user.presence !== null) embed.addField('Status', status, true);

        // this is the date at which the member joined the guild
        const joinedAt = moment(member.joinedAt).format('ddd, MMM D, YYYY H:mm A');
        embed.addField('Joined', joinedAt, true);

        // this is the date at which the account was created
        const createdAt = moment(user.createdAt).format('ddd, MMM D, YYYY H:mm A');
        embed.addField('Registered', createdAt);

        // the member's roles
        const amountOfRoles = member.roles.array().length - 1;
        const roles = amountOfRoles > 0 ?
            member.roles.map(role => role.name !== '@everyone' ? '<@&' + role.id + '>' : '').join(' ') :
            'This user doesn\'t have any roles.';
        embed.addField(`Roles [${amountOfRoles}]`, roles);

        // the color of the embed
        embed.setColor(message.guild.me.colorRole.color);
        if (member.colorRole !== null) embed.setColor(member.colorRole.color);

        if (nickname !== undefined) {
            embed.addField('Nickname', nickname);
        }

        message.embed(embed);
    }
};