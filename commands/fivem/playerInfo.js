const { Command } = require('discord.js-commando');
const request = require('request');
const { MessageEmbed } = require('discord.js');
const config = require('../../config');

const IP = config.serverIp;

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
    },
    'temp': {
        port: '3014',
        name: 'Temporary Server'
    }
};

let playerData = [];

module.exports = class PlayerInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'playerinfo',
            group: 'information',
            memberName: 'playerinfo',
            description: 'Provides information about a player who is on the FiveM server.',
            clientPermissions: ['EMBED_LINKS'],
            userPermissions: ['MANAGE_MESSAGES'],
            examples: [
                '..playerinfo s1 43',
                '..playerinfo s2 5'
            ],
            args: [
                {
                    key: 'server',
                    prompt: 'Which server would you like to see the players?',
                    type: 'string',
                    default: 'temp',
                    oneOf: [
                        's1',
                        's2',
                        'tr',
                        'temp'
                    ]
                },
                {
                    key: 'playerId',
                    prompt: 'Which player would you like to get information for?',
                    type: 'integer'
                }
            ]
        });
    }

    async run(message, { server, playerId }) {
        let member = message.member;
        let embedColor = '#23E25D';
        if (message.guild) {
            member = message.member || message.guild.members.fetch(message.author);
            embedColor = member.roles.color ? member.roles.color.color : '#23E25D';
        }

        // remove the command entered by the user
        message.delete();

        // Error Embed for both Players and Server information request query
        const invalidPlayerEmbed = new MessageEmbed()
            .setAuthor(`Server Information - ${details[server].name}: Player Information (Player ID: ${playerId})`, message.guild.iconURL(), 'https://discourse.jcrpweb.com')
            .addField('Server IP', IP + ':' + details[server].port)
            .addField('Information', 'Could not obtain information for that player, please ensure the ID is valid.')
            .setColor('#FF9C00')
            .setTimestamp();

        const serverDownEmbed = new MessageEmbed()
            .setAuthor(`Server Information - ${details[server].name}: Player Information (Player ID: ${playerId})`, message.guild.iconURL(), 'https://discourse.jcrpweb.com')
            .addField('Server IP', IP + ':' + details[server].port)
            .addField('Status', 'Server offline :(')
            .setColor('#FF9C00')
            .setTimestamp();

        request.get(`http://${IP}:${details[server].port}/players.json`, {
            timeout: 2000
        }, function(err, response, body) {
            if (err) {
                return message.say(message.author, {
                    embed: serverDownEmbed
                });
            }

            try {
                playerData = JSON.parse(body);
            }
            catch(err) {
                return console.log(err.stack);
            }

            let playerInfo;
            for (let i = 0; i < playerData.length; i++) {
                if (playerData[i].id === playerId) {
                    playerInfo = playerData[i];
                    break;
                }
            }

            if (playerInfo) {
                const embed = new MessageEmbed()
                    .setAuthor(`Server Information - ${details[server].name}: Player Information (Player ID: ${playerId})`, message.guild.iconURL(), 'https://discourse.jcrpweb.com')
                    .addField('Player Name', playerInfo.name)
                    .addField('Identifiers', '```json\n' + playerInfo.identifiers.map(identifier => '"' + identifier + '"').join(',\n') + '```')
                    .addField('Ping', playerInfo.ping)
                    .setColor(embedColor)
                    .setTimestamp();

                return message.say(message.author, {
                    embed: embed
                });
            }
            else {
                return message.say(message.author, {
                    embed: invalidPlayerEmbed
                });
            }
        });


    }
};
