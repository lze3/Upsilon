const { Command } = require('discord.js-commando');

module.exports = class SetRoleColor extends Command {
    constructor(client) {
        super(client, {
            name: 'setrolecol',
            aliases: ['src', 'setrc', 'setrolec'],
            group: 'administration',
            memberName: 'setrolecol',
            description: 'Sets the color of a role.',
            userPermissions: ['MANAGE_GUILD'],
            clientPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'role',
                    prompt: 'What role would you like to set the color for?',
                    type: 'role'
                },
                {
                    key: 'color',
                    prompt: 'What would you like to set the color to?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { role, color }) {
        try {
            role.setColor(color);
            message.reply(`I set the color of the \`${role.name}\` role to \`${role.color}\` (\`${color}\`).`);
        }
        catch(err) {
            console.log(err.stack);
            return message.reply('Uh oh, something went wrong. Developers notified.');
        }
    }
};