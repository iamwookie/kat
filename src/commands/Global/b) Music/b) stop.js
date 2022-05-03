const Discord = require('discord.js');
const Commander = require('@commander/commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'stop',
    aliases: ['dc'],
    group: 'Music',
    description: 'Clear the queue and/or leave.',
    cooldown: 5,
    guildOnly: true,
    
    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
        )
    },

    async run(client, int) {
        let subscription = client.subscriptions.get(int.guildId);

        if (!subscription) {
            let notplaying = new MusicEmbed(client, int).setTitle('I\'m not playing anything!');
            return int.editReply({ embeds: [notplaying] });
        }

        try {
			subscription.destroy();
            let success = new MusicEmbed(client, int).setTitle(subscription.isPlayerPaused() ? '👋 \u200b Discconected! Cya!' : '👋 \u200b Stopped playing! Cya!');
            return int.editReply({ embeds: [success] });
		} catch (err) {
            Commander.handleError(client, err, false);
			console.error('Music Commands (ERROR) >> stop: Error Stopping Track'.red)
			console.error(err);

            let fail = new MusicEmbed(client, int).setTitle('An error occured! A developer has been notified!');
            return int.editReply({ embeds: [fail] });
		}
    }
};