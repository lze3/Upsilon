import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { get } from 'request';
import { MessageEmbed, GuildMember, ColorResolvable } from 'discord.js';
import { getAuthLevelByAcronym, IServerDataStruct } from '../../utils/functions';

let serverData: IServerDataStruct = {
    clients: 0,
    gametype: 'unknown',
    hostname: 'unknown',
    iv: '0000',
    mapname: 'unknown',
    sv_maxclients: '0'
};
let playerData: any = {};

export default class ServerStatus extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'status',
            group: 'information',
            memberName: 'status',
            description: 'Returns information about a queried server.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'ip',
                    type: 'string',
                    prompt: 'What server would you like to query?'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { ip }: { ip: string }) {
        const member: GuildMember|Promise<GuildMember> = message.member ?? message.guild.members.fetch(message.author);
        const embedColor: ColorResolvable = (member instanceof GuildMember && member.roles && member.roles.cache.size > 1) ? member.roles.color.color : '#23E25D';

        if (!ip.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]+$/g)) {
            return message.reply('invalid IP address.');
        }

        message.delete();

        const server_down_embed: MessageEmbed = new MessageEmbed()
            .setAuthor('Server Information', message.guild.iconURL())
            .addField('Server IP', ip)
            .addField('Status', 'Offline')
            .setColor('#FF9C00')
            .setTimestamp();

        get(`http://${ip}/players.json`, {
            timeout: 2000
        }, (err, _, playersBody) => {
            if (err) {
                return message.reply(server_down_embed);
            }

            get(`http://${ip}/dynamic.json`, {
                timeout: 2000
            }, (errInfo, __, infoBody) => {
                if (errInfo) {
                    return message.reply(server_down_embed);
                }

                try {
                    playerData = JSON.parse(playersBody);
                    serverData = JSON.parse(infoBody);
                }
                catch(error) {
                    return message.reply(server_down_embed);
                }

                const embed: MessageEmbed = new MessageEmbed()
                    .setAuthor(`Server Information`, message.guild.iconURL())
                    .addField('Server IP', ip)
                    .addField('Status', 'Online')
                    .addField('Players', playerData.length + ' | ' + serverData.sv_maxclients)
                    .setColor(embedColor)
                    .setTimestamp();

                const [ isHSG, authLevelLong ]: [ boolean, string|null ] = getAuthLevelByAcronym(serverData.gametype);
                if (isHSG) {
                    embed.addField('Authorization', authLevelLong);
                    embed.addField('Roleplay Zone', serverData.mapname);
                }

                return message.reply(embed);
            });
        });
    }
}