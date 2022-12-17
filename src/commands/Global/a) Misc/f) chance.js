const { SlashCommandBuilder, EmbedBuilder, GuildMember } = require('discord.js');

const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'chance',
    group: 'Misc',
    description: 'Chances at getting someone.',
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
        const calculation = Math.round(Math.random() * 100);
        const mention = int.options.getMentionable('user');

        const reply = new EmbedBuilder()
            .setTitle(`:smirk: \u200b ${int.user.username}\'s Chances`)
            .setDescription(`${calculation}%`)
            .setColor('Random')
            .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) });

        if (mention) {
            if (mention instanceof GuildMember) {
                reply.setTitle(`:smirk: \u200b ${mention.user.username}\'s Chances`);

                if (mention.user.id == client.user.id) return int.editReply(':no_entry: ERROR: The measurement values are invalid.');
            } else {
                return int.editReply({ embeds: [new ActionEmbed('fail', 'You have not mentioned a valid user!', int.user)] });
            }
        }

        int.editReply({ embeds: [reply] });
    }
};