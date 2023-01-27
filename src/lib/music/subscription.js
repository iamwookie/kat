const {
    createAudioPlayer,
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus,
    VoiceConnectionDisconnectReason,
    AudioPlayerStatus
} = require('@discordjs/voice');

class MusicSubscription {
    constructor(interaction, voiceConnection, voiceChannel) {
        this.client = interaction.client;

        this.voice = voiceConnection;
        this.player = createAudioPlayer();

        this.guild = voiceChannel.guild;
        this.voiceChannel = voiceChannel;
        this.textChannel = interaction.channel;

        this.queue = [];

        this.#initializeListeners();

        this.voice.subscribe(this.player);

        this.voice.on('error', (err) => {
            console.error('Music (VOICE) >> Voice Error'.red);
            console.error(err);

            this.client.logger?.error(err);
        });
    }

    #initializeListeners() {
        // Configure voice connection

        this.voice.on('stateChange', async (_, newState) => {
            if (newState.status == VoiceConnectionStatus.Disconnected) {
                this.client.logger?.warn('Music (VOICE) >> Connection Disconnected'.yellow);

                if (newState.reason == VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode == 4014) {
                    this.client.logger?.warn('Music (VOICE) >> Connection Disconnected (Code 4014)'.yellow);
                    await this.#connect(5000);
                } else if (voice.rejoinAttempts < 5) {
                    voice.rejoinAttempts + 1;
                    voice.rejoin();
                } else {
                    voice.destroy();
                }
            } else if (newState.status == VoiceConnectionStatus.Destroyed) {
                this.client.logger?.warn('Music >> (VOICE) Connection Destroyed'.yellow);

                this.destroy();
            } else if (!this.readyLock && (newState.status == VoiceConnectionStatus.Connecting || newState.status == VoiceConnectionStatus.Signalling)) {
                // this.client.logger?.warn('Music >> (VOICE) Connection Connecting / Signalling'.yellow);
                await this.#connect(20_000);
            }
        });

        // Configure audio player
        this.player.on('stateChange', (oldState, newState) => {
            // this.client.logger?.info(`Music (PLAYER) >> Previous State: ${oldState.status}`.magenta);
            // this.client.logger?.info(`Music (PLAYER) >> New State: ${newState.status}`.magenta);

            if (newState.status == AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                this.active = null;
                oldState.resource.metadata.onFinish();
                this.#process();
            } else if (newState.status == AudioPlayerStatus.Playing && oldState.status !== AudioPlayerStatus.AutoPaused) {
                this.client.logger?.info('Music (PLAYER) >> Playing Track: '.green);
                console.log({
                    Title: this.active.title,
                    Duration: this.active.duration,
                    URL: this.active.url,
                    Guild: `${this.guild.name} (${this.guild.id})`
                });
                if (oldState.status !== AudioPlayerStatus.Paused) newState.resource.metadata.onStart();
            }
        });
    }

    async #connect(timeout) {
        if (!this.readyLock) {
            try {
                await entersState(this.voice, VoiceConnectionStatus.Ready, timeout);
                // this.client.logger?.info('Music (VOICE) >> Connection Ready'.brightGreen);
            } catch (err) {
                if (this.voice.state.status !== VoiceConnectionStatus.Destroyed) this.voice.destroy();
            } finally {
                this.readyLock = false;
            }
        }
    }

    async #process() {
        if (this.queueLocked || this.player.state.status !== AudioPlayerStatus.Idle) return;

        this.queueLocked = true;
        if (!this.isVoiceReady()) await this.#connect(20000);

        const track = this.queue.shift();
        if (!track) return this.destroy();

        try {
            const resource = await track.createResource();
            this.player.play(resource);
            this.queueLocked = false;
            this.active = track;
        } catch (err) {
            console.error('Music (ERROR) >> Error Playing Track'.red);
            console.error(err);

            this.client.logger?.error(err);

            track.onError(err);
            this.queueLocked = false;
            this.#process();
        }
    }

    static async create(interaction, voiceChannel) {
        // remove in future

        try {
            const sub = new MusicSubscription(
                interaction,
                joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                }),
                voiceChannel
            );

            interaction.client.subscriptions.set(voiceChannel.guild.id, sub);
            interaction.client.logger?.info(`Music >> Subscription Created: ${sub.guild.name} (${sub.guild.id})`.brightGreen);

            return sub;
        } catch (err) {
            console.error('Music (ERROR) >> Error Creating Subscription');
            console.error(err);

            interaction.client.logger?.error(err);
        }
    }

    destroy() {
        if (!this.isVoiceDestroyed()) this.voice.destroy();
        this.client.subscriptions.delete(this.guild.id);
        this.client.logger?.warn(`Music >> Subscription Destroyed: ${this.guild.name} (${this.guild.id})`.yellow);
    }

    // Actions

    async add(track) {
        this.queue.push(track);
        await this.#process();
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

    // Booleans

    isVoiceReady() {
        return (this.voice.state.status == VoiceConnectionStatus.Ready);
    }

    isVoiceDestroyed() {
        return (this.voice.state.status == VoiceConnectionStatus.Destroyed);
    }

    isPlayerPlaying() {
        return (this.player.state.status == AudioPlayerStatus.Playing);
    }

    isPlayerPaused() {
        return (this.player.state.status == AudioPlayerStatus.Paused);
    }
}

module.exports = MusicSubscription;