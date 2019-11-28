"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/env");
const discord_js_commando_1 = require("discord.js-commando");
const colors = require("colors");
const path_1 = require("path");
require("typescript");
const typescript_1 = require("typescript");
colors.setTheme({
    success: 'green',
    error: 'red',
    warn: 'yellow',
    debug: 'cyan'
});
const prefix = 'p.';
const client = new discord_js_commando_1.CommandoClient({
    commandPrefix: prefix,
    owner: '264662751404621825',
    invite: 'https://discord.gg/EqC2wFf'
});
client
    .on('error', console.error)
    .on('warn', console.warn)
    .once('ready', () => {
    var _a, _b, _c;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}! (${(_b = client.user) === null || _b === void 0 ? void 0 : _b.id})`.green);
    console.log(`Prefix is set to: ${prefix}`.cyan);
    (_c = client.user) === null || _c === void 0 ? void 0 : _c.setActivity(`Running TypeScript version ${typescript_1.version}!`);
})
    .registry
    .registerDefaultTypes()
    .registerGroups([
    ['misc', 'Miscellaneous commands that don\'t fit in other groups.'],
    ['information', 'Commands that provide useful information to the user.'],
    ['admin', 'Commands to help administration give out information and perform their tasks more easily.'],
    ['fivem', 'Commands that are related to FiveM.']
])
    .registerDefaultGroups()
    .registerDefaultCommands({
    help: false
})
    .registerCommandsIn(path_1.join(__dirname, 'commands'));
client.login(process.env['BOT_TOKEN']);
//# sourceMappingURL=bot.js.map