require('dotenv').config({
    path: __dirname + '/.env'
});

const { AkairoClient } = require('discord-akairo');
const client = new AkairoClient({
    ownerID: '264662751404621825',
    prefix: 'u!',
    commandDirectory: './commands/',
    listenerDirectory: './listeners/',
    handleEdits: true,
    blockBots: true,
    automateCategories: true
}, {
    disableEveryone: true
});

client.login(process.env['token']);

client.on('warn', console.warn);
client.on('error', console.error);
if (process.env['debug'] === 'true') {
    client.on('debug', console.log);
}