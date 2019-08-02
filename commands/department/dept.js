const { Command } = require('discord.js-commando');

const roles = {
    LE: [
        '539440275269877763'
    ],

    FR: [
        '539440241761714177'
    ],

    LSSD: [
        '539445634789408778'
    ]
};

module.exports = class Department extends Command {
    constructor(client) {
        super(client, {
            name: 'dept',
            aliases: ['department'],
            group: 'department',
            memberName: 'department',
            description: 'Adds department roles to a specified user.',
            userPermissions: ['MANAGE_NICKNAMES'],
            clientPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Which member would you like to add to a department?',
                    type: 'member'
                },
                {
                    key: 'department',
                    prompt: 'Which department would you like to add this member to?',
                    type: 'string',
                    oneOf: [
                        'lssd',
                        'lspd',
                        'sahp',
                        'sacd',
                        'lsfd'
                    ]
                }
            ]
        });
    }

    run(message, { member, department }) {
        department = department.toString().toUpperCase();
        if (roles[department] !== undefined) {
            message.say(roles[department]);
            message.say(`${message.guild.roles.get(role => role.id === roles[department]).name}`);
        }
    }
};