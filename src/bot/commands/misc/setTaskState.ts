import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { settings, toggleTasks } from '../../utils/server-status-tracking';
import { TextChannel } from 'discord.js';

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
        const newState: boolean = toggleTasks(state);

        let taskChannel: TextChannel;
        taskChannel = (this.client.channels.find(ch => ch.id === settings.customTaskResponse) as TextChannel);
        taskChannel.setTopic(`I am ${!newState ? 'not ' : ''}going to let you know when a task happens!`);

        return message.reply('set task state to ' + newState);
    }
}