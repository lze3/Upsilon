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

    async run(message, { server, shorten }) {
        const embedColor = message.member.colorRole ? message.member.colorRole.color : '#23E25D';

        // remove the command entererd by the user
        message.delete();
        const serverDownEmbed = new RichEmbed() //Error Embed for both Players and Server information request query
            .setAuthor(`JusticeCommunityRP - ${details[server].name}`, message.guild.iconURL, 'https://discourse.jcrpweb.com')
            .addField('Server IP', IP + ':' + details[server].port)
            .addField('Status', 'Offline')
            .setColor('#FF9C00')
            .setTimestamp();

        request.get(`http://${IP}:${details[server].port}/players.json`, { //Player's data request query
            timeout: 2000
        }, function(error, _, playersBody) { //Player's data function
            if(error) {
                return message.say(message.author, {
                    embed: serverDownEmbed
                });
            }

            // server information
            request.get(`http://${IP}:${details[server].port}/info.json`, { //Server's data request query
                timeout: 2000
            }, function(error, _, serverBody) {  //Server's data function
                if (error) {
                    return message.say(message.author, {
                        embed: serverDownEmbed
                    });
                }

                try {  //Try function for both ServerData Parser and playersData Parser
                    var serverData = JSON.parse(serverBody);
                    var playerData = JSON.parse(playersBody);
                }
                catch(err) {
                    return message.reply(`An error occurred while running the command: \n\`${err.name}: ${err.message}\`\nYou shouldn't ever receive an error like this.\nPlease contact @DEVTEAMTAGHERE.`) && console.log(err);
                }
        
                const embed = new RichEmbed()
                .setAuthor(`JusticeCommunityRP - ${details[server].name}`, message.guild.iconURL, 'https://discourse.jcrpweb.com')
                .addField('Server IP', IP + ':' + details[server].port)
                .addField('Status', 'Online')
                .addField('Uptime', serverData.vars.Uptime)
                .addField('Players', playerData.length + ' | ' + serverData.vars.sv_maxClients)
                .addField('OneSync Enabled', serverData.vars.onesync_enabled)
                .setColor(embedColor)
                .setTimestamp();
    
    
                return message.say(message.author, {
                    embed: embed
                });
            });
        });
    }
};