import { YouTubeTrack, SpotifyTrack } from './Track.js';
import { YouTubePlaylist, SpotifyPlaylist } from './Playlist.js';
import { Guild, VoiceBasedChannel, TextBasedChannel, Message } from 'discord.js';
import { Player, Node, TrackExceptionEvent, TrackStartEvent, TrackEndEvent } from 'shoukaku';
import { Dispatcher } from './Dispatcher.js';
import { Events } from '../interfaces/Events.js';

export class Subscription {
    public queue: (YouTubeTrack | SpotifyTrack)[];
    public active: YouTubeTrack | SpotifyTrack | null;
    public position: number;
    public volume: number;
    public looped: boolean;
    public destroyed: boolean;
    public message?: Message;

    // Use options interface here in the future
    constructor(
        private dispatcher: Dispatcher,
        public guild: Guild,
        public voiceChannel: VoiceBasedChannel,
        public textChannel: TextBasedChannel,
        public player: Player,
        public node: Node
    ) {
        this.dispatcher = dispatcher;

        this.queue = [];
        this.active = null;
        this.position = 0;
        this.looped = false;
        this.volume = 100;
        this.destroyed = false;

        this.player.on('exception', (data: TrackExceptionEvent) => this.dispatcher.client.emit(Events.PlayerException, this, data));
        this.player.on('start', (data: TrackStartEvent) => this.dispatcher.client.emit(Events.PlayerStart, this, data));
        this.player.on('end', (data: TrackEndEvent) => this.dispatcher.client.emit(Events.PlayerEnd, this, data));

        // -----> REQUIRES FIXING FROM SHOUKAKU
        //
        // this.player.on("closed", (reason) => {
        //     this.client.logger.warn(`Music >> Closed Connection in ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`);
        //     this.destroy();
        // });
    }

    public process() {
        const track = this.looped ? this.active : this.queue.shift();
        if (!track) return;

        this.active = track;
        this.player.setVolume(this.volume / 100);
        this.player.playTrack({ track: track.data.track });

        if (!this.looped) {
            this.position += 1;
            this.dispatcher.client.emit(Events.TrackRemove, this, track);
        }
    }

    public destroy(): void {
        if (this.destroyed) return;

        this.queue = [];
        this.active = null;
        this.player.connection.disconnect();
        this.dispatcher.subscriptions.delete(this.guild.id);
        this.destroyed = true;

        this.dispatcher.client.emit('subscriptionDestroy', this);
    }

    public add(item: YouTubeTrack | SpotifyTrack | YouTubePlaylist | SpotifyPlaylist): void {
        if (item instanceof YouTubePlaylist) {
            this.queue.push(...item.tracks);
        } else if (item instanceof SpotifyPlaylist) {
            this.queue.push(...item.tracks);
        } else {
            this.queue.push(item);
        }

        this.dispatcher.client.emit(Events.TrackAdd, this, item);

        if (!this.active) this.process();
    }

    public stop(): Subscription {
        this.looped = false;
        this.active = null;
        this.player.stopTrack();
        return this;
    }

    public pause(): boolean {
        if (!this.active) return true;
        this.player.setPaused(true);
        this.dispatcher.client.emit(Events.PlayerPause, this, this.active);
        return this.paused;
    }

    public resume(): boolean {
        if (!this.active) return false;
        this.player.setPaused(false);
        this.dispatcher.client.emit(Events.PlayerResume, this, this.active);
        return this.paused;
    }

    public loop(): boolean {
        this.looped = !this.looped;
        this.dispatcher.client.emit(Events.PlayerLoop, this, this.active);
        return this.looped;
    }

    // Getters

    public get duration() {
        return this.player.position;
    }

    public get paused() {
        return this.player.paused;
    }
}
