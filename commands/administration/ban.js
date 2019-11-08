const { Command } = require('discord.js-commando');

const blockedRoles = ['586026320786489364'];

module.exports = class Ban extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            aliases: ['b', 'bean'],
            group: 'administration',
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
        // get the member from the user
        const member = message.guild.members.find(foundMember => foundMember.id === user.id);

        // delete the command entered by the user
        message.delete();

        // prevent kicking yourself
        if (user.id === message.author.id) {
            return message.reply('you can\'t ban yourself!', {
                file: '.\\images\\trust-nobody.jpg'
            });
        }

        if (member !== null) {
            for (let i = 0; i < blockedRoles.length; i++) {
                if (member.roles.has(blockedRoles[i])) {
                    return message.reply('I can\'t ban that user');
                }
            }
        }

        try {
            message.guild.members.ban(user.id);
        }
        catch(e) {
            console.log(e.stack);
            return message.say('Uh oh! Something went wrong, developer notified');
        }
        return message.say(`***${user.username}#${user.discriminator} was banned for ${reason}!***`);
    }
};