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

let serverData = [];
let playerData = [];

module.exports = class Status extends Command {
    constructor(client) {
        super(client, {
            name: 'players',
            group: 'information',
            memberName: 'players',
            description: 'Displays the player list for the specified FiveM server.',
            clientPermissions: ['EMBED_LINKS'],
            examples: [
                '..players s1 false',
                '..players s2',
                '..players'
            ],
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
                },
                {
                    key: 'shorten',
                    prompt: 'Would you like to shorten the output?',
                    type: 'boolean',
                    default: false
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
    
                let sortedPlayers = playerData.map(key => ({ id: key.id, name: key.name })).sort((first, second) => (first.id < second.id) ? -1 : (first.id > second.id) ? 1 : 0 ); //Sorting server players by thier unique In-Game ID
    
                const embed = new RichEmbed()
                    .setAuthor(`JusticeCommunityRP - ${details[server].name}`, message.guild.iconURL, 'https://discourse.jcrpweb.com')
                    .setDescription(shorten ? sortedPlayers.length > 0 ? sortedPlayers.map(sp => sp.name).join("\n") : "No players found!" : sortedPlayers.length > 0 ? sortedPlayers.map(sp => "**ID." + sp.id + "**: " + sp.name).join("\n") : "No players found!")
                    .addField('Join Server',"<fivem://connect/" + IP + ':' + details[server].port + "/>")
                    .setTitle('Player count: ' + playerData.length + '/' + serverData.vars.sv_maxClients)
                    .setColor(embedColor)
                    .setTimestamp();
    
    
    
                return message.say(message.author, {
                    embed: embed
                });
            });
        });
    }
};