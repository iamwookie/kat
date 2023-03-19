import { KATClient } from "@structures/index.js";
import { Guild, VoiceBasedChannel, TextBasedChannel } from "discord.js";
import { YouTubeTrack, SpotifyTrack, TrackMetadata } from "./Track.js";
import {
    createAudioPlayer,
    entersState,
    VoiceConnectionStatus,
    VoiceConnectionDisconnectReason,
    AudioPlayerStatus,
    VoiceConnection,
    AudioPlayer
} from "@discordjs/voice";

import chalk from "chalk";

export class Subscription {
    private queueLocked: boolean = false;
    private readyLock: boolean = false;

    public player: AudioPlayer;
    public guild?: Guild;
    public queue: (YouTubeTrack | SpotifyTrack)[] = [];
    public active: YouTubeTrack | SpotifyTrack | null = null;

    constructor(
        private client: KATClient,
        private voiceConnection: VoiceConnection,
        private voiceChannel: VoiceBasedChannel | null,
        private textChannel: TextBasedChannel | null
    ) {
        this.client = client;
        this.voiceConnection = voiceConnection;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

        this.player = createAudioPlayer();
        this.guild = voiceChannel?.guild;
        this.queue = [];

        this.initializeListeners();

        this.voiceConnection.subscribe(this.player);
    }

    private initializeListeners(): void {
        // Configure voice connection
        this.voiceConnection.on("error", (err) => {
            this.client.logger.error(err);
            console.error(chalk.red("Music (VOICE) >> Voice Error"));
            console.error(err);
        });

        this.voiceConnection.on("stateChange", async (_, newState) => {
            if (newState.status == VoiceConnectionStatus.Disconnected) {
                this.client.logger.warn("Music (VOICE) >> Connection Disconnected");

                if (newState.reason == VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode == 4014) {
                    this.client.logger.warn("Music (VOICE) >> Connection Disconnected (Code 4014)");
                    await this.connect(5000);
                } else if (this.voiceConnection.rejoinAttempts < 5) {
                    this.voiceConnection.rejoinAttempts + 1;
                    this.voiceConnection.rejoin();
                } else {
                    this.voiceConnection.destroy();
                }
            } else if (newState.status == VoiceConnectionStatus.Destroyed) {
                this.client.logger.warn("Music >> (VOICE) Connection Destroyed");

                this.destroy();
            } else if (!this.readyLock && (newState.status == VoiceConnectionStatus.Connecting || newState.status == VoiceConnectionStatus.Signalling)) {
                await this.connect(20_000);
            }
        });

        // Configure audio player
        this.player.on("stateChange", (oldState, newState) => {
            if (newState.status == AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                this.active = null;
                (oldState.resource.metadata as TrackMetadata).onFinish?.();
                this.process();
            } else if (newState.status == AudioPlayerStatus.Playing && oldState.status !== AudioPlayerStatus.AutoPaused) {
                this.client.logger.info(chalk.green("Music (PLAYER) >> Playing Track:"));
                console.log({
                    Title: this.active?.title,
                    Duration: this.active?.duration,
                    URL: this.active?.url,
                    Guild: `${this.guild?.name} (${this.guild?.id})`,
                });

                if (oldState.status !== AudioPlayerStatus.Paused) (newState.resource.metadata as TrackMetadata).onStart?.();
            }
        });
    }

    private async connect(timeout: number): Promise<void> {
        if (!this.readyLock) {
            try {
                await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, timeout);
            } catch (err) {
                if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
            } finally {
                this.readyLock = false;
            }
        }
    }

    private async process(): Promise<void> {
        if (this.queueLocked || this.player.state.status !== AudioPlayerStatus.Idle) return;

        this.queueLocked = true;
        if (!this.isVoiceReady) await this.connect(20000);

        const track = this.queue.shift();
        if (!track) return this.destroy();

        try {
            const resource = await track.createResource();
            this.player.play(resource);
            this.queueLocked = false;
            this.active = track;
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("Music (ERROR) >> Error Playing Track"));
            console.error(err);

            track.onError(err);
            this.queueLocked = false;
            this.process();
        }
    }

    destroy() {
        if (!this.isVoiceDestroyed) this.voiceConnection.destroy();
        this.client.subscriptions.delete(this.guild?.id);
        this.client.logger.warn(`Music >> Subscription Destroyed: ${this.guild?.name} (${this.guild?.id})`);
    }

    // Actions

    add(track: YouTubeTrack | SpotifyTrack) {
        this.queue.push(track);
        this.process();
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

    // Getters

    get isVoiceReady() {
        return this.voiceConnection.state.status == VoiceConnectionStatus.Ready;
    }

    get isVoiceDestroyed() {
        return this.voiceConnection.state.status == VoiceConnectionStatus.Destroyed;
    }

    get isPlayerPlaying() {
        return this.player.state.status == AudioPlayerStatus.Playing;
    }

    get isPlayerPaused() {
        return this.player.state.status == AudioPlayerStatus.Paused;
    }
}
