"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_commando_1 = require("discord.js-commando");
class UserInfo extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'userinfo',
            group: 'admin',
            memberName: 'uinfo',
            description: 'Returns information about a specific user',
            args: [
                {
                    key: 'user',
                    prompt: 'Which user whould you like to display information for?',
                    type: 'user',
                    default: (m) => m.author
                }
            ]
        });
    }
    run(message, { text }) {
        return message.say('smiley');
    }
}
exports.default = UserInfo;
//# sourceMappingURL=userinfo.js.map