const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

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
        const embed = new RichEmbed()
            .setTitle(`${message.guild.me.user.username}#${message.guild.me.user.discriminator} Information`)
            .addField('Ping', this.client.ping)
            .addField('RAM Usage', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB');

        message.reply(embed);
    }
};