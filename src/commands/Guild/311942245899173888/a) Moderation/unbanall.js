const { SlashCommandBuilder } = require('@discordjs/builders');
const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'unbanall',
    group: 'Moderation',
    description: 'Unban everyone.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: [],
    users: [],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
        );
    },

    async run(client, int) {
        let bans = await int.guild.bans.fetch();

        await int.editReply({ embeds: [new ActionEmbed('success', 'Unbanning all users!', int.user)] });

        for (const [_, ban] of bans) {
            try {
                await int.guild.members.unban(ban.user);
                int.channel.send(`Unbanned ${ban.user.tag}.`);
            } catch (err) {
                console.error(err);
                int.channel.send(`Failed to unban ${ban.user.tag}.`);
            }         
        }

        int.channel.send('Done. EZPZ.');
    }
};