const { SlashCommandBuilder } = require('discord.js');

const ActionEmbed = require('@utils/embeds/action');
const MusicEmbed = require('@utils/embeds/music');

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
        if (!subscription) { return int.editReply({ embeds: [new ActionEmbed('fail', 'I am not playing anything!', int.user)] }); }

        try {
            subscription.destroy();

            return int.editReply({ embeds: [new ActionEmbed('success', 'Successfully disconnected. Cya! 👋', int.user)] });
        } catch (err) {
            client.logger?.error(err);
            console.error('Music Commands (ERROR) >> stop: Error Stopping Track'.red);
            console.error(err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured. A developer has been notified!', int.user)] });
        }
    }
};