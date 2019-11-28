"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_commando_1 = require("discord.js-commando");
class SayCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'say',
            group: 'misc',
            memberName: 'say',
            description: 'Sends a message as the bot',
            hidden: true,
            guildOnly: true,
            userPermissions: ['KICK_MEMBERS'],
            args: [
                {
                    key: 'text',
                    prompt: 'What would you like to say?',
                    type: 'string'
                }
            ]
        });
    }
    run(message, { text }) {
        message.delete();
        return message.say((text !== null && text !== void 0 ? text : 'No message sent.'));
    }
}
exports.default = SayCommand;
//# sourceMappingURL=say.js.map