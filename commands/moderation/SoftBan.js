const { Command } = require('discord.js-commando');

module.exports = class SoftBan extends Command {
    constructor(client) {
        super(client, {
            name: 'softban',
            aliases: ['sb', 'sban'],
            group: 'moderation',
            memberName: 'softban',
            description: 'Bans a user then immediately unbans to clear their last messages.',
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
        // get the message from user
        const member = message.guild.member.find(m => m.id === user.id);

        message.delete();

        if (user.id === message.author.id) {
            return message.reply('you cannot ban yourself.');
        }

        try {
            member.ban({
                days: 31,
                reason: reason
            });

            message.guild.unban(user, 'Softbanned by ' + message.author.tag).then(() => {
                message.channel.send(`***${user.username}#${user.discriminator} was soft-banned for ${reason}!***`);
            });
        }
        catch(err) {
            console.log(err.stack);
            return message.reply('Uh oh! Something went wrong, notifying the developers.');
        }
    }

};