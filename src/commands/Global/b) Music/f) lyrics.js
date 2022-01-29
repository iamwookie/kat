const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicEmbed } = require('@utils/other/embeds');
const GeniusLyrics = require("genius-lyrics");
const genius = new GeniusLyrics.Client(process.env.GENIUS_API_KEY);

module.exports = {
    name: 'lyrics',
    group: 'Music',
    description: 'View the currently playing tracks lyrics or search for one.',
    format: '<search>',
    cooldown: 5,
    guildOnly: true,

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option => {
            option.setName('query');
            option.setDescription('The name of the song.');
            return option;
        });
        return data;
    },

    async run(client, msg, args) {
        args = msg instanceof Discord.CommandInteraction? msg.options.getString('query') : args;
        let song = '';

        if (!args) {
            let subscription = client.subscriptions.get(msg.guildId);
            if (!subscription || !subscription.isPlayerPlaying() || !subscription.playing) {
                let notplaying = new MusicEmbed(client, msg).setTitle('I\'m not playing anything!');
                return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [notplaying] }) : msg.reply({ embeds: [notplaying] }).catch(() => msg.channel.send({ embeds: [notplaying] }));
            }
            song = subscription.playing.title;
        } else {
            song = args;
        }
        
        try {
            let searching = new MusicEmbed(client, msg, 'searching');
            let reply = msg instanceof Discord.CommandInteraction? await msg.editReply({ embeds: [searching] }) : await msg.reply({ embeds: [searching] }).catch(() => msg.channel.send({ embeds: [searching] }));

            let search = await genius.songs.search(song);
            let lyrics = await search[0].lyrics() || 'Not Found';

            if (lyrics.length > 5000) lyrics = lyrics.slice(0, -(lyrics.length - 5000)) + '...'

            let success = new MusicEmbed(client, msg, 'lyrics');
            success.setDescription(`**Song: ${search[0].artist.name} - ${search[0].title}**\n\n${lyrics}`);
            return reply.edit({ embeds: [success] });
        } catch(err) {
            console.error('Music Commands (ERROR) >> lyrics: Error Getting Track Lyrics'.red)
			console.error(err);

            let fail = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [fail] }) : msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
        }
    }
};