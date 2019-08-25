const { Command } = require('discord.js-commando');

module.exports.states = [
    {
        aliases: [
            'wip',
            'indev',
            'bwo'
        ],
        emoji: '📝'
    },
    {
        aliases: [
            'remove',
            'nothappening',
            'del',
            'deny',
            'reject'
        ],
        emoji: '🚫'
    },
    {
        aliases: [
            'done',
            'completed'
        ],
        emoji: '✅'
    }
];

module.exports = class Suggestion extends Command {
    constructor(client) {
        super(client, {
            name: 'suggestion',
            group: 'misc',
            memberName: 'suggestion',
            description: 'Marks a suggestion as a specified state.',
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'messageId',
                    prompt: 'The ID of the suggestion.',
                    type: 'message'
                },
                {
                    key: 'state',
                    prompt: 'What state would you like to mark this suggestion as?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { messageId, state }) {
        if (!message.member.roles.find(role => role.id === '541494735186165770')) {
            return message.reply('you cannot run that command.');
        }

        let foundState;

        this.states.forEach(_state => {
            _state.aliases.forEach(alias => {
                if (state.toUpperCase() === alias.toUpperCase()) {
                    foundState = _state;
                }
            });
        });

        if (foundState !== undefined) {
            messageId.react(foundState.emoji);
        }
    }
};