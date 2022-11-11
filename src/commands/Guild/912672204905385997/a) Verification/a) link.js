const { SlashCommandBuilder } = require('@discordjs/builders');
const NebulaLinkSession = require('@core/verification/linksession');
const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    disabled: true,
    name: 'link',
    group: 'Verification',
    description: 'Link your account with the Nebula Services.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: [],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
        );
    },

    async run(client, int) {
        if (!client.database) return int.editReply({ embeds: [new ActionEmbed('fail', 'Database not online!', int.user)] });

        let user = await client.database.redis.hGet(client.database.withPrefix('nebula-link'), int.user.id);

        if (user) {
            let exists = new ActionEmbed('fail', 'You have already linked your account with Nebula Services!', int.user);
            return int.editReply({ embeds: [exists] });
        }

        if (NebulaLinkSession.cache.has(int.user.id)) {
            let started = new ActionEmbed('fail', 'You have already started a link session!', int.user);
            return int.editReply({ embeds: [started] });
        }

        return NebulaLinkSession.initialize(client, int);
    }
};