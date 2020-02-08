import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { toggleTasks } from '../../utils/server-status-tracking';

export default class SetTaskState extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'sts',
            group: 'misc',
            memberName: 'sts',
            description: 'Sets the state for tasks to run in auto-status-updater.',
            args: [
                {
                    key: 'state',
                    type: 'boolean',
                    prompt: 'State to set task.'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { state }: { state: boolean }) {
        return message.reply('set task state to ' + toggleTasks(state));
    }
}