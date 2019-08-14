const { Command } = require('discord.js-commando');
const bup = require('../../config');

let curState = bup.logging;

module.exports = class ToggleLogs extends Command {
    constructor(client) {
        super(client, {
            name: 'toglogs',
            aliases: [],
            group: 'administration',
            memberName: 'toglogs',
            description: 'Toggles logging in case a log bot goes offline.',
            userPermissions: ['ADMINISTRATOR'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            hidden: true
        });
    }

    run(message) {
        bup.toggleLogging(!bup.logging);
        curState = bup.backupLogs;
        if (curState) {
            message.reply('I have started logging things now.');
        }
        else {
            message.reply('I have stopped logging things.');
        }
    }
};