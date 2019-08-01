const { Command } = require('discord.js-commando');

module.exports = class MemberCount extends Command {
    constructor(client) {
        super(client, {
            name: 'membercount',
            aliases: ['members', 'mc'],
            group: 'information',
            memberName: 'membercount',
            description: 'Returns the amount of members in this guild.'
        });
    }

    run(message) {
        return message.reply(`there are ${message.guild.memberCount.toLocaleString('en-US')} members in this guild.`);
    }
};