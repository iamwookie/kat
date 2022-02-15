const Discord = require('discord.js');
const Commander = require('@root/commander');
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
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
        return data;
    },

    async run(client, msg) {
        let subscription = client.subscriptions.get(msg.guildId)
        if (!subscription || !subscription.isPlayerPlaying()) {
            let notplaying = new MusicEmbed(client, msg).setTitle('I\'m not playing anything!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [notplaying] }) : msg.reply({ embeds: [notplaying] }).catch(() => msg.channel.send({ embeds: [notplaying] }));
        }

        try {
            let track = subscription.playing;
            subscription.pause()
            
            let success = new MusicEmbed(client, msg, 'paused', track);
            return msg instanceof Discord.CommandInteraction? await msg.editReply({ embeds: [success] }) : await msg.reply({ embeds: [success] }).catch(() => msg.channel.send({ embeds: [success] }));
        } catch(err) {
            Commander.handleError(client, err, false);
            console.error('Music Commands (ERROR) >> pause: Error Pausing Track'.red)
			console.error(err);

            let fail = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [fail] }) : msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
        }
    }
};