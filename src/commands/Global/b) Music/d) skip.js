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
        let subscription = client.subscriptions.get(int.guildId);

        if (!subscription || !subscription.isPlayerPlaying()) return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('I\'m not playing anything!')] });

        if (subscription.queue.length == 0) return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('Nothing to skip to! This is the last song!')] });

        try {
            subscription.player.stop();

            return int.editReply({ embeds: [new MusicEmbed(client, int, 'skipped', subscription.active)] });
        } catch (err) {
            console.error('Music Commands (ERROR) >> skip: Error Skipping Track'.red);
            console.error(err);
            
            client.logger?.error(err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured! A developer has been notified!', int.user)] });
        }
    }
};