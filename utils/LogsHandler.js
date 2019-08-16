const Discord = require('discord.js');
const config = require('../config');
const logChannels = config.logChannels;
const embedColor = config.embedColors;
const nau = Date.now();
let roleCounter = 0;

// Messages
module.exports.messageDelete = (message) => {
    if(message.author.bot) return;
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.msgDelete)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setDescription(`**Message sent by ${message.author} was deleted in ${message.channel}\n Message Content: **\`\`${message.content}\`\``)
        .setFooter(`AUTHOR ID: ${message.author.id} | MESSAGE ID: ${message.id}`)
        .setTimestamp();
    return message.guild.channels.get(logChannels.actions).send(embed);
};

module.exports.messageUpdate = (oldMessage, newMessage) => {
    if(oldMessage.author.bot) return;
    if(oldMessage.content.toUpperCase() === newMessage.content.toUpperCase()) return;
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.msgEdit)
        .setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL)
        .setDescription(`**Message sent by ${oldMessage.author} was edited in ${oldMessage.channel}  \n  [jump to message](${newMessage.url})\n**`)
        .addField('⇢ Old Message', `\`\`${oldMessage}\`\``)
        .addField('⇢ New Message', `\`\`${newMessage}\`\``)
        .setFooter(`AUTHOR ID: ${oldMessage.author.id} | MESSAGE ID: ${oldMessage.id}`)
        .setTimestamp();
    return oldMessage.guild.channels.get(logChannels.actions).send(embed);
};

module.exports.messageReactionAdd = (messageReaction, user) => {
    if(user.bot) return;
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(user.tag, user.avatarURL)
        .setDescription(`**Message sent by ${messageReaction.message.author} was reacted by ${user} in ${messageReaction.message.channel}\n  [jump to message](${messageReaction.message.url})\n Reaction: **${messageReaction.emoji}`)
        .setFooter(`AUTHOR ID: ${user.id} | MESSAGE ID: ${messageReaction.message.id}`)
        .setTimestamp();
    return messageReaction.message.guild.channels.get(logChannels.actions).send(embed);
};

module.exports.messageReactionRemove = (messageReaction, user) => {
    if(user.bot) return;
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(user.tag, user.avatarURL)
        .setDescription(`**Reaction by ${user} was deleted in ${messageReaction.message.channel}\n  [jump to message](${messageReaction.message.url})\n Reaction: **${messageReaction.emoji}`)
        .setFooter(`AUTHOR ID: ${user.id} | MESSAGE ID: ${messageReaction.message.id}`)
        .setTimestamp();
    return messageReaction.message.guild.channels.get(logChannels.actions).send(embed);
};

module.exports.messageReactionRemoveAll = message => {
    if(message.author.bot) return;
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setDescription(`**Message sent by ${message.author} was cleared from reactions in ${message.channel}\n  [jump to message](${message.url})**`)
        .setFooter(`AUTHOR ID: ${message.author.id} | MESSAGE ID: ${message.id}`)
        .setTimestamp();
    return message.guild.channels.get(logChannels.actions).send(embed);
};

// Channels
module.exports.channelCreate = async (channel) => {
    const Audit = await channel.guild.fetchAuditLogs({ type:'CHANNEL_CREATE' });
    const audit = Audit.entries.first();
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(audit.executor.username + '#' + audit.executor.discriminator, channel.guild.members.get(audit.executor.id).user.avatarURL)
        .setDescription(`**A **\`\`#${channel.name}\`\`** ${channel.type === 'category' ? channel.type: channel.type + ' channel' } was created by ${channel.guild.members.get(audit.executor.id)} **`)
        .setFooter(`EXECUTOR ID: ${audit.executor.id} | CHANNEL ID: ${channel.id}`)
        .setTimestamp();
    return channel.guild.channels.get(logChannels.actions).send(embed);
};
module.exports.channelDelete = async (channel) => {
    const Audit = await channel.guild.fetchAuditLogs({ type:'CHANNEL_CREATE' });
    const audit = Audit.entries.first();
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(audit.executor.username + '#' + audit.executor.discriminator, channel.guild.members.get(audit.executor.id).user.avatarURL)
        .setDescription(`**A **\`\`#${channel.name}\`\`** ${channel.name}\`\`** ${channel.type === 'category' ? channel.type: channel.type + ' channel' } was deleted by ${channel.guild.members.get(audit.executor.id)} **`)
        .setFooter(`EXECUTOR ID: ${audit.executor.id} | CHANNEL ID: ${channel.id}`)
        .setTimestamp();
    return channel.guild.channels.get(logChannels.actions).send(embed);
};

