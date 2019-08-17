const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config');

module.exports = class lockdown extends Command {
    constructor(client) {
        super(client, {
            name: 'lockdown',
            aliases: ['lockd', 'ld'],
            group: 'administration',
            memberName: 'lockdown',
            description: 'Locks all channels in a specific category.',
            userPermissions: ['MANAGE_GUILD'],
            clientPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'category',
                    prompt: 'Which category do you want to lock?',
                    type: 'channel'
                },
                {
                    key: 'reason',
                    prompt: 'Why are you locking?',
                    type: 'string',
                    default: ''
                },
                {
                    key: 'end',
                    prompt: 'Stop this lockdown?',
                    type: 'boolean',
                    default: false
                }
            ]
        });
    }

    run(message, { category, reason, end }) {
        message.delete();

        if (category.type !== 'category') {
            return message.reply('you need to provide a category to lock.');
        }

        const children = category.children;

        children.forEach(child => {
            child.overwritePermissions(message.guild.defaultRole, {
                SEND_MESSAGES: end
            });
        });

        const embed = new RichEmbed()
            .setAuthor('Lockdown | ' + message.author.tag, message.author.avatarURL)
            .setDescription(`Category ${category.name} has been ${end ? 'unlocked' : 'locked'}.`)
            .setColor(config.embedColors.action)
            .setTimestamp();

        if (reason && reason !== '') {
            embed.addField('Reason', reason);
        }


        this.client.channels.find(logC => logC.id === config.logChannels.actions).send({ embed: embed });
        message.reply(`I ${end ? 'unlocked' : 'locked'} the \`${category.name}\` category for you.`);

    }
};