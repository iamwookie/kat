const { SlashCommandBuilder } = require('discord.js');

const MusicEmbed = require('@utils/embeds/music');
const ActionEmbed = require('@utils/embeds/action');
const ErrorEmbed = require('@utils/embeds/error');

module.exports = {
    name: 'pause',
    group: 'Music',
    description: 'Pause the track.',
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

        try {
            subscription.pause();

            return int.editReply({ embeds: [new MusicEmbed(int).setPaused(subscription).setQueue(subscription)] });
        } catch (err) {
            const eventId = client.logger?.error(err);
            console.error('Music Commands (ERROR) >> pause: Error Pausing Track'.red);
            console.error(err);

            return int.editReply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
};