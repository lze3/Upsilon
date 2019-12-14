import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';

export default class Embed extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'embed',
            memberName: 'embed',
            description: 'Creates a custom embed and displays it in the current channel',
            group: 'misc',
            args: [
                {
                    key: 'eobj',
                    prompt: 'The object for the embed.',
                    type: 'string'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { eobj }: { eobj: string }) {
        let parsedData: any;
        try {
            parsedData = JSON.parse(eobj);
        }
        catch(error) {
            return message.say('Could not parse data for embed: `' + error.message + '`');
        }

        console.log(eobj);
        const embed = new MessageEmbed(parsedData);

        return message.say(embed);
    }
}