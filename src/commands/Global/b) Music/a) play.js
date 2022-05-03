const Discord = require('discord.js');
const Commander = require('@commander/commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const MusicSubscription = require('@music/subscription');
const Track = require('@music/track');
const play = require('play-dl');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'play',
    group: 'Music',
    description: 'Search for a track and play it or add it to the queue.',
    format: '<?search/url>',
    cooldown: 5,
    guildOnly: true,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => {
                option.setName('query');
                option.setDescription('The name or URL of the song.');
                return option;
            })
        )
    },

    async run(client, int) {
        let subscription = client.subscriptions.get(int.guildId);
        
        let channel = int.member.voice.channel;
        if (!channel) {
            let nochannel = new MusicEmbed(client, int).setTitle('You are not in a channel!');
            return int.editReply({ embeds: [nochannel] });
        }

        args = int.options.getString('query');
        
        if (subscription && subscription.isPlayerPaused()) {
            let track = subscription.playing;

            subscription.unpause();

            let unpaused = new MusicEmbed(client, int, 'unpaused', track);
            if (!args) return int.editReply({ embeds: [unpaused] });
        }

        if (!args) {
            let noargs = new MusicEmbed(client, int).setTitle('What should I play?');
            return int.editReply({ embeds: [noargs] });
        }

        if (!channel.joinable || !channel.speakable) {
            let noperms = new MusicEmbed(client, int).setTitle('I can\'t play in that voice channel!');
            return int.editReply({ embeds: [noperms] });
        }

        if (!subscription) subscription = await MusicSubscription.create(client, channel);

        try {
            let query = args;

            if (query.startsWith('https://open.spotify.com/')) {
                let searching = new MusicEmbed(client, int, 'searching-spotify');
                reply = await int.editReply({ embeds: [searching] });

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
                    let notFound = new MusicEmbed(client, int).setTitle('You have not provided a valid Spotify URL!');
                    reply.edit({ embeds: [notFound] }).catch(() => int.channel.send({ embeds: [notFound] }));
                    return subscription.destroy();
                }
            } else if (query.startsWith('https://www.youtube.com/playlist' || 'https://youtube.com/playlist')) {
                let searching = new MusicEmbed(client, int, 'searching');
                reply = await int.editReply({ embeds: [searching] });
                
                try {
                    let search = await play.playlist_info(query, { incomplete: true });
                    data = search;
                } catch {
                    Commander.handleError(client, err, false);
                    let notFound = new MusicEmbed(client, int).setTitle('You have not provided a valid playlist URL!');
                    reply.edit({ embeds: [notFound] });
                    return subscription.destroy();
                }
            } else {
                let searching = new MusicEmbed(client, int, 'searching');
                reply = await int.editReply({ embeds: [searching] });
                
                let search = await play.search(query, { limit: 1, source: { youtube: 'video' } });
                data = search[0];
            }

            if (!data) {
                let notFound = new MusicEmbed(client, int).setTitle('Couldn\'t find your search result. Try again!');
                reply.edit({ embeds: [notFound] });
                return subscription.destroy();
            }

            if (data.type == 'playlist' || data.type == 'album') {
                let enqueued = new MusicEmbed(client, int, 'enqueued', data);

                if (data instanceof play.YouTubePlayList) {
                    for (const video of data.videos) {
                        let track = Track.create(subscription, int, video, int.user);
                        subscription.add(track);
                    }
                }

                if (data instanceof play.SpotifyPlaylist || data instanceof play.SpotifyAlbum) {
                    let adding = new MusicEmbed(client, int, 'adding-playlist', data);
                    await reply.edit({ embeds: [adding] });

                    let spotifyTracks = await data.all_tracks();

                    for (const spotifyTrack of spotifyTracks) {
                        let ytSearch = await play.search(spotifyTrack.artists[0].name + ' - ' + spotifyTrack.name, { limit: 1, source: { youtube: 'video' } })

                        if (ytSearch.length) {
                            let track = Track.create(subscription, int, ytSearch[0], int.user);
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

			let track = Track.create(subscription, int, data, int.user);
			subscription.add(track);

            console.log('Music Commands >> play: Added Track:'.magenta);
            console.log({
                Title: track.title,
                Duration: track.duration,
                URL: track.url,
                Guild: `${subscription.guild.name} (${subscription.guild.id})`
            });

            let enqueued = new MusicEmbed(client, int, 'enqueued', track);
			return reply.edit({ embeds: [enqueued] });
		} catch (err) {
            Commander.handleError(client, err, false, int.guild);
            console.error('Music Commands (ERROR) >> play: Error Running Command'.red);
			console.error(err);
            
            let fail = new MusicEmbed(client, int).setTitle('An error occured! A developer has been notified!');
            return int.editReply({ embeds: [fail] });
        }
    }
};