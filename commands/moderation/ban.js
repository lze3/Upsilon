const { Command } = require('discord.js-commando');

module.exports = class Ban extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            aliases: ['b', 'bean'],
            group: 'moderation',
            memberName: 'ban',
            description: 'Bans a user from the guild.',
            userPermissions: ['BAN_MEMBERS'],
            clientPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Which member would you like to ban?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'Why would you like to ban this member?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { member, reason }) {
        try {
            // member.ban(reason);
        }
        catch(e) {
            console.log(e.toString());
        }
        return message.say(`***${member.user.username} was banned for ${reason}!***`);
    }
};