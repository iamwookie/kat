const DiscordVoice = require('@discordjs/voice');

class MusicSubscription {
	constructor(client, voiceConnection, channel) {
		this.client = client;
		this.voice = voiceConnection;
		this.channel = channel;
		this.guild = channel.guild;
		this.player = DiscordVoice.createAudioPlayer();
		this.queue = [];

		// Configure voice connection
		this.voice.on('stateChange', async (_, newState) => {
			if (newState.status == DiscordVoice.VoiceConnectionStatus.Disconnected) {
				console.log('Music (VOICE) >> Connection Disconnected'.yellow);
				if (newState.reason == DiscordVoice.VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode == 4014) {
					console.log('Music (VOICE) >> Connection Disconnected (Code 4014)'.yellow);
					await this.ready(5000);
				} else if (this.voice.rejoinAttempts < 5) {
					this.voice.rejoinAttempts + 1
					this.voice.rejoin();
				} else {
					this.voice.destroy();
				}
			} else if (newState.status == DiscordVoice.VoiceConnectionStatus.Destroyed) {
				console.log('Music >> (VOICE) Connection Destroyed'.yellow);
				this.destroy();
			} else if (!this.readyLock && (newState.status == DiscordVoice.VoiceConnectionStatus.Connecting || newState.status == DiscordVoice.VoiceConnectionStatus.Signalling)) {
				console.log('Music >> (VOICE) Connection Connecting / Signalling'.yellow);
				await this.ready(20000);
			}
		});

		// Configure audio player
		this.player.on('stateChange', (oldState, newState) => {
			console.log(`Music (PLAYER) >> Previous State: ${oldState.status}`.magenta);
			console.log(`Music (PLAYER) >> New State: ${newState.status}`.magenta);
			
			if (newState.status == DiscordVoice.AudioPlayerStatus.Idle && oldState.status !== DiscordVoice.AudioPlayerStatus.Idle) {
				this.playing = null;
				oldState.resource.metadata.onFinish();

				if (this.queue.length == 0) {
					this.voice.destroy();
				} else {
					this.refresh();
				}
			} else if (newState.status == DiscordVoice.AudioPlayerStatus.Playing && oldState.status !== DiscordVoice.AudioPlayerStatus.AutoPaused) {
				console.log({
					Title: this.playing.title,
					Duration: this.playing.duration,
					URL: this.playing.url
				});
				newState.resource.metadata.onStart();
			}
		});

		this.voice.subscribe(this.player);
	}

	static async create(client, channel) {
		try {
			let sub = new MusicSubscription(
				client,
				DiscordVoice.joinVoiceChannel({
					channelId: channel.id,
					guildId: channel.guild.id,
					adapterCreator: channel.guild.voiceAdapterCreator,
				}),
				channel
			);
	
			// if (cached && (cached.playing || cached.queue.length)) sub.merge(cached)
			sub.voice.on('error', (err) => {
				console.error('Music (VOICE) >> Voice Error'.red);
				console.error(err);
			});

			client.subscriptions.set(channel.guild.id, sub);
			return sub;
		} catch (err) {
			console.error('Music (ERROR) >> Error Creating Subscription');
			console.error(err);
			return false;
		}
	}

	async ready(timeout) {
		if (!this.readyLock) {
			this.readyLock = true;
			try {
				await DiscordVoice.entersState(this.voice, DiscordVoice.VoiceConnectionStatus.Ready, timeout);
				console.log('Music (VOICE) >> Connection Ready'.brightGreen);
			} catch(err) {
				if (this.voice.state.status !== DiscordVoice.VoiceConnectionStatus.Destroyed) this.voice.destroy();
				console.error('Music (ERROR) >> Error Readying Voice');
				console.error(err);
			} finally {
				this.readyLock = false;
			}
		}
	}

	destroy() {
		if (!this.isVoiceDestroyed()) this.voice.destroy();
        this.client.subscriptions.delete(this.guild.id);
		console.log('Music >> Subscription Destroyed\n'.yellow);
	}

	/*async merge(sub) {
		if (sub.isVoiceDestroyed()) {
			this.queue.push(sub.playing);
			this.queue = this.queue.concat(sub.queue);
			await this.refresh();
			return console.log('Music >> Subsciptions Merged'.brightGreen);
		}
	}*/

	async refresh() {
		if (this.queueLocked || this.player.state.status !== DiscordVoice.AudioPlayerStatus.Idle) return;

		this.queueLocked = true;
		if (!this.isVoiceReady()) await this.ready(20000);
		const track = this.queue.shift();

		if (track) {
			try {
				const resource = await track.createResource();
				this.player.play(resource);
				this.queueLocked = false;
				this.playing = track;
			} catch (err) {
				console.error('Music (ERROR) >> Error Playing Track'.red);
				console.error(err)
				track.onError(err);
				this.queueLocked = false;
				this.refresh();
			}
		}
	}

	add(track) {
		this.queue.push(track);
		this.refresh();
	}

	clear() {
		this.queue = [];
		return this.player.stop(true);
	}

	pause() {
		return this.player.pause();
	}

	unpause() {
		return this.player.unpause();
	}

	// BOOLEANS

	isVoiceReady() {
		return (this.voice.state.status == DiscordVoice.VoiceConnectionStatus.Ready);
	}

	isVoiceDestroyed() {
		return (this.voice.state.status == DiscordVoice.VoiceConnectionStatus.Destroyed);
	}

	isPlayerPlaying() {
		return (this.player.state.status == DiscordVoice.AudioPlayerStatus.Playing);
	}

	isPlayerPaused() {
		return (this.player.state.status == DiscordVoice.AudioPlayerStatus.Paused);
	}
}

module.exports = MusicSubscription;