module.exports.channelPinsUpdate = async (channel) => {
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setDescription(`**Pinned messages has been updated in ${channel}**`)
        .setFooter(`CHANNEL ID: ${channel.id}`)
        .setTimestamp();
    return channel.guild.channels.get(logChannels.actions).send(embed);
};

module.exports.channelUpdate = async (oldChannel, newChannel) => {
    const timeTriggered = nau;
    const embed = new Discord.RichEmbed();
    const Audit = await oldChannel.guild.fetchAuditLogs({ type:'CHANNEL_UPDATE' });
    const Audit1 = await oldChannel.guild.fetchAuditLogs({ type:'CHANNEL_OVERWRITE_UPDATE' });
    const Audit2 = await oldChannel.guild.fetchAuditLogs({ type:'CHANNEL_OVERWRITE_CREATE' });
    const Audit3 = await oldChannel.guild.fetchAuditLogs({ type:'CHANNEL_OVERWRITE_DELETE' });
    // if(!Audit.entries.first() && !Audit1.entries.first() && !Audit2.entries.first() && !Audit3.entries.first()) return;
    if(Audit.entries.first() && Audit.entries.first().createdTimestamp + 250 > timeTriggered) {
        const audit = Audit.entries.first();
        const changes = Audit.entries.first().changes;
        embed.setAuthor(audit.executor.username + '#' + audit.executor.discriminator, newChannel.guild.members.get(audit.executor.id).user.avatarURL);
        embed.setDescription(`**${oldChannel.guild.members.get(audit.executor.id)} has updated the ${oldChannel.type === 'category' ? oldChannel.type: oldChannel.type + ' channel' } \`\`${oldChannel.name}\`\`! **`);
        embed.setFooter(`EXECUTOR ID: ${audit.executor.id} | CHANNEL ID: ${oldChannel.id}`);
        embed.setColor(embedColor.action);
        changes.forEach(change => embed.addField('⇢ ' + change.key.toString().split('_').join(' '), `**Was:** ${change.old}\n**Now:** ${change.new}`, true));
        return oldChannel.guild.channels.get(logChannels.actions).send(embed);
    }
    else if(Audit1.entries.first() && Audit1.entries.first().createdTimestamp + 250 > timeTriggered) {
        const audit = Audit1.entries.first();
        embed.setAuthor(audit.executor.username + '#' + audit.executor.discriminator, newChannel.guild.members.get(audit.executor.id).user.avatarURL);
        if(!audit.extra.user) {
            embed.setDescription(`**${oldChannel.guild.members.get(audit.executor.id)} has updated a permission overwrite in the ${oldChannel.type === 'category' ? oldChannel.type: oldChannel.type + ' channel' } \`\`${oldChannel.name}\`\` channel for ${oldChannel.guild.roles.get(audit.extra.id)}! **`);
        }
        else {
            embed.setDescription(`**${oldChannel.guild.members.get(audit.executor.id)} has updated a permission overwrite in the  ${oldChannel.type === 'category' ? oldChannel.type: oldChannel.type + ' channel' } \`\`${oldChannel.name}\`\` channel for ${oldChannel.guild.members.get(audit.extra.user.id)}! **`);
        }
        embed.setFooter(`EXECUTOR ID: ${audit.executor.id} | CHANNEL ID: ${oldChannel.id}`);
        embed.setColor(embedColor.action);
        return oldChannel.guild.channels.get(logChannels.actions).send(embed);
    }
    else if(Audit2.entries.first() && Audit2.entries.first().createdTimestamp + 250 > timeTriggered) {
        const audit = Audit2.entries.first();
        embed.setAuthor(audit.executor.username + '#' + audit.executor.discriminator, newChannel.guild.members.get(audit.executor.id).user.avatarURL);
        if(!audit.extra.user) {
            embed.setDescription(`**${oldChannel.guild.members.get(audit.executor.id)} has created a permission overwrite in the ${oldChannel.type === 'category' ? oldChannel.type: oldChannel.type + ' channel' } \`\`${oldChannel.name}\`\` channel for ${oldChannel.guild.roles.get(audit.extra.id)}! **`);
        }
        else {
            embed.setDescription(`**${oldChannel.guild.members.get(audit.executor.id)} has created a permission overwrite in the ${oldChannel.type === 'category' ? oldChannel.type: oldChannel.type + ' channel' } \`\`${oldChannel.name}\`\` channel for ${oldChannel.guild.members.get(audit.extra.user.id)}! **`);
        }
        embed.setFooter(`EXECUTOR ID: ${audit.executor.id} | CHANNEL ID: ${oldChannel.id}`);
        embed.setColor(embedColor.action);
        return oldChannel.guild.channels.get(logChannels.actions).send(embed);
    }
    else if(Audit3.entries.first() && Audit3.entries.first().createdTimestamp + 250 > timeTriggered) {
        const audit = Audit3.entries.first();
        embed.setAuthor(audit.executor.username + '#' + audit.executor.discriminator, newChannel.guild.members.get(audit.executor.id).user.avatarURL);
        if(!audit.extra.user) {
            embed.setDescription(`**${oldChannel.guild.members.get(audit.executor.id)} has removed a permission overwrite in the ${oldChannel.type === 'category' ? oldChannel.type: oldChannel.type + ' channel' } \`\`${oldChannel.name}\`\` channel for ${oldChannel.guild.roles.get(oldChannel.guild.roles.get(audit.extra.id))}! **`);
        }
        else {
            embed.setDescription(`**${oldChannel.guild.members.get(audit.executor.id)} has removed a permission overwrite in the ${oldChannel.type === 'category' ? oldChannel.type: oldChannel.type + ' channel' } \`\`${oldChannel.name}\`\` channel for ${oldChannel.guild.members.get(audit.extra.user.id)}! **`);
        }
        embed.setFooter(`EXECUTOR ID: ${audit.executor.id} | CHANNEL ID: ${oldChannel.id}`);
        embed.setColor(embedColor.action);
        return oldChannel.guild.channels.get(logChannels.actions).send(embed);
    }
    else {
        return;
    }
};

