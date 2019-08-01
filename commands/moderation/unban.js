const { Command } = require('discord.js-commando');

module.exports = class Unban extends Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            aliases: ['ub', 'unbean'],
            group: 'moderation',
            memberName: 'unban',
            description: 'Unbans a user from the guild.',
            userPermissions: ['BAN_MEMBERS'],
            clientPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Which member would you like to unban?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'Why are you unbanning this user?',
                    type: 'string',
                    default: 'No reason provided.'
                }
            ]
        });
    }

    run(message, { member, reason }) {
        try {
            message.guild.unban(member, reason);
        }
        catch(e) {
            console.log(e.toString());
            return message.say('Uh oh! Something went wrong, developer notified');
        }

        return message.say(`***${member.user.username} was unbanned${reason === 'No reason provided.' ? '.' : ' for ' + reason}***`);
    }
};