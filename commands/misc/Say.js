const { Command } = require('discord.js-commando');

module.exports = class Say extends Command {
    constructor(client) {
        super(client, {
            name: 'say',
            group: 'misc',
            memberName: 'say',
            description: 'Say a message as the bot.',
            hidden: true,
            guildOnly: true,
            userPermissions: ['KICK_MEMBERS'],
            args: [
                {
                    key: 'text',
                    prompt: 'What would you like to say?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { text }) {
        message.delete();

        message.say(text);
    }
};