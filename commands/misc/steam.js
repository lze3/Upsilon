const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const steamAPI = require('steamapi');
const steam = new steamAPI('74B4B0F5DE97280AE5090F379DB24799');
const functs = require('../../utils/Functions');
const converter = require('hex2dec');


module.exports = class Kick extends Command {
    constructor(client) {
        super(client, {
            name: 'steam',
            group: 'administration',
            memberName: 'steam',
            description: 'Obtains steam information from a steam URL .',
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: '_steam',
                    prompt: 'What is the steam URL for the user\'s profile?',
                    type: 'string',
                    validate: text => {
                        if(text.includes('https://steamcommunity.com/id/') || text.includes('https://steamcommunity.com/profiles/') || text.length > 16 && text.length < 18) return true;
                        return 'Invalid steam profile link provided. Please try again.';
                    }
                }
            ]
        });
    }

    async run(message, { _steam }) {
        message.delete();
        if(_steam.includes('https://steamcommunity.com/id/') || _steam.includes('https://steamcommunity.com/profiles/')) {
            const member = message.member || message.guild.fetchMember(message.author);
            const embedColor = member.colorRole ? member.colorRole.color : '#23E25D';
            steam.resolve(_steam).then(id => {
                steam.getUserBans(id).then(bans => {
                    steam.getUserSummary(id).then(raw => {
                        let state;
                        if(raw.visibilityState > 0 && raw.visibilityState < 2) {
                            state = 'Private';
                        }
                        else if(raw.visibilityState > 1 && raw.visibilityState < 3) {
                            state = 'Friends Only';
                        }
                        else{
                            state = 'Public';
                        }
                        const hex = functs.convertDecToHex(parseInt);
                        message.channel.send(new RichEmbed()
                            .addField('Steam Profile Link', `[Click Here](${_steam})`)
                            .addField('Steam64 ID', id, true)
                            .addField('SteamHex ID', converter.decToHex(id).toString().toUpperCase().slice(2), true)
                            .addField('Nickname', raw.nickname, true)
                            .addField('Visibility State', state, true)
                            .addField('VAC Banned', bans.vacBanned ? 'Yes' : 'No', true)
                            .setColor(embedColor)
                            .setThumbnail(raw.avatar.large)
                            .setTimestamp()
                        );
                    });
                });
            });
        }
        else {
            const member = message.member || message.guild.fetchMember(message.author);
            const embedColor = member.colorRole ? member.colorRole.color : '#23E25D';
            steam.getUserBans(_steam).then(bans => {
                steam.getUserSummary(_steam).then(raw => {
                    let state;
                    if (raw.visibilityState > 0 && raw.visibilityState < 2) {
                        state = 'Private';
                    }
                    else if (raw.visibilityState > 1 && raw.visibilityState < 3) {
                        state = 'Friends Only';
                    }
                    else {
                        state = 'Public';
                    }

                    // eslint-disable-next-line no-inline-comments
                    const hex = functs.convertDecToHex(parseInt(_steam));
                    console.log(_steam + ' -> ' + hex);
                    message.channel.send(new RichEmbed()
                        .addField('Steam Profile Link', `[Click Here](https://steamcommunity.com/profiles/${_steam})`)
                        .addField('Steam64 ID', _steam, true)
                        .addField('SteamHex ID', converter.decToHex(_steam).toString().toUpperCase().slice(2), true)
                        .addField('Nickname', raw.nickname, true)
                        .addField('Visibility State', state, true)
                        .addField('VAC Banned', functs.convertBoolToStrState(bans.vacBanned), true)
                        .setColor(embedColor)
                        .setThumbnail(raw.avatar.large)
                        .setTimestamp()
                    );
                });
            });
        }
    }
};