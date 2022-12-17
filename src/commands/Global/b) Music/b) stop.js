const { SlashCommandBuilder } = require('discord.js');

const Commander = require('@commander');

const MusicEmbed = require('@utils/embeds/music');
const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'stop',
    aliases: ['dc'],
    group: 'Music',
    description: 'Clear the queue and/or leave.',
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

        if (!subscription) { return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('I\'m not playing anything!')] }); }

        try {
            subscription.destroy();
            return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle(subscription.isPlayerPaused() ? '👋 \u200b Discconected! Cya!' : '👋 \u200b Stopped playing! Cya!')] });
        } catch (err) {
            console.error('Music Commands (ERROR) >> stop: Error Stopping Track'.red);
            console.error(err);
            Commander.handleError(client, err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured! A developer has been notified!', int.user)] });
        }
    }
};