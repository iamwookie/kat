const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'skip',
    group: 'Music',
    description: 'Skip the track.',
    cooldown: 5,
    guildOnly: true,

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
        return data;
    },

    async run(client, msg) {
        let subscription = client.subscriptions.get(msg.guildId);
        if (!subscription || !subscription.isPlayerPlaying()) {
            let notplaying = new MusicEmbed(client, msg).setTitle('I\'m not playing anything!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [notplaying] }) : msg.reply({ embeds: [notplaying] }).catch(() => msg.channel.send({ embeds: [notplaying] }));
        }

        if (subscription.queue.length == 0) {
            let noskip = new MusicEmbed(client, msg).setTitle('Nothing to skip to! This is the last song!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [noskip] }) : msg.reply({ embeds: [noskip] }).catch(() => msg.channel.send({ embeds: [noskip] }));
        }

        try {
            let track = subscription.playing;
            subscription.player.stop();

            let success = new MusicEmbed(client, msg, 'skipped', track);
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [success] }) : msg.reply({ embeds: [success] }).catch(() => msg.channel.send({ embeds: [success] }));
        } catch(err) {
            console.error('Music Commands (ERROR) >> skip: Error Skipping Track'.red)
			console.error(err);

            let fail = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [fail] }) : msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
        }
    }
};