// Bans
module.exports.guildBanAdd = async (guild, user) => {
    const Audit = await guild.fetchAuditLogs({ type:'MEMBER_BAN_ADD' });
    if(Audit.entries.first().target.id !== user.id) return;
    const audit = Audit.entries.first();
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.punitive)
        .setAuthor(user.tag, user.avatarURL)
        .setDescription(`**${user} has been banned by ${guild.members.get(audit.executor.id)}**`)
        .setFooter(`MOD ID: ${audit.executor.id} | USER ID: ${user.id}`)
        .setTimestamp();
    return guild.channels.get(logChannels.member).send(embed);
};

module.exports.guildBanRemove = async (guild, user) => {
    const Audit = await guild.fetchAuditLogs({ type:'MEMBER_BAN_REMOVE' });
    if(Audit.entries.first().target.id !== user.id) return;
    const audit = Audit.entries.first();
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(user.tag, user.avatarURL)
        .setDescription(`**${user} has been unbanned by ${guild.members.get(audit.executor.id)}**`)
        .setFooter(`MOD ID: ${audit.executor.id} | USER ID: ${user.id}`)
        .setTimestamp();
    return guild.channels.get(logChannels.member).send(embed);
};

// Members
module.exports.guildMemberAdd = async (member) => {
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(member.user.tag, member.user.avatarURL)
        .setDescription(`**${member} just joined the server!**`)
        .setFooter(`MEMBER ID: ${member.user.id}`)
        .setTimestamp();
    return member.guild.channels.get(logChannels.member).send(embed);
};

