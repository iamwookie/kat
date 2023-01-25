const { SlashCommandBuilder } = require('discord.js');

const progressbar = require('string-progressbar');

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

        if (!subscription || !subscription.active && !subscription.length) return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('The queue is empty!')] });

        const queue = new MusicEmbed(client, int, 'queue');

        queue.setDescription(res);

        return int.editReply({ embeds: [queue] });
    }
};