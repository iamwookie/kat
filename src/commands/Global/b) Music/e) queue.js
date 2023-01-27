const { SlashCommandBuilder } = require('discord.js');
const ActionEmbed = require('@utils/embeds/action');
const MusicEmbed = require('@utils/embeds/music');

module.exports = {
    name: 'queue',
    group: 'Music',
    description: 'View the queue.',
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
        if (!subscription || !subscription.active && !subscription.queue.length) return int.editReply({ embeds: [new ActionEmbed('fail', 'The queue is empty or does not exist!', int.user)] });

        return int.editReply({ embeds: [new MusicEmbed(int).setPlaying(subscription).setQueue(subscription)] });
    }
};