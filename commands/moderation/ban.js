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
            hidden: true,
            args: [
                {
                    key: 'user',
                    prompt: 'Which user would you like to ban?',
                    type: 'user'
                },
                {
                    key: 'reason',
                    prompt: 'Why would you like to ban this member?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { user, reason }) {

        // delete the command entered by the user
        message.delete();

        // prevent kicking yourself
        if (user.id === message.author.id) {
            return message.say('you can\'t ban yourself!', {
                file: '.\\images\\trust-nobody.jpg'
            });
        }

        try {
            message.guild.ban(user, reason);
        }
        catch(e) {
            console.log(e.toString());
            return message.say('Uh oh! Something went wrong, developer notified');
        }
        return message.say(`***${user.username}#${user.discriminator} was banned for ${reason}!***`);
    }
};