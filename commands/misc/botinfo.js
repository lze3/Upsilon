const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const ms = require('pretty-ms');


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
        const member = message.member || message.guild.fetchMember(message.author);
        const embedColor = member.colorRole ? member.colorRole.color : '#23E25D';
        const embed = new RichEmbed()
            .setTitle(`${message.guild.me.user.username}#${message.guild.me.user.discriminator} Information`)
            .addField('⏵Connectivity', `Ping: ${this.client.ping}\nUptime: ${ms (this.client.uptime, { vosbose: true })}`)
            .addField('⏵Resources', `RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB'}`, true)
            .setColor(embedColor);

        message.reply(embed);
    }
};