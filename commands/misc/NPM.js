const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

const _class = class NPM extends Command {
    constructor(client) {
        super(client, {
            name: 'npm',
            aliases: ['npm-package'],
            group: 'misc',
            memberName: 'npm-doc',
            description: 'Responds with information on an NPM package.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'pkg',
                    type: 'string',
                    prompt: 'What would you like to search for?'
                }
            ]
        });
    }

    async run(message, { pkg }) {
        const res = await fetch(`https://registry.npmjs.com/${pkg}`);
        if (res.status === 404) {
            return message.reply('I could not find the requested information. Maybe look for something that actually exists next time!');
        }

        const body = await res.json();
        if (body.time.unpublished) {
            return message.reply('whoever was the Commander of this package decided to unpublish it, what a fool.');
        }

        const version = body.versions[body['dist-tags'].latest];
        const maintainers = _trimArray(body.maintainers.map((user) => user.name));
        const dependencies = version.dependencies ? _trimArray(Object.keys(version.dependencies)) : null;
        const embed = new MessageEmbed()
            .setColor(0xcb0000)
            .setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.org/')
            .setTitle(body.name)
            .setURL(`https://registry.npmjs.org/${pkg}`)
            .setDescription(body.description || 'No description.')
            .addField('❯ Version', body['dist-tags'].latest, true)
            .addField('❯ License', body.license || 'None', true)
            .addField('❯ Author', body.author ? body.author.name : '???', true)
            .addField('❯ Creation Date', moment.utc(body.time.created).format('YYYY/MM/DD hh:mm:ss'), true)
            .addField('❯ Modification Date', moment.utc(body.time.modified).format('YYYY/MM/DD hh:mm:ss'), true)
            .addField('❯ Main File', version.main || 'index.js', true)
            .addField('❯ Dependencies', (dependencies ? dependencies.length && dependencies.join(', ') : 'None'))
            .addField('❯ Maintainers', maintainers.join(', '));

        return message.say(embed);
    }
};

module.exports = _class;

const _trimArray = (stringArr) => {
    if (!stringArr || typeof stringArr !== 'object') return 0;
    if (stringArr.length > 10) {
        const len = stringArr.length - 10;
        stringArr = stringArr.slice(0, 10);
        stringArr.push(`${len} more...`);
    }

    return stringArr;
};