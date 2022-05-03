const Discord = require('discord.js');
const Commander = require('@commander/commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'pause',
    group: 'Music',
    description: 'Pause the track.',
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
        let subscription = client.subscriptions.get(int.guildId)
        if (!subscription || !subscription.isPlayerPlaying()) {
            let notplaying = new MusicEmbed(client, int).setTitle('I\'m not playing anything!');
            return int.editReply({ embeds: [notplaying] });
        }

        try {
            let track = subscription.playing;
            subscription.pause()
            
            let success = new MusicEmbed(client, int, 'paused', track);
            return int.editReply({ embeds: [success] });
        } catch(err) {
            Commander.handleError(client, err, false);
            console.error('Music Commands (ERROR) >> pause: Error Pausing Track'.red)
			console.error(err);

            let fail = new MusicEmbed(client, int).setTitle('An error occured! Contact a developer ASAP!');
            return int.editReply({ embeds: [fail] });
        }
    }
};