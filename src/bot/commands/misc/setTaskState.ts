import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { prototypeTaskSetter, allowedTypeTasks } from '../../utils/serverStatusTracking';

export default class SetTaskState extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'sts',
            group: 'misc',
            memberName: 'sts',
            description: 'Sets the state for tasks to run in auto-status-updater.',
            args: [
                {
                    key: 'type',
                    type: 'string',
                    prompt: 'State to set task.',
                    oneOf: allowedTypeTasks
                },
                {
                    key: 'value',
                    type: 'string',
                    prompt: 'What would you like to be alerted for?'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { type, value }: { type: string, value: string }) {
        const [ retT, retV ]: [ string, string ] = prototypeTaskSetter(type, value);
        return message.reply('set task listener for ' + retT + ' with value ' + retV);
    }
}