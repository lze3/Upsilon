const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config');


module.exports = class Kick extends Command {
    constructor(client) {
        super(client, {
            name: 'move',
            group: 'administration',
            memberName: 'move',
            description: 'Moves a member from a voice channel to another.',
            userPermissions: ['MOVE_MEMBERS'],
            clientPermissions: ['MOVE_MEMBERS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Which member would you like to move?',
                    type: 'member'
                },
                {
                    key: 'channel',
                    prompt: 'What channel do you want to move the member to?',
                    type: 'channel',
                    validate: channel => {
                        if(this.client.guilds.get('590837279216369694').channels.get(channel) && this.client.guilds.get('590837279216369694').channels.get(channel).type === 'voice') return true;
                        return 'You can only move a member to a voice channel. Please try again.';
                    }
                }
            ]
        });
    }

    run(message, { member, channel }) {
        if(member.voiceChannelID && channel.id === member.voiceChannelID) return message.reply('You cannot move a member to the same voice channel!');
        member.setVoiceChannel(channel);
        message.reply(member + ' was moved to ' + channel.name);

        const embed = new RichEmbed()
            .setAuthor(member.user.tag, member.user.avatarURL)
            .setDescription(member + ' was moved to ' + channel.name + ' by ' + message.member + '!')
            .setTimestamp()
            .setColor(config.embedColors.action);

        return this.client.channels.find(logC => logC.id === config.logChannels.member).send({ embed: embed });
    }
};