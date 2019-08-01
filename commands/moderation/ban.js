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

        // prevent kicking yourself
        if (member.user.id === message.author.id) {
            return message.say('you can\'t ban yourself!', {
                file: '.\\images\\trust-nobody.jpg'
            });
        }

        try {
            message.guild.ban(member, reason);

            // delete the command entered by the user
            message.delete();
        }
        catch(e) {
            console.log(e.toString());
            return message.say('Uh oh! Something went wrong, developer notified');
        }
        return message.say(`***${member.user.username} was banned for ${reason}!***`);
    }
};