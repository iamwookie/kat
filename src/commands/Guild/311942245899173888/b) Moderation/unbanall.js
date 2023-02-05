const { SlashCommandBuilder } = require('discord.js');

const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'unbanall',
    group: 'Moderation',
    description: 'Unban everyone from the Discord.',

    // AUTHORIZATION
    guilds: [],
    users: [],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
        );
    },

    async run(client, int) {
        const bans = await int.guild.bans.fetch();

        let count = 0;
        for (const [_, ban] of bans) {
            try {
                await int.guild.members.unban(ban.user);
                count++;
            } catch (err) {
                client.logger?.error(err);
            }
        }

        return int.editReply({ embeds: [new ActionEmbed('success', `Unbanned \`${count}\` users from the Discord!`, int.user)] });
    }
};