const { Command } = require('discord.js-commando');
const request = require('request');

const { RichEmbed } = require('discord.js');

const IP = '149.56.241.128';

const details = {
    's1': {
        port: '30123',
        name: 'Main Server'
    },
    's2': {
        port: '30124',
        name: 'Secondary Server'
    },
    'tr': {
        port: '30199',
        name: 'Training Server'
    }
};

let parsedData = [];
let playerData = [];

module.exports = class Status extends Command {
    constructor(client) {
        super(client, {
            name: 'players',
            group: 'information',
            memberName: 'players',
            description: 'Displays the player list for the specified FiveM server.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'server',
                    prompt: 'Which server would you like to see the players?',
                    type: 'string',
                    default: 's1',
                    oneOf: [
                        's1',
                        's2',
                        'tr'
                    ]
                }
            ]
        });
    }

    run(message, { server }) {
        const member = message.member || message.guild.fetchMember(message.author);
        const embedColor = member.colorRole ? member.colorRole.color : '#23E25D';

        // player information
        request.get(`http://${IP}:${details[server].port}/players.json`, {
            timeout: 2000
        }, function(error, _, body) {
            if (error) {
                const errorEmbed = new RichEmbed()
                    .setAuthor(`JusticeCommunityRP - ${details[server].name}`, message.guild.iconURL, 'https://discourse.jcrpweb.com')
                    .addField('Server IP', IP + ':' + details[server].port)
                    .addField('Status', 'Offline')
                    .setColor('#FF9C00')
                    .setTimestamp();

                return message.say(message.author, {
                    embed: errorEmbed
                });
            }

            try {
                playerData = JSON.parse(body);
            }
            catch(err) {
                return;
            }
        });

        // server information
        request.get(`http://${IP}:${details[server].port}/info.json`, {
            timeout: 2000
        }, function(error, _, body) {
            if (error) {
                return;
            }

            try {
                parsedData = JSON.parse(body);
            }
            catch(err) {
                const errorEmbed = new RichEmbed()
                    .setAuthor(`JusticeCommunityRP - ${details[server].name}`, message.guild.iconURL, 'https://discourse.jcrpweb.com')
                    .addField('Server IP', IP + ':' + details[server].port)
                    .addField('Status', 'Offline')
                    .setColor('#FF9C00')
                    .setTimestamp();

                return message.say(message.author, {
                    embed: errorEmbed
                });
            }

            const embed = new RichEmbed()
                .setAuthor(`JusticeCommunityRP - ${details[server].name}`, message.guild.iconURL, 'https://discourse.jcrpweb.com')
                .addField('Server IP', IP + ':' + details[server].port)
                .setTitle('Player count: ' + playerData.length + '/' + parsedData.vars.sv_maxClients)
                .setDescription(playerData.length > 0 ?
                    playerData.map(player => '**' + player.name + '**  |  ID: ``' + player.id + '``').join('\n') :
                    '**No players online.**')
                .setColor(embedColor)
                .setTimestamp();

            return message.say(message.author, {
                embed: embed
            });
        });
    }
};