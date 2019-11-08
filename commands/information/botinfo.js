const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const ms = require('pretty-ms');
const config = require('../../config');

module.exports = class BotInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'botinfo',
            aliases: ['stats', 'philinfo'],
            group: 'misc',
            memberName: 'botinfo',
            description: 'Provides the user with information about the bot.',
            clientPermissions: ['EMBED_LINKS']
        });
    }

    run(message) {
        const member = message.member || message.guild.members.fetch(message.author);
        const embedColor = member.roles.color ? member.roles.color.color : '#23E25D';

        const logChannelName = (chId) => this.client.channels.find(channel => chId === channel.id).name;

        const embed = new MessageEmbed()
            .setTitle(`${message.guild.me.user.username}#${message.guild.me.user.discriminator} Information`)
            .addField('❯ Connectivity', `Ping: ${Math.floor(this.client.ping)}ms\nUptime: ${ms (this.client.uptime, { vosbose: true })}`)
            .addField('❯ Resources', `RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB'}`)
            .addField(
                '❯ Logging', 'Log Channels:\n' +
                `- Actions: #${logChannelName(config.logChannels.actions)}\n` +
                `- Members: #${logChannelName(config.logChannels.member)}\n` +
                `State: ${config.logging ? 'Enabled' : 'Disabled'} for ${this.client.user.tag}`)
            .setColor(embedColor);

        message.reply(embed);
    }
};