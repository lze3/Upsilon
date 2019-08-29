const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');

class ServerInfo extends Command {
    constructor() {
        super('serverinfo', {
            description: 'Shows information about this guild',
            aliases: [
                'sinfo',
                'si'
            ]
        });
    }

    exec(message) {
        const embed = new RichEmbed();
    }
}

module.exports = ServerInfo;