const { Command } = require('discord.js-commando');

module.exports = class Purge extends Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            aliases: ['prune', 'bulkdel'],
            group: 'administration',
            memberName: 'purge',
            description: 'Bulk deletes a specific amount of messages.',
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'amount',
                    prompt: 'How many messages would you like to delete? **(Max 100)**',
                    type: 'integer',
                    validate: int => int < 101 && int > 0
                }
            ]
        });
    }

    run(message, { amount }) {
        message.delete();

        message.channel.bulkDelete(amount)
            .then(bulkDeleted => message.reply(`I deleted ${bulkDeleted.size} message${bulkDeleted.size > 1 ? 's' : ''} for you.`))
            .catch(err => message.reply('I couldn\'t purge those messages.') & console.log(err.stack));
    }
};