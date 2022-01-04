const DiscordVoice = require('@discordjs/voice');

class VoiceSubscription {
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
				console.log('MUSIC >> Connection Disconnected')
				if (newState.reason == DiscordVoice.VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode == 4014) {
					console.log('MUSIC >> Connection Disconnected (Code 4014)')
					await this.ready(5000);
				} else if (this.voice.rejoinAttempts < 5) {
					this.voice.rejoinAttempts + 1
					this.voice.rejoin();
				} else {
					this.voice.destroy();
				}
			} else if (newState.status == DiscordVoice.VoiceConnectionStatus.Destroyed) {
				console.log('MUSIC >> Connection Destroyed\n')
			} else if (!this.readyLock && (newState.status == DiscordVoice.VoiceConnectionStatus.Connecting || newState.status == DiscordVoice.VoiceConnectionStatus.Signalling)) {
				console.log('MUSIC >> Connection Connecting / Signalling')
				await this.ready(20000)
			}
		});

		// Configure audio player
		this.player.on('stateChange', (oldState, newState) => {
			if (newState.status == DiscordVoice.AudioPlayerStatus.Idle && oldState.status !== DiscordVoice.AudioPlayerStatus.Idle) {
				console.log('MUSIC >> Player Finished')

				this.playing = null;
				oldState.resource.metadata.onFinish();

				if (this.queue.length == 0) {
					this.voice.destroy();
				} else {
					this.refresh();
				}
			} else if (newState.status == DiscordVoice.AudioPlayerStatus.Playing) {
				console.log('MUSIC >> Player Playing')
				console.log(this.playing)
				
				newState.resource.metadata.onStart();
			}
		});

		this.voice.subscribe(this.player);
	}

	async ready(timeout) {
		if (!this.readyLock) {
			this.readyLock = true;
			try {
				await DiscordVoice.entersState(this.voice, DiscordVoice.VoiceConnectionStatus.Ready, timeout);
				console.log('MUSIC >> Connection Ready')
			} catch(err) {
				if (this.voice.state.status !== DiscordVoice.VoiceConnectionStatus.Destroyed) this.voice.destroy();
			} finally {
				this.readyLock = false;
			}
		}
	}

	destruct() {
		if (!this.isVoiceDestroyed()) this.voice.destroy();
        this.client.subscriptions.delete(this.guild.id);
		return console.log('MUSIC >> Subscription Destroyed\n')
	}

	async refresh() {
		if (this.queueLocked || this.player.state.status !== DiscordVoice.AudioPlayerStatus.Idle) return;

		this.queueLocked = true;

		const track = this.queue.shift();

		try {
			const resource = await track.createResource();
			this.player.play(resource);
			return this.playing = track;
		} catch (err) {
			console.log('MUSIC >> ERROR PLAYING TRACK');
			console.log(err)
			return this.refresh();
		} finally {
			this.queueLocked = false;
		}
	}

	merge(sub) {
		if (sub.isVoiceDestroyed()) {
			this.queue.push(sub.playing);
			this.queue = this.queue.concat(sub.queue);
			this.refresh();
			return console.log('MUSIC >> Subsciptions Merged')
		}
	}

	isVoiceReady() {
		return (this.voice.state.status == DiscordVoice.VoiceConnectionStatus.Ready);
	}

	isVoiceDestroyed() {
		return (this.voice.state.status == DiscordVoice.VoiceConnectionStatus.Destroyed);
	}

	isPlayerPaused() {
		return (this.player.state.status == DiscordVoice.AudioPlayerStatus.Paused);
	}

	pause() {
		return this.player.pause();
	}

	unpause() {
		return this.player.unpause();
	}

	add(track) {
		this.queue.push(track);
		return this.refresh();
	}

	clear() {
		this.queue = [];
		return this.player.stop(true);
	}
}

module.exports = VoiceSubscription;