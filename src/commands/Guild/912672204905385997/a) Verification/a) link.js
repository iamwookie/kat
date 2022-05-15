const { SlashCommandBuilder } = require('@discordjs/builders');
const NebulaLinkSession = require('@core/verification/linksession');
const { failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'link',
    group: 'Verification',
    description: 'Link your account with the Nebula Services.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: ['912672204905385997'],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
        )
    },
    
    async run(client, int) {
        let user = await client.database.redis.hGet('nebula-link', int.user.id);

        if (user) {
            let exists = failEmbed('You have already linked your account with Nebula Services!', int.user);
            return int.editReply({ embeds: [exists] });
        }

        if (NebulaLinkSession.cache.has(int.user.id)) {
            let started = failEmbed('You have already started a link session!', int.user);
            return int.editReply({ embeds: [started] });
        }

        return NebulaLinkSession.initialize(client, int);
    }
};