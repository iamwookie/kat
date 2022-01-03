const DiscordVoice = require('@discordjs/voice');
const VoiceSubscription = require('@music/subscription');
const Track = require('@music/track');
const play = require('play-dl');

module.exports = {
    name: 'play',
    description: 'Play a track or add it to the queue.',
    group: 'Music',
    cooldown: 5,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId);
        let channel = msg.member.voice.channel;

        if (!msg.member.voice.channel) return msg.reply('You are not in a voice channel!');

        if (!args) {
            if (subscription) {
                if (subscription.isDestroyed()) {
                    msg.reply('Resuming the queue!')
                    return createNewSub(subscription);
                }

                if (subscription.isReady() && subscription.channel !== msg.member.voice.channel) {
                    if (subscription.channel.members.size > 1) {
                        return msg.reply('I\'m busy with others!')
                    } else {
                       return this.reconnect(channel)
                    }
                } else if (subscription.isPaused()) {
                    return subscription.unpause()
                } else {
                    return msg.reply('Already playing!')
                }
            } else {
                return msg.reply('What should I play?')
            }
        }

        if (!subscription || subscription.isDestroyed()) {
            subscription = createNewSub(subscription);
        } else {
            await subscription.ready(20000)
        }

        try {
            const reply = await msg.reply('Searching...')
            const search = await play.search(args, { limit : 1 });
            const vid = search[0]

			const track = new Track(
                vid,
                function onStart() {
                    msg.channel.send(`Now Playing: **${this.title} [${this.duration}]**`)
                }
            )
			
            console.log('MUSIC >> Playing / Added Track:')
            console.log(track);

			subscription.add(track);
			return reply.edit(`Enqueued: **${track.title} [${track.duration}]**`);
		} catch (err) {
			console.error(err);
			return reply.edit('Failed to play track, please try again later!');
		}

        function createNewSub(cached) {
            sub = new VoiceSubscription(
                client,
                DiscordVoice.joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                }),
                channel
            );

            if (cached) sub.merge(cached)

            sub.voice.on('error', console.error);
            client.subscriptions.set(msg.guildId, sub);
            
            return sub;
        }
    }
};