const { SlashCommandBuilder } = require('discord.js');

const MusicEmbed = require('@utils/embeds/music');
const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'skip',
    group: 'Music',
    description: 'Skip the track.',
    cooldown: 5,

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
        const subscription = client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.isPlayerPlaying()) return int.editReply({ embeds: [new ActionEmbed('fail', 'I am not playing anything!', int.user)] });
        if (subscription.queue.length == 0) return int.editReply({ embeds: [new ActionEmbed('fail', 'Nothing to skip to. This is the last track!', int.user)] });

        try {
            subscription.player.stop();

            return int.editReply({ embeds: [new MusicEmbed(int).setSkipped(subscription)] });
        } catch (err) {
            client.logger?.error(err);
            console.error('Music Commands (ERROR) >> skip: Error Skipping Track'.red);
            console.error(err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured. A developer has been notified!', int.user)] });
        }
    }
};