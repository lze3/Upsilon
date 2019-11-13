const { Command } = require('discord.js-commando');
const info = require('../../utils/ServerStatTracking');

module.exports = class StatusLoop extends Command {
    constructor(client) {
        super(client, {
            name: 'lpstatus',
            group: 'fivem',
            memberName: 'lpstatus',
            description: 'Continiously updates an embed with updated server information.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'state',
                    prompt: 'Enable or disable this feature.',
                    type: 'boolean'
                }
            ]
        });
    }

    run(message, { state }) {
        if (!state || typeof state !== 'boolean') {
            return info.setStatus(!info.status);
        }
        return info.setStatus(state);
    }
};
