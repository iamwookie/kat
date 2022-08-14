const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const ActionEmbed = require('@utils/embeds/action');

/*
const io = require('@pm2/io');
const usageCount = io.counter({
    name: 'PPs Measured',
    id: 'usage/commands/pp'
});
*/

// Simple command for PP size, this is hidden just a fun command, IGNORE THIS initially.
module.exports = {
    name: 'pp',
    group: 'Misc',
    description: 'How big is it?',
    format: '<?user>',
    guildOnly: true,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addMentionableOption(option => {
                    option.setName('user');
                    option.setDescription('The user to analyze.');
                    return option;
                })
        );
    },


    async run(client, int) {
        // usageCount.inc();
        // ------------
        let size = 20;
        let body = '=';
        let reply = new Discord.EmbedBuilder()
            .setTitle(`${int.user.username}\'s PP Size`)
            .setDescription(`8${body.repeat(Math.floor(Math.random() * (size - 1)))}D`)
            .setColor('Random')
            .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) });

        let gif = 'https://tenor.com/view/the-biggest-one-cillian-murphy-bustle-huge-massive-gif-21987675';

        let mention = int.options.getMentionable('user');

        if (mention) {
            if (mention instanceof Discord.GuildMember) {
                reply.setTitle(`${mention.user.username}\'s PP Size`);
                if (mention.user.id == client.user.id) {
                    let res = ':no_entry: ERROR: The measurement values are invalid.';
                    return int.editReply(res);
                }
                if (mention.user.id == '130065975956471808') {
                    return int.editReply(gif);
                }
                if (mention.user.id == '438438026566172682') {
                    reply.setDescription(`8${body.repeat(Math.floor(Math.random() * 5))}D`);
                }
            } else {
                let noMention = new ActionEmbed('fail', 'You have not mentioned a valid user!', int.user);
                return int.editReply({ embeds: [noMention] });
            }
        } else {
            if (int.user.id == '130065975956471808') {
                return int.editReply(gif);
            }
            if (int.user.id == '438438026566172682') {
                reply.setDescription(`8${body.repeat(Math.floor(Math.random() * 5))}D`);
            }
        }

        int.editReply({ embeds: [reply] });
    }
};