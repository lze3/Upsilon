const { Command } = require('discord.js-commando');

module.exports = class Kick extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            aliases: ['k'],
            group: 'moderation',
            memberName: 'kick',
            description: 'Kicks a user from the guild.',
            userPermissions: ['KICK_MEMBERS'],
            clientPermissions: ['KICK_MEMBERS'],
            args: [
                {
                    key: 'member',
                    prompt: 'Which member would you like to kick?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'Why would you like to kick this member?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { member, reason }) {
        try {
            // member.kick(reason);
        }
        catch (e) {
            console.log(e.toString());
        }
        return message.reply(`successfully kicked ${member.user.username} for ${reason}`);
    }
};