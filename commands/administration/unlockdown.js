const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const config = require('../../config');

module.exports = class Unlockdown extends Command {
    constructor(client) {
        super(client, {
            name: 'unlockdown',
            aliases: ['unlock', 'uld'],
            group: 'administration',
            memberName: 'unlockdown',
            description: 'Unlocks a text channel or all channels in a category.',
            userPermissions: ['MANAGE_CHANNELS'],
            clientPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
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
        message.delete();
        const _role = message.guild.roles.get(message.guild.id);
        if (channel.type === 'category') {
            const children = channel.children;
            children.forEach(child => {
                if(child.type === 'voice') return message.reply('I cannot unlock that channel, it is a voice channel!');
                console.log(child.permissionsFor(_role).FLAGS);
                child.overwritePermissions(_role, {
                    SEND_MESSAGES: null
                });
                console.log('Unlocked channel [ ' + child.name + ' ].');
                console.log(child);
                child.send('🔓 This channel was locked by ' + message.member.displayName);
            });
            const embed = new MessageEmbed()
                .setAuthor('Lockdown End | ' + message.author.tag, message.author.avatarURL)
                .setDescription(`Category ${channel.name} has been unlocked.`)
                .setColor(config.embedColors.action)
                .addField('Reason', reason)
                .setTimestamp();
            this.client.channels.find(logC => logC.id === config.logChannels.actions).send({ embed: embed });
        }
        else if (channel.type === 'text') {
            channel.overwritePermissions(_role, {
                SEND_MESSAGES: null
            });
            console.log('Unlocked channel [ ' + channel.name + ' ].');
            const embed = new MessageEmbed()
                .setAuthor('Lockdown End | ' + message.author.tag, message.author.avatarURL)
                .setDescription(`Channel ${channel.name} has been unlocked.`)
                .setColor(config.embedColors.action)
                .addField('Reason', reason)
                .setTimestamp();
            this.client.channels.find(logC => logC.id === config.logChannels.actions).send({ embed: embed });
            return message.guild.channels.get(channel.id).send('🔓 This channel was unlocked by ' + message.member.displayName);

        }
        else {
            return message.reply('you need to provide a text channel or a category to unlock.');
        }
    }
};