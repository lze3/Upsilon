const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const moment = require('moment');

const gameStates = {
    0: 'Playing',
    1: 'Streaming',
    2: 'Listening to',
    3: 'Watching'
};

const Acknowledgements = [
    {
        id: '607380065461993472',
        title: 'Bot Developer',
        type: 'Role'
    },

    {
        id: '607380063264178186',
        title: 'Game Developer',
        type: 'Role'
    },

    {
        id: '539450716629106698',
        title: 'Server Administration',
        type: 'Role'
    },

    {
        id: '586026320786489364',
        title: 'The Collective',
        type: 'Role'
    }

];

module.exports = class UserInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'userinfo',
            aliases: ['whois', 'uinfo'],
            group: 'administration',
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
        message.delete();

        const locAcknow = [];

        locAcknow[user.id] = [];

        // create the new embed object
        const embed = new RichEmbed();

        // get the member from the user
        const member = message.guild.members.find(foundMember => foundMember.id === user.id);

        for (let i = 0; i < Acknowledgements.length; i++) {
            if (Acknowledgements[i].type === 'User') {
                if (user.id === Acknowledgements[i].id) {
                    locAcknow[user.id].push(Acknowledgements[i].title);
                }
            }

            if (Acknowledgements[i].type === 'Role') {
                if (member.roles.has(Acknowledgements[i].id)) {
                    locAcknow[user.id].push(Acknowledgements[i].title);
                }
            }

        }

        embed.setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL);
        embed.setThumbnail(user.avatarURL);

        // this is the username; will be undefined if they don't have one
        const nickname = user.nickname;
        if (nickname !== undefined) embed.addField('❯ Nickname', nickname);

        // this is the user's status
        const status = user.presence.status + (user.presence.game !== null ? ' ' + gameStates[user.presence.game.type].toLowerCase() + ' ' + user.presence.game : '');
        if (user.presence !== null) embed.addField('❯ Status', status, true);

        // this is the date at which the member joined the guild
        const joinedAt = moment(member.joinedAt).format('ddd, MMM D, YYYY H:mm A');
        embed.addField('❯ Joined', joinedAt, true);

        // this is the date at which the account was created
        const createdAt = moment(user.createdAt).format('ddd, MMM D, YYYY H:mm A');
        embed.addField('❯ Registered', createdAt);

        // the member's roles
        const amountOfRoles = member.roles.array().length - 1;
        const roles = amountOfRoles > 0 ?
            member.roles.map(role => role.name !== '@everyone' && role.name !== '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯' ? '<@&' + role.id + '>' : '').join(' ') :
            'This user doesn\'t have any roles.';
        embed.addField(`❯ Roles [${amountOfRoles}]`, roles);

        if (locAcknow[user.id].length > 0) {
            embed.addField('❯ User Acknowledgements', locAcknow[user.id].map(title => '• ' + title));
        }

        // the color of the embed
        embed.setColor(message.guild.me.colorRole.color);
        if (member.colorRole !== null) embed.setColor(member.colorRole.color);

        if (nickname !== undefined) {
            embed.addField('❯ Nickname', nickname);
        }

        embed.setFooter('Requested by ' + message.author.tag);

        message.embed(embed)
            .then(msg => msg.delete(30000));
    }
};