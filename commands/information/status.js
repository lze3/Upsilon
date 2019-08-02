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
            name: 'status',
            group: 'information',
            memberName: 'status',
            description: 'Obtains the status for the specified FiveM server.',
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            args: [
                {
                    key: 'server',
                    prompt: 'Which server would you like to get the status for?',
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

    async run(message, { server }) {
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
                console.log(err.stack);
            }
        });

        // server information
        request.get(`http://${IP}:${details[server].port}/info.json`, {
            timeout: 2000
        }, function(error, _, body) {
            if (error) {
                console.log(error.stack);
            }

            try {
                parsedData = JSON.parse(body);
            }
            catch(err) {
                console.log(err.stack);

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
                .addField('Status', 'Online')
                .addField('Uptime', parsedData.vars.Uptime)
                .addField('Players', playerData.length + ' | ' + parsedData.vars.sv_maxClients)
                .addField('OneSync Enabled', parsedData.vars.onesync_enabled)
                .setColor(embedColor)
                .setTimestamp();

            return message.say(message.author, {
                embed: embed
            });
        });
    }
};