const { SlashCommandBuilder, EmbedBuilder, GuildMember } = require('discord.js');

const ActionEmbed = require('@utils/embeds/action');

// Simple command for PP size, this is hidden just a fun command, IGNORE THIS initially.
module.exports = {
    name: 'pp',
    group: 'Misc',
    description: 'How big is it?',
    format: '<?user>',

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addMentionableOption(option => {
                    option.setName('user');
                    option.setDescription('The user to analyze.');
                    return option;
                })
        );
    },


    async run(client, int) {
        const size = 20;
        const body = '=';
        const mention = int.options.getMentionable('user');
        const gif = 'https://tenor.com/view/the-biggest-one-cillian-murphy-bustle-huge-massive-gif-21987675'

        const reply = new EmbedBuilder()
            .setTitle(`${int.user.username}\'s PP Size`)
            .setDescription(`8${body.repeat(Math.floor(Math.random() * (size - 1)))}D`)
            .setColor('Random')
            .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) });

        if (mention) {
            if (mention instanceof GuildMember) {
                reply.setTitle(`${mention.user.username}\'s PP Size`);

                if (mention.user.id == client.user.id) return int.editReply(':no_entry: ERROR: The measurement values are invalid.');

                if (mention.user.id == '130065975956471808') return int.editReply(gif);

                if (mention.user.id == '438438026566172682') reply.setDescription(`8${body.repeat(Math.floor(Math.random() * 5))}D`);
            } else {
                return int.editReply({ embeds: [new ActionEmbed('fail', 'You have not mentioned a valid user!', int.user)] });
            }
        } else {
            if (int.user.id == '130065975956471808') return int.editReply(gif);

            if (int.user.id == '438438026566172682') reply.setDescription(`8${body.repeat(Math.floor(Math.random() * 5))}D`);
        }

        int.editReply({ embeds: [reply] });
    }
};