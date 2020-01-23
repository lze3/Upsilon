/* eslint-disable no-shadow */
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class MemberCount extends Command {
    constructor(client) {
        super(client, {
            name:  'serverinfo',
            aliases:  ['server', 'si'],
            group:  'information',
            memberName:  'serverinfo',
            description:  'Returns the current discord server\'s details.'
        });
    }

    run(message) {
        const member = message.member || message.guild.members.fetch(message.author);
        const embedColor = member.roles.color ? member.roles.color.color : '#23E25D';
        const serverEmbed = new MessageEmbed()
            .setAuthor(message.guild.name, message.guild.avatarURL())
            .setDescription('Detailed Information of ' + message.guild.name)
            .addField('❯ Owner', `Username: ${message.guild.owner.user.tag}\nID: ${message.guild.owner.user.id}`)
            .addField('❯ Roles', `Total Roles: ${message.guild.roles.filter(role => role.id !== message.guild.id).size}\nAdmin Roles: ${message.guild.roles.filter(role => role.id !== message.guild.id && role.hasPermission('ADMINISTRATOR')).size}\nNon-Admin Roles: ${message.guild.roles.filter(role => role.id !== message.guild.id && !role.hasPermission('ADMINISTRATOR')).size} `)
            .addField('❯ Channels', `Total Channels: ${message.guild.channels.filter(channel => channel.type !== 'category').size}\nTotal Categories: ${message.guild.channels.filter(channel => channel.type === 'category').size}\nVoice Channels: ${message.guild.channels.filter(channel => channel.type === 'voice').size}\nText Channels: ${message.guild.channels.filter(channel => channel.type === 'text').size}`)
            .addField('❯ Members', `Total Members: ${message.guild.memberCount}` /* \nThe Collective: ${message.guild.members.filter(member => member.roles.get('586026320786489364')).size}\nAdministrators: ${message.guild.members.filter(member => member.roles.get('539450716629106698')).size}\nLos Santos Police Department: ${message.guild.members.filter(member => member.roles.get('539442941148659733')).size}\nLos Santos Sheriff's Department: ${message.guild.members.filter(member => member.roles.get('539445634789408778')).size}\nSan Andreas Highway Patrol: ${message.guild.members.filter(member => member.roles.get('539446995111378945')).size}` */)
            .setColor(embedColor);

        message.reply(serverEmbed);
    }
};
