const Discord = require('discord.js');
const Commander = require('@commander/commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const MusicSubscription = require('@music/subscription');
const Track = require('@music/track');
const play = require('play-dl');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'play',
    aliases: { 'p': false, },
    group: 'Music',
    description: 'Search for a track and play it or add it to the queue.',
    format: '<?search/url>',
    cooldown: 5,
    guildOnly: true,

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option => {
            option.setName('query');
            option.setDescription('The name or URL of the song.');
            return option;
        });
        return data;
    },

    async run(client, msg, args) {
        let author = msg instanceof Discord.CommandInteraction? msg.user : msg.author;
        let subscription = client.subscriptions.get(msg.guildId);
        
        let channel = msg.member.voice.channel;
        if (!channel) {
            let nochannel = new MusicEmbed(client, msg).setTitle('You are not in a channel!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [nochannel] }) : msg.reply({ embeds: [nochannel] }).catch(() => msg.channel.send({ embeds: [nochannel] }));
        }

        args = msg instanceof Discord.CommandInteraction? msg.options.getString('query') : args;
        
        if (subscription && subscription.isPlayerPaused()) {
            let track = subscription.playing;

            let unpaused = new MusicEmbed(client, msg, 'unpaused', track);
            msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [unpaused] }) : msg.reply({ embeds: [unpaused] }).catch(() => msg.channel.send({ embeds: [unpaused] }));

            subscription.unpause();

            if (!args) return;
        }

        if (!args) {
            let noargs = new MusicEmbed(client, msg).setTitle('What should I play?');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [noargs] }) : msg.reply({ embeds: [noargs] }).catch(() => msg.channel.send({ embeds: [noargs] }));
        }

        if (!channel.joinable || !channel.speakable) {
            let noperms = new MusicEmbed(client, msg).setTitle('I can\'t play in that voice channel!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [noperms] }) : msg.reply({ embeds: [noperms] }).catch(() => msg.channel.send({ embeds: [noperms] }));
        }

        if (!subscription) subscription = await MusicSubscription.create(client, channel);

        try {
            let query = args;

            if (query.startsWith('https://open.spotify.com/')) {
                let searching = new MusicEmbed(client, msg, 'searching-spotify');
                reply = msg instanceof Discord.CommandInteraction? await msg.editReply({ embeds: [searching] }) : await msg.reply({ embeds: [searching] }).catch(() => msg.channel.send({ embeds: [searching] }));

                try {
                    if (play.is_expired()) await play.refreshToken();

                    let search = await play.spotify(query);
                    if (search instanceof play.SpotifyPlaylist || search instanceof play.SpotifyAlbum) {
                        data = search;
                    } else {
                        let searchArray = await play.search(search.artists[0].name + ' - ' + search.name);
                        data = searchArray[0];
                    }
                } catch(err) {
                    Commander.handleError(client, err, false);
                    let notFound = new MusicEmbed(client, msg).setTitle('You have not provided a valid Spotify URL!');
                    reply.edit({ embeds: [notFound] }).catch(() => msg.channel.send({ embeds: [notFound] }));
                    return subscription.destroy();
                }
            } else if (query.startsWith('https://www.youtube.com/playlist' || 'https://youtube.com/playlist')) {
                let searching = new MusicEmbed(client, msg, 'searching');
                reply = msg instanceof Discord.CommandInteraction? await msg.editReply({ embeds: [searching] }) : await msg.reply({ embeds: [searching] }).catch(() => msg.channel.send({ embeds: [searching] }));
                
                try {
                    let search = await play.playlist_info(query, { incomplete: true });
                    data = search;
                } catch {
                    Commander.handleError(client, err, false);
                    let notFound = new MusicEmbed(client, msg).setTitle('You have not provided a valid playlist URL!');
                    reply.edit({ embeds: [notFound] });
                    return subscription.destroy();
                }
            } else {
                let searching = new MusicEmbed(client, msg, 'searching');
                reply = msg instanceof Discord.CommandInteraction? await msg.editReply({ embeds: [searching] }) : await msg.reply({ embeds: [searching] }).catch(() => msg.channel.send({ embeds: [searching] }));
                
                let search = await play.search(query, { limit: 1, source: { youtube: 'video' } });
                data = search[0];
            }

            if (!data) {
                let notFound = new MusicEmbed(client, msg).setTitle('Couldn\'t find your search result. Try again!');
                reply.edit({ embeds: [notFound] });
                return subscription.destroy();
            }

            if (data.type == 'playlist' || data.type == 'album') {
                let enqueued = new MusicEmbed(client, msg, 'enqueued', data);

                if (data instanceof play.YouTubePlayList) {
                    for (const video of data.videos) {
                        let track = Track.create(subscription, msg, video, author);
                        subscription.add(track);
                    }
                }

                if (data instanceof play.SpotifyPlaylist || data instanceof play.SpotifyAlbum) {
                    let adding = new MusicEmbed(client, msg, 'adding-playlist', data);
                    await reply.edit({ embeds: [adding] });

                    let spotifyTracks = await data.all_tracks();

                    for (const spotifyTrack of spotifyTracks) {
                        let ytSearch = await play.search(spotifyTrack.artists[0].name + ' - ' + spotifyTrack.name, { limit: 1, source: { youtube: 'video' } })

                        if (ytSearch.length) {
                            let track = Track.create(subscription, msg, ytSearch[0], author);
                            subscription.add(track);
                        }
                    }

                    await reply.channel.send({ embeds: [enqueued] });
                }
                
                console.log('Music Commands >> play: Added Playlist:'.magenta);
                console.log({
                    Title: data instanceof play.SpotifyPlaylist || data instanceof play.SpotifyAlbum? data.name : data.title,
                    URL: data.url
                });
                return reply.edit({ embeds: [enqueued] });
            }

			let track = Track.create(subscription, msg, data, author);
			subscription.add(track);

            console.log('Music Commands >> play: Added Track:'.magenta);
            console.log({
                Title: track.title,
                Duration: track.duration,
                URL: track.url,
                Guild: `${subscription.guild.name} (${subscription.guild.id})`
            });

            let enqueued = new MusicEmbed(client, msg, 'enqueued', track);
			return reply.edit({ embeds: [enqueued] });
		} catch (err) {
            Commander.handleError(client, err, false, msg.guild);
            console.error('Music Commands (ERROR) >> play: Error Running Command'.red);
			console.error(err);
            
            let fail = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [fail] }) : msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
        }
    }
};