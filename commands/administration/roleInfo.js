const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const moment = require('moment');

const functs = require('../../utils/Functions');

module.exports = class RoleInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'roleinfo',
            aliases: ['rolei', 'ri'],
            group: 'misc',
            memberName: 'roleinfo',
            description: 'Provides information about a role.',
            guildOnly: true,
            clientPermissions: ['MANAGE_ROLES'],
            args: [
                {
                    key: 'role',
                    type: 'role',
                    prompt: 'Which role would you like to get information for?'
                }
            ]
        });
    }

    run(message, { role }) {
        message.delete();
        const embed = new RichEmbed()
            // .setAuthor(`Role Information - ${role.name}`, message.author.avatarURL)
            .setColor(role.color || '#23E25D')
            .addField('Name', role.name, true)
            .addField('ID', role.id, true)
            .addField('Members', role.members.size)
            .addField('Color', `#${role.color.toString(16)}`, true)
            .addField('Mention', `\`<@&${role.id}>\``, true)
            .addField('Mentionable', functs.convertBoolToStrState(role.mentionable), true)
            .addField('Position', role.position, true)
            .addField('Created', moment(role.createdAt).format('ddd, MMM D, YYYY H:mm A'), true)
            .addField('Hoisted', functs.convertBoolToStrState(role.hoist))
            .setFooter(`Requested by ${message.author.tag}`);

        message.say(embed);
    }
};