module.exports.guildMemberRemove = async (member) => {
    const Audit = await member.guild.fetchAuditLogs({ type:'MEMBER_KICK' });
    if(Audit.entries.first().createdTimestamp + 500 > nau) {
        const audit = Audit.entries.first();
        const embed = new Discord.RichEmbed()
            .setColor(embedColor.punitive)
            .setAuthor(member.user.tag, member.user.avatarURL)
            .setDescription(`**${member} has been kicked by ${member.guild.members.get(audit.executor.id)}**`)
            .setFooter(`MOD ID: ${audit.executor.id} | USER ID: ${member.user.id}`)
            .setTimestamp();
        return member.guild.channels.get(logChannels.member).send(embed);
    }
    else {
        const embed = new Discord.RichEmbed()
            .setColor(embedColor.action)
            .setAuthor(member.user.tag, member.user.avatarURL)
            .setDescription(`**${member} just left the server!**`)
            .setFooter(`MEMBER ID: ${member.user.id}`)
            .setTimestamp();
        return member.guild.channels.get(logChannels.member).send(embed);
    }
};

// Roles
module.exports.roleCreate = async (role) => {
    const Audit = await role.guild.fetchAuditLogs({ type:'ROLE_CREATE' });
    if(Audit.entries.first().target.id !== role.id) return;
    const audit = Audit.entries.first();
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(role.guild.members.get(audit.executor.id).user.tag, role.guild.members.get(audit.executor.id).user.avatarURL)
        .setDescription(`**${role.guild.members.get(audit.executor.id)} has been created the ${role} role**`)
        .setFooter(`MOD ID: ${audit.executor.id} | ROLE ID: ${role.id}`)
        .setTimestamp();
    return role.guild.channels.get(logChannels.actions).send(embed);
};

module.exports.roleDelete = async (role) => {
    const Audit = await role.guild.fetchAuditLogs({ type:'ROLE_DELETE' });
    const audit = Audit.entries.first();
    const embed = new Discord.RichEmbed()
        .setColor(embedColor.action)
        .setAuthor(role.guild.members.get(audit.executor.id).user.tag, role.guild.members.get(audit.executor.id).user.avatarURL)
        .setDescription(`**${role.guild.members.get(audit.executor.id)} has been deleted the \`\`${role.name}\`\` role**`)
        .setFooter(`MOD ID: ${audit.executor.id} | ROLE ID: ${role.id}`)
        .setTimestamp();
    return role.guild.channels.get(logChannels.actions).send(embed);
};

module.exports.roleUpdate = async (oldRole, newRole) => {
    roleCounter++;
    let roleCounterTester = roleCounter/2;
    const Audit = await oldRole.guild.fetchAuditLogs({ type:'ROLE_UPDATE' });
    const audit = Audit.entries.first();
    const changes = Audit.entries.first().changes;
    const embed = new Discord.RichEmbed()
        .setAuthor(oldRole.guild.members.get(audit.executor.id).user.tag, oldRole.guild.members.get(audit.executor.id).user.avatarURL)
        .setDescription(`**${oldRole.guild.members.get(audit.executor.id)} has updated the ${oldRole} role!**`)
        .setFooter(`EXECUTOR ID: ${audit.executor.id} | CHANNEL ID: ${oldRole.id}`)
        .setColor(embedColor.action);
    changes.forEach(change =>{
        if(change.key === 'color') {
            let changee;
            let changee2;
            if(change.old < 1) {
                changee = '#default';
            }
            else {
                changee = '#' + change.old.toString(16);
            }
            if(change.new < 1) {
                changee2 = '#default';
            }
            else {
                changee2 = '#' + change.new.toString(16);
            }
            embed.addField('⇢ color', `**Was:** ${changee}\n**Now:** ${changee2}`, true);
        }
        else {
            embed.addField('⇢ ' + change.key.toString().split('_').join(' '), `**Was:** ${change.old}\n**Now:** ${change.new}`, true);
        }
    });
    return oldRole.guild.channels.get(logChannels.actions).send(embed);
};