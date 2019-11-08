const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class RulesGenerator extends Command {
    constructor(client) {
        super(client, {
            name: 'rules',
            aliases: ['rls'],
            group: 'misc',
            memberName: 'rules',
            description: 'Generates the server rules.',
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            hidden: true
        });
    }

    run(message) {
        message.delete();

        const rulesEmbed = new MessageEmbed()
            .setAuthor('JusticeCommunityRP • Important Server Information - Rules', 'https://i.imgur.com/nKTfMbX.png')
            .setTitle('**Server Motto**: ' +
                'Family, Friends and Fun!')
            .setDescription('**1.** Do not tag Collective members or a group of members unless you have a valid reason to do so. If you seek assistance, please tag the `Junior Administrator` role.\n\n' +
                '**2.** Staff word is final, do not argue with them in the chats and try to loophole the consequence.\n\n' +
                '**3.** No NSFW content, including links or pics of violence, gore, hate crimes, racism, sexist or just unwholesome stuff.\n\n' +
                '**4.** Please use channels for their respective purpose. For example, use <#539466644032847902> for bot commands.\n\n' +
                '**5.** Do not scream or make obnoxious noises in voice channels especially when there is a staff member in there, you can potentially be muted or receive a strike.\n\n' +
                '**6.** Do not impersonate people.\n\n' +
                '**7.** Do not leak DMs.\n\n' +
                '**8.** Do not spam connect and disconnect in voice channels\n\n' +
                '**9.** Read text channel descriptions and make sure your message is appropriate for the channel.\n\n' +
                '**10.** The posting of links in <#539465361280598016> is not allowed unless the link is relevant to the community or current conversation.\n\n' +
                '**11.** If you are not a Registered Streamer, do not advertise.\n\n' +
                '**12.** Refrain from using shortened URLs, they have the potential to be very dangerous.\n\n' +
                '**13.** Threats of suicide and self-harm are not allowed and you may face a strike if you do make a threat.\n\n' +
                '**14.** Do not constantly beg for attention from The Collective, they are busy people. They do not need people badgering them when they have more important things to do.\n\n' +
                '**15.** Do not ask people with special roles how to get them. Roles like \'Staff\' are given to people who are trusted by Lead Administrator+.\n\n' +
                '**16.** Bomb threats or death threats or anything related to harm are not allowed and will result in an immidiate ban or strike.\n\n' +
                '**17.** Do not mass mention any roles if you do not have a valid reason to do so.\n\n' +
                '**18.** The only \'Freedom of Speech\' that is allowed is POSITIVE FREEDOM OF SPEECH.\n\n' +
                '**19.** Most of all, be respectful to all members of the community.\n\n' +
                '**20.** Do not have a negative attitude.')
            .setColor('#7893AE');

        const rolesEmbed = new MessageEmbed()
            .setAuthor('JusticeCommunityRP • Important Server Information - Roles', 'https://i.imgur.com/nKTfMbX.png')
            .setDescription(
                '`JCRP Collective | Owner` - The Owner of the server.\n\n' +
                '`JCRP Collective | Founder` - The Founder of the community.\n\n' +
                '`JCRP | The Collective` - The management of the community, each member has a particular job and specification.\n\n' +
                '`JCRP Collective | Systems Administrator` - Administrators of vital tools of the community.\n\n' +
                '`JCRP Collective | Lead Developer` - The development lead, is in charge of development and recruiting new developers.\n\n' +
                '`JCRP | Administration Team` - The staff of the server, people who are trusted and help keep the server under control.\n\n' +
                '`JCRP | Development Team` - Those who develop for the game server and other assets the community owns.\n\n' +
                '`Los Santos Sheriff\'s Department` - The department that patrols all around the counties, both Los Santos County and Blaine County.\n\n' +
                '`Los Santos Police Department` - The department that patrols in towns and cities of San Andreas.\n\n' +
                '`San Andreas Highway Patrol` - The department that patrols on highways and main roads.\n\n' +
                '`San Andreas Fire Department` - Responsible for responding to calls that contain citizens being injured.\n\n' +
                '`Train Me` - The \'waiting for training\' role.\n\n' +
                '`Interview Me (Application Accepted)` - The \'waiting for interview\' role.\n\n' +
                '`Premium VIP | Donator` - Members who are very much appreciated and funded the server hugely!\n\n' +
                '`Classic VIP | Donation Tier 1-3` & `Classic VIP | Downloadable Content 1-3` - Members that have decided to help support the server out by donating.')
            .setColor('#7893AE')
            .setFooter('We hope you enjoy it here at JusticeCommunityRP!');


        message.say({
            embed: rulesEmbed
        });

        return message.say({
            embed: rolesEmbed
        });
    }
};