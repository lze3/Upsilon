const { Command } = require('discord.js-commando');
const bup = require('../../config');

module.exports = class ToggleLogs extends Command {
    constructor(client) {
        super(client, {
            name: 'toglogs',
            group: 'administration',
            memberName: 'toglogs',
            description: 'Toggles logging in case a log bot goes offline.',
            userPermissions: ['ADMINISTRATOR'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'state',
                    prompt: 'Enable or disable logging?',
                    type: 'boolean',
                    default: !bup.logging
                }
            ]
        });
    }

    run(message, { state }) {
        bup.toggleLogging(state);
        if (state) {
            message.reply('I have started logging things now.');
        }
        else {
            message.reply('I have stopped logging things.');
        }
    }
};