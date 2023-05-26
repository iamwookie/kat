import { KATClient as Client } from '../Client.js';
import { SpotifyPlaylist, SpotifyTrack, YouTubePlaylist, YouTubeTrack } from './Track.js';
import { Guild, VoiceBasedChannel, TextBasedChannel, Message } from 'discord.js';
import { Shoukaku, Player, Node } from 'shoukaku';
import { NodeError, PlayerError } from '@utils/errors.js';

export class Subscription {
    public shoukaku: Shoukaku;
    public queue: (YouTubeTrack | SpotifyTrack)[] = [];
    public active: YouTubeTrack | SpotifyTrack | null = null;
    public position = 0;
    public looped = false;
    public volume = 100;
    public message?: Message;
    public destroyed = false;

    constructor(
        public client: Client,
        public guild: Guild,
        public voiceChannel: VoiceBasedChannel,
        public textChannel: TextBasedChannel,
        public player: Player,
        public node: Node
    ) {
        this.shoukaku = client.shoukaku;

        this.player.on('exception', (data) => this.client.emit('playerException', this, data));
        this.player.on('start', (data) => this.client.emit('playerStart', this, data));
        this.player.on('end', (reason) => this.client.emit('playerEnd', this, reason));
        
        // -----> REQUIRES FIXING FROM SHOUKAKU
        //
        // this.player.on("closed", (reason) => {
        //     this.client.logger.warn(`Music >> Closed Connection in ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`);
        //     this.destroy();
        // });
    }

    static async create(client: Client, guild: Guild, voiceChannel: VoiceBasedChannel, textChannel: TextBasedChannel) {
        try {
            const node = client.shoukaku.getNode();
            if (!node) throw new NodeError("Node doesn't exist.");

            try {
                const player: Player = await node.joinChannel({
                    guildId: guild.id,
                    channelId: voiceChannel.id,
                    shardId: 0,
                    deaf: true,
                });

                const subscription = new Subscription(client, guild, voiceChannel, textChannel, player, node);

                const position = await client.cache.queue.count(guild.id);
                subscription.position = position;

                const res = await client.cache.music.get(guild.id);
                if (res?.volume) subscription.volume = res.volume;

                client.subscriptions.set(guild.id, subscription);
                client.emit('subscriptionCreate', subscription);

                return subscription;
            } catch (err) {
                client.logger.error(err, 'PlayerError', 'Music');
                throw new PlayerError((err as Error).message);
            }
        } catch (err) {
            client.logger.error(err, 'NodeError', 'Music');
            throw new NodeError((err as Error).message);
        }
    }

    destroy() {
        if (this.destroyed) return;
        this.queue = [];
        this.active = null;
        this.player.connection.disconnect();
        this.client.subscriptions.delete(this.guild.id);
        this.destroyed = true;

        this.client.emit('subscriptionDestroy', this);
    }

    process() {
        const track = this.looped ? this.active : this.queue.shift();
        if (!track) return;

        this.active = track;
        this.player.setVolume(this.volume / 100);
        this.player.playTrack({ track: track.data.track });

        if (!this.looped) {
            this.position += 1;
            this.client.emit('trackRemove', this, track);
        }
    }

    add(item: YouTubeTrack | SpotifyTrack | YouTubePlaylist | SpotifyPlaylist) {
        if (item instanceof YouTubePlaylist) {
            for (const data of item.tracks) {
                const track = new YouTubeTrack(this.client, data, item.requester, item.textChannel);
                this.queue.push(track);
            }
        } else if (item instanceof SpotifyPlaylist) {
            for (const data of item.tracks) {
                const track = new SpotifyTrack(this.client, data, item.requester, item.textChannel);
                this.queue.push(track);
            }
        } else {
            this.queue.push(item);
        }

        this.client.emit('trackAdd', this, item);

        if (!this.active) this.process();
    }

    stop() {
        this.looped = false;
        this.active = null;
        return this.player.stopTrack();
    }

    pause() {
        if (!this.active) return;
        this.player.setPaused(true);
        this.client.emit('trackPause', this, this.active);
        return this.paused;
    }

    resume() {
        if (!this.active) return;
        this.player.setPaused(false);
        this.client.emit('trackResume', this, this.active);
        return this.paused;
    }

    loop() {
        this.looped = !this.looped;
        this.client.emit('trackLoop', this, this.active);
        return this.looped;
    }

    // Getters

    get duration() {
        return this.player.position;
    }

    get paused() {
        return this.player.paused;
    }
}
