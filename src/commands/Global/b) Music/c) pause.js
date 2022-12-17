const { SlashCommandBuilder } = require('discord.js');

const Commander = require('@commander');

const MusicEmbed = require('@utils/embeds/music');
const ActionEmbed = require('@utils/embeds/action');

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
        let subscription = client.subscriptions.get(int.guildId);

        if (!subscription || !subscription.isPlayerPlaying()) return int.editReply({ embeds: [new MusicEmbed(client, int).setTitle('I\'m not playing anything!')] });

        try {
            subscription.pause();
            
            return int.editReply({ embeds: [new MusicEmbed(client, int, 'paused', subscription.active)] });
        } catch (err) {
            console.error('Music Commands (ERROR) >> pause: Error Pausing Track'.red);
            console.error(err);
            Commander.handleError(client, err);

            return int.editReply({ embeds: [new ActionEmbed('fail', 'An error occured! A developer has been notified!', int.user)] });
        }
    }
};