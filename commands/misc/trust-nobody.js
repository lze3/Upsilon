const { Command } = require('discord.js-commando');

module.exports = class TrustNobody extends Command {
    constructor(client) {
        super(client, {
            name: 'trust-nobody',
            aliases: ['trust', 'tn'],
            group: 'misc',
            memberName: 'trust-nobody',
            description: 'Trust nobody, not even yourself.',
            clientPermissions: ['ATTACH_FILES'],
            throttling: {
                usages: 1,
                duration: 10
            }
        });
    }

    run(message) {
        return message.reply('trust nobody, not even yourself.', {
            file: '.\\images\\trust-nobody.jpg'
        });
    }
};