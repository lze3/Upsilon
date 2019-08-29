const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            eventName: 'ready'
        });
    }

    exec() {
        console.log(`Logged in as ${this.client.user.tag} (${this.client.user.id})!`);
    }
}

module.exports = ReadyListener;