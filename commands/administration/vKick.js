const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const config = require('../../config');


module.exports = class vKick extends Command {
    constructor(client) {
        super(client, {
            name: 'voicechannelkick',
            aliases: ['vkick', 'vk'],
            group: 'administration',
            memberName: 'voicechannelkick',
            description: 'Kicks a member from a voice channel.',
            userPermissions: ['MOVE_MEMBERS'],
            clientPermissions: ['MOVE_MEMBERS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Which member would you like to move?',
                    type: 'member'
                }
            ]
        });
    }

    async run(message, { member }) {
        message.delete();
        if(!member.voiceChannel) return message.reply('You can only kick member who are in a voice channel.');
        const temp_channel = await message.guild.createChannel(member.id, 'voice', [
            { id: message.guild.id,
                deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'] },
            { id: member.id,
                deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'] }
        ]);
        await member.setVoiceChannel(temp_channel);
        temp_channel.delete();
        message.reply(member + ' was kick for the voice channel!');

        const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.avatarURL())
            .setDescription(member + ' was kick for a voice channel by ' + message.member)
            .setTimestamp()
            .setColor(config.embedColors.action);

        return this.client.channels.find(logC => logC.id === config.logChannels.member).send({ embed: embed });
    }
};