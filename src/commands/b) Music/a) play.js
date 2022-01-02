const DiscordVoice = require("@discordjs/voice");
const VoiceSubscription = require('@music/subscription');
const Track = require('@music/track');
const play = require('play-dl');

module.exports = {
    name: 'play',
    description: 'Play a track or add it to the queue.',
    group: 'Music',
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)
        let channel = msg.member.voice.channel;

        if (!msg.member.voice.channel) return msg.channel.send("You are not in a voice channel!");

        if (!args) {
            if (subscription) {
                if (subscription.channel !== msg.member.voice.channel) {
                    if (subscription.channel.members.size > 1) {
                        return msg.channel.send("I'm busy with others!")
                    } else {
                        return subscription.voice = DiscordVoice.joinVoiceChannel({
                            channelId: channel.id,
                            guildId: channel.guild.id,
                            adapterCreator: channel.guild.voiceAdapterCreator,
                        })
                    }
                } else if (subscription.paused) {
                    return subscription.unpause()
                } else {
                    return msg.channel.send('Already playing! (No Args)')
                }
            } else {
                return msg.channel.send('What should I play? (No Args)')
            }
        }

        if (!subscription) {
            subscription = new VoiceSubscription(
                client,
                DiscordVoice.joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                }),
                channel
            );
            subscription.voice.on('error', console.error);
            client.subscriptions.set(msg.guildId, subscription);
        }

        try {
			await DiscordVoice.entersState(subscription.voice, DiscordVoice.VoiceConnectionStatus.Ready, 20e3);
            console.log('MUSIC >> Connection Ready (2)')
		} catch (err) {
			return console.error(err);
		}

        try {
            const search = await play.search(args, { limit : 1 });
            const vid = search[0]

			const track = new Track(
                vid,
                function onStart() {
                    msg.channel.send(`Now Playing: **${this.title} [${this.duration}]**`)
                }
            )
			
            console.log("MUSIC >> Playing / Added Track:")
            console.log(track);
			subscription.add(track);
			return msg.channel.send(`Enqueued: **${track.title} [${track.duration}]**`);
		} catch (err) {
			console.error(err);
			return msg.channel.send('Failed to play track, please try again later!');
		}
    }
};