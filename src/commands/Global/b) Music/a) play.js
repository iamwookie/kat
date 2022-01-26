const VoiceSubscription = require('@music/subscription');
const Track = require('@music/track');
const play = require('play-dl');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'play',
    group: 'Music',
    description: 'Search for a track and play it or add it to the queue.',
    format: '<search / url>',
    cooldown: 5,
    guildOnly: true,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId);
        
        let channel = msg.member.voice.channel;
        if (!channel) {
            let embed = new MusicEmbed(client, msg).setTitle('You are not in a channel!');
            return msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
        }

        if (subscription && subscription.isPlayerPaused()) {
            let track = subscription.playing;

            let embed = new MusicEmbed(client, msg, 'unpaused', track);
            msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));

            subscription.unpause();

            if(!args) return;
        }

        if (!args) {
            let embed = new MusicEmbed(client, msg).setTitle('What should I play?');
            return msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
        }

        if (!channel.joinable || !channel.speakable) {
            let embed = new MusicEmbed(client, msg).setTitle('I can\'t play in that voice channel!');
            return msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
        }

        if (!subscription) {
            subscription = await VoiceSubscription.create(client, channel);
        } else {
            await subscription.ready(20000);
        }

        try {
            let query = args;

            if (query.startsWith('https://open.spotify.com/track')) {
                let searching = new MusicEmbed(client, msg, 'searching-spotify');
                reply = await msg.reply({ embeds: [searching] }).catch(() => msg.channel.send({ embeds: [searching] }));

                try {
                    if (play.is_expired()) await play.refreshToken();
                    let search = await play.spotify(query);
                    query = search.artists[0].name + ' - ' + search.name;
                } catch {
                    let notFound = new MusicEmbed(client, msg).setTitle('You have not provided a valid Spotify URL!');
                    reply.edit({ embeds: [notFound] });
                    return subscription.destroy();
                }
            } else {
                let searching = new MusicEmbed(client, msg, 'searching');
                reply = await msg.reply({ embeds: [searching] }).catch(() => msg.channel.send({ embeds: [searching] }));
            }

            if (query.startsWith('https://www.youtube.com/playlist' || 'https://youtube.com/playlist')) {
                try {
                    let search = await play.playlist_info(query, { incomplete: true });
                    data = search;
                } catch {
                    let notFound = new MusicEmbed(client, msg).setTitle('You have not provided a valid playlist URL!');
                    reply.edit({ embeds: [notFound] });
                    return subscription.destroy();
                }
            } else {
                let search = await play.search(query, { limit: 1, source: { youtube: 'video' } });
                data = search[0];
            }

            if (!data) {
                let notFound = new MusicEmbed(client, msg).setTitle('Couldn\'t find your search result. Try again!');
                reply.edit({ embeds: [notFound] });
                return subscription.destroy();
            }

            if (data.type == 'playlist') {
                for (const video of data.videos) {
                    const track = new Track(
                        video,
                        msg.author,
                        function onStart() {
                            let onstart = new MusicEmbed(client, msg, 'playing', this);
                            msg.channel.send({ embeds: [onstart] });
                        },
                        function onFinish() {},
                        function onError() {
                            let onerror = new MusicEmbed(client, msg).setTitle('Error Playing Track: ' + this.title);
                            msg.reply({ embeds: [onerror] }).catch(() => msg.channel.send({ embeds: [onerror] }));
                        }
                    );

                    subscription.add(track);
                }

                console.log('Music Commands >> play: Added Playlist:'.magenta);
                console.log({
                    Title: data.title,
                    URL: data.url
                });

                let enqueued = new MusicEmbed(client, msg, 'enqueued', data);
                return reply.edit({ embeds: [enqueued] });
            }

			const track = new Track(
                data,
                msg.author,
                function onStart() {
                    let onstart = new MusicEmbed(client, msg, 'playing', this);
                    msg.channel.send({ embeds: [onstart] });
                },
                function onFinish() {},
                function onError() {
                    let onerror = new MusicEmbed(client, msg).setTitle('Error Playing Track: ' + this.title);
                    msg.channel.send({ embeds: [onerror] });
                }
            );
			
            console.log('Music Commands >> play: Added Track:'.magenta);
            console.log({
                Title: track.title,
                Duration: track.duration,
                URL: track.url
            });

			subscription.add(track);
            let enqueued = new MusicEmbed(client, msg, 'enqueued', track);
			return reply.edit({ embeds: [enqueued] });
		} catch (err) {
            console.log('Music Commands (ERROR) >> play: Error Running Command'.red);
			console.error(err);
            console.log('<------------------------------------------->'.red);
            
            let embed = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
        }
    }
};