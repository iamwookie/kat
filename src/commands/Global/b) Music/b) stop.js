const Discord = require('discord.js');
const Commander = require('@root/commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'stop',
    aliases: ['dc'],
    group: 'Music',
    description: 'Clear the queue and leave.',
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

        try {
			subscription.destroy();
            let success = new MusicEmbed(client, msg).setTitle('👋 \u200b Stopped playing! Cya!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [success] }) : msg.reply({ embeds: [success] }).catch(() => msg.channel.send({ embeds: [success] }));
		} catch (err) {
            Commander.handleError(client, err, false);
			console.error('Music Commands (ERROR) >> stop: Error Stopping Track'.red)
			console.error(err);

            let fail = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [fail] }) : msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
		}
    }
};