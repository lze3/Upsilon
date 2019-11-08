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

let serverData = [];
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
                    default: 'temp',
                    oneOf: [
                        's1',
                        's2',
                        'tr',
                        'temp'
                    ]
                }
            ]
        });
    }

    async run(message, { server }) {
        const member = message.member || message.guild.members.fetch(message.author);
        const embedColor = member.roles.color ? member.roles.color.color : '#23E25D';

        // remove the command entererd by the user
        message.delete();

        // Error Embed for both Players and Server information request query
        const serverDownEmbed = new MessageEmbed()
            .setAuthor(`JusticeCommunityRP - ${details[server].name}`, message.guild.iconURL(), 'https://discourse.jcrpweb.com')
            .addField('Server IP', IP + ':' + details[server].port)
            .addField('Status', 'Offline')
            .setColor('#FF9C00')
            .setTimestamp();

        // Player's data function
        request.get(`http://${IP}:${details[server].port}/players.json`, {
            timeout: 2000
        }, function(error, _, playersBody) {
            if(error) {
                return message.reply({ embed: serverDownEmbed });
            }

            // server information
            request.get(`http://${IP}:${details[server].port}/info.json`, {
                timeout: 2000
            }, function(_error, __, serverBody) {
                if (_error) {
                    return message.reply({ embed: serverDownEmbed });
                }

                // Try function for both ServerData Parser and playersData Parser
                try {
                    serverData = JSON.parse(serverBody);
                    playerData = JSON.parse(playersBody);
                }
                catch(err) {
                    return message.reply(`An error occurred while running the command: \n\`${err.name}: ${err.message}\`\nYou shouldn't ever receive an error like this.\nPlease contact @DEVTEAMTAGHERE.`) && console.log(err.stack);
                }

                const embed = new MessageEmbed()
                    .setAuthor(`JusticeCommunityRP - ${details[server].name}`, message.guild.iconURL(), 'https://discourse.jcrpweb.com')
                    .addField('Server IP', IP + ':' + details[server].port)
                    .addField('Status', 'Online')
                    .addField('Uptime', serverData.vars.Uptime)
                    .addField('Players', playerData.length + ' | ' + serverData.vars.sv_maxClients)
                    .addField('OneSync Enabled', serverData.vars.onesync_enabled)
                    .setColor(embedColor)
                    .setTimestamp();

                if (serverData.vars.rpArea !== undefined) {
                    embed.addField('AOP', serverData.vars.rpArea);
                }

                return message.reply({ embed: embed });
            });
        });
    }
};