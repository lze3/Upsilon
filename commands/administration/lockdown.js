const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config');

module.exports = class lockdown extends Command {
    constructor(client) {
        super(client, {
            name: 'lockdown',
            aliases: ['lock', 'ld'],
            group: 'administration',
            memberName: 'lockdown',
            description: 'Locks a text channel or all channel of a category.',
            userPermissions: ['MANAGE_CHANNELS'],
            clientPermissions: ['MANAGE_CHANNELS'],
            guildOnly: null,
            hidden: null,
            args: [
                {
                    key: 'channel',
                    prompt: 'Which channel do you want to lock?',
                    type: 'channel'
                },
                {
                    key: 'reason',
                    prompt: 'Why are you locking?',
                    type: 'string',
                    default:'No reason provided!'
                }
            ]
        });
    }

    run(message, { channel, reason }) {
        const _role = message.guild.roles.get(message.guild.id);
        if (channel.type === 'category') {
            const children = channel.children;
            children.forEach(child => {
                if(child.type === 'voice') return;
                child.overwritePermissions(_role, {
                    SEND_MESSAGES: false
                });
                console.log('Locked channel [ ' + child.name + ' ].');
                child.send('🔒 This channel was locked by ' + message.member.displayName);
            });
            const embed = new RichEmbed()
                .setAuthor('Lockdown Start | ' + message.author.tag, message.author.avatarURL)
                .setDescription(`Category ${channel.name} has been locked.`)
                .setColor(config.embedColors.action)
                .addField('Reason', reason)
                .setTimestamp();
            this.client.channels.find(logC => logC.id === config.logChannels.channel).send({ embed: embed });
        }
        else if (channel.type === 'text') {
            channel.overwritePermissions(_role, {
                SEND_MESSAGES: false
            });
            console.log('Locked channel [ ' + channel.name + ' ].');
            const embed = new RichEmbed()
                .setAuthor('Lockdown  | ' + message.author.tag, message.author.avatarURL)
                .setDescription(`Channel ${channel.name} has been locked.`)
                .setColor(config.embedColors.action)
                .addField('Reason', reason)
                .setTimestamp();
            this.client.channels.find(logC => logC.id === config.logChannels.channel).send({ embed: embed });
            return message.guild.channels.get(channel.id).send('🔒 This channel was locked by ' + message.member.displayName);
        }
        else {
            return message.reply('you need to provide a text channel or a category to lock.');
        }
    }
};