const VoiceSubscription = require('@music/subscription');
const Track = require('@music/track');
const play = require('play-dl');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'play',
    group: 'Music',
    description: 'Search for a track and play it or add it to the queue.',
    format: '<search> / [prefix]play spotify <url>',
    cooldown: 5,
    guildOnly: true,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId);
        let argsArray = args.split(' ');
        
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
            if (argsArray[0].toLowerCase() == 'spotify') {
                let embed = new MusicEmbed(client, msg, 'searching-spotify');
                reply = await msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
                try {
                    if (play.is_expired()) await play.refreshToken();
                    let search = await play.spotify(argsArray[1]);
                    query = search.name + ' - ' + search.artists[0].name;
                } catch(err) {
                    console.log('MUSIC (COMMAND) >> PLAY SPOTIFY SEARCH ERROR'.red);
                    console.log(err);
                    console.log('<------------------------------------------->'.red);

                    let notFound = new MusicEmbed(client, msg).setTitle('You have not provided a valid Spotify URL!');
                    reply.edit({ embeds: [notFound] });
                    return subscription.destroy();
                }
            } else {
                let embed = new MusicEmbed(client, msg, 'searching');
                reply = await msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
                query = args;
            }

            let search = await play.search(query, { limit : 1, source: { youtube: 'video' } });
            vid = search[0];

            if (!vid) {
                let notFound = new MusicEmbed(client, msg).setTitle('Couldn\'t find your search result. Try again!');
                reply.edit({ embeds: [notFound] });
                return subscription.destroy();
            }

			const track = new Track(
                vid,
                msg.author,
                function onStart() {
                    let embed = new MusicEmbed(client, msg, 'playing', this);
                    msg.channel.send({ embeds: [embed] });
                },
                function onFinish() {},
                function onError() {
                    let embed = new MusicEmbed(client, msg).setTitle('Error Playing Track: ' + this.title);
                    msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
                }
            )
			
            console.log('MUSIC >> Added Track:'.magenta);
            console.log({
                Title: track.title,
                Duration: track.duration,
                URL: track.url
            });

			subscription.add(track);
            embed = new MusicEmbed(client, msg, 'enqueued', track);
			return reply.edit({ embeds: [embed] });
		} catch (err) {
            console.log('MUSIC (COMMAND) >> PLAY ERROR'.red);
			console.error(err);
            console.log('<------------------------------------------->'.red);
            
            let embed = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
        }
    }
};