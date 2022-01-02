const DiscordVoice = require('@discordjs/voice');

class VoiceSubscription {
	constructor(client, voiceConnection, channel) {
		this.client = client;
		this.voice = voiceConnection;
		this.channel = channel;
		this.player = DiscordVoice.createAudioPlayer();
		this.queueLocked = false;
		this.queue = [];

		this.voice.on('stateChange', async (_, newState) => {
			if (newState.status == DiscordVoice.VoiceConnectionStatus.Disconnected) {
				if (newState.reason == DiscordVoice.VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode == 4014) {
					console.log('MUSIC >> Connection Disconnected (Code 4014)')
					try {
						await DiscordVoice.entersState(this.voice, DiscordVoice.VoiceConnectionStatus.Connecting, 5000);
						console.log('MUSIC >> Connection Ready')
					} catch {
						this.voice.destroy();
					}
				} else if (this.voice.rejoinAttempts < 5) {
					await wait((this.voice.rejoinAttempts + 1) * 5_000);
					this.voice.rejoin();
				} else {
					this.voice.destroy();
				}
			} else if (newState.status == DiscordVoice.VoiceConnectionStatus.Destroyed) {
				console.log('MUSIC >> Connection Destroyed')
				this.clear();
				this.client.subscriptions.delete(this.channel.guildId);
			} else if (!this.readyLock && (newState.status == DiscordVoice.VoiceConnectionStatus.Connecting || newState.status == DiscordVoice.VoiceConnectionStatus.Signalling)) {
				console.log('MUSIC >> Connection Connecting / Signalling')
				this.readyLock = true;
				try {
					await DiscordVoice.entersState(this.voice, DiscordVoice.VoiceConnectionStatus.Ready, 20_000);
					console.log('MUSIC >> Connection Ready')
				} catch {
					if (this.voice.state.status !== DiscordVoice.VoiceConnectionStatus.Destroyed) this.voice.destroy();
				} finally {
					this.readyLock = false;
				}
			}
		});

		// Configure audio player
		this.player.on('stateChange', (oldState, newState) => {
			if (newState.status == DiscordVoice.AudioPlayerStatus.Idle && oldState.status !== DiscordVoice.AudioPlayerStatus.Idle) {
				this.playing = null;
				oldState.resource.metadata.onFinish();
				this.refresh();
			} else if (newState.status == DiscordVoice.AudioPlayerStatus.Playing) {
				// If the Playing state has been entered, then a new track has started playback.
				newState.resource.metadata.onStart();
			}
		});

		voiceConnection.subscribe(this.player);
	}

	pause() {
		this.player.pause();
		return this.paused = true;
	}

	unpause() {
		this.player.unpause();
		return this.paused = false
	}

	add(track) {
		this.queue.push(track);
		return this.refresh();
	}

	clear() {
		this.queue = [];
		return this.player.stop(true);
	}

	async refresh() {
		if (this.queueLocked || this.player.state.status !== DiscordVoice.AudioPlayerStatus.Idle || this.queue.length == 0) {
			return;
		}

		this.queueLocked = true;

		const track = this.queue.shift();

		try {
			const resource = await track.createResource();
			this.player.play(resource);
			this.queueLocked = false;
			return this.playing = track;
		} catch (err) {
			console.log("MUSIC >> ERROR PLAYING TRACK");
			console.log(err)
			this.queueLocked = false;
			return this.refresh();
		}
	}

	queueString() {
		if (this.queue.length) {
			let res = ''
			let c = 1
            res += 'Queue: \n'
            for (const track of this.queue) {
                res += `${c}) ${track.title} [${track.duration}]\n`
                c++
            }
			return res
		}
	}
}

module.exports = VoiceSubscription;