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
            hidden: true,
            args: [
                {
                    key: 'user',
                    prompt: 'Which user would you like to unban?',
                    type: 'user'
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

    run(message, { user, reason }) {

        // delete the command entered by the user
        message.delete();

        try {
            message.guild.unban(user, reason);
        }
        catch(e) {
            console.log(e.toString());
            return message.say('Uh oh! Something went wrong, developer notified');
        }

        return message.say(`***${user.username}#${user.discriminator} was unbanned${reason === 'No reason provided.' ? '.' : ' for ' + reason}***`);
    }
};