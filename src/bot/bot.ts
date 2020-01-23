import * as colors from 'colors';
import { TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { join } from 'path';
import { version } from 'typescript';
import 'typescript';
import './lib/env';
import './utils/function';
import './utils/server-status-tracking';
import * as Sentry from '@sentry/node';
// import { RewriteFrames } from '@sentry/integrations';

Sentry.init({
    dsn: process.env.SENTRY_URL,
    /*
    integrations: [new RewriteFrames({
        root: global.__rootdir__
    })]
    */
});

colors.setTheme({
    debug: 'cyan',
    error: 'red',
    success: 'green',
    warn: 'yellow'
});


export const client = new CommandoClient({
    commandPrefix: process.env.PREFIX ?? 'p.',
    invite: 'https://discord.gg/EqC2wFf',
    owner: '264662751404621825'
});

client
    .on('error', console.error)
    .on('warn', console.warn)
    .once('ready', () => {
        console.log(`Logged in as ${client.user?.tag}! (${client.user?.id})`.green);
        console.log(`Prefix is set to: ${client.commandPrefix}`.cyan);
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
        .registerCommandsIn(join(__dirname, 'commands'));

client.login(process.env.BOT_TOKEN);

/*
declare global {
    namespace NodeJS {
        // tslint:disable-next-line: interface-name
        interface Global {
            __rootdir__: string;
        }
    }
}

global.__rootdir__ = __dirname || process.cwd();
*/