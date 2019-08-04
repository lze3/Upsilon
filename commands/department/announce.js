const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

module.exports = class Announce extends Command {
    constructor(client) {
        super(client, {
            name: 'announce',
            aliases: [
                'lspd-announce',
                'lssd-announce',
                'sacd-announce',
                'lsfd-announce',
                'sahp-announce',
                'vm-announce'
            ],
            group: 'department',
            memberName: 'announce',
            description: 'Sends an announcement to the channel.',
            examples: [
                client.commandPrefix + 'announce title: Announcement title | Body',
                client.commandPrefix + 'announce Just an announcement with no title.'
            ],
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'announcement',
                    prompt: 'What would you like to announce?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { announcement }) {
        const deliminator = announcement.split(/title: (.+) \|/);

        message.delete();

        const embed = new RichEmbed()
            .setAuthor(`Announcement from ${message.member.user.username}`, message.author.avatarURL)
            .setDescription(announcement)
            .setColor('#1C98F8')
            .setFooter(message.member.highestRole.name)
            .setTimestamp();

        if (deliminator[1] !== undefined) {
            embed.setTitle(deliminator[1].replace('title: ', ''));
            embed.setDescription(announcement.replace(`title: ${deliminator[1]} |`, ''));
        }

        message.say(embed);
    